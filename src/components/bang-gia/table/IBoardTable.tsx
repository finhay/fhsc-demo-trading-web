'use client';

import {
    type ColumnDef,
    type SortingState,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useRouter } from 'next/router';

import { IBoardTableBody } from '@/components/bang-gia/table/IBoardTableBody';
import { IBoardTableHeader } from '@/components/bang-gia/table/IBoardTableHeader';
import { EmptyState } from '@/components/common/feature/EmptyState';
import { Spinner } from '@/components/common/ui/Spinner';
import { Tooltip } from '@/components/common/ui/Tooltip';
import { TradeQuickPanel } from '@/components/giao-dich/panel/TradeQuickPanel';
import { AUTH_MODE } from '@/constants/auth';
import { IBOARD_BID_ASK_PRICE_KEYS } from '@/constants/iboard';
import { TRADE_LITERAL } from '@/constants/trading';
import { useMQTT } from '@/hooks/useMQTT';
import { useTranslate } from '@/hooks/useTranslate';
import { StockPriceMessage } from '@/proto/stock';
import {
    decodeOddLotStockPriceProtobufByQueryParam,
    decodeStockPriceProtobufByQueryParam,
} from '@/services/api/datafeed/stock-info';
import { useAuthFlowStore } from '@/stores/auth/useAuthFlowStore';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useMarketIndexStore } from '@/stores/common/useMarketIndexStore';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';
import { getOrderedWatchlistSymbols, useWatchlistStore } from '@/stores/common/useWatchlistStore';
import type { ColumnKey, IboardDisplayRow, IboardRealtimeCellBgMap } from '@/types/pages/iboard';
import { toStockPriceMessage } from '@/utils/common';
import {
    applyIboardMqttBatch,
    buildRealtimeTopicsByExchange,
    createAlphanumericSortFn,
    createNumericSortFn,
    getIboardCellColor,
    getIboardColumnWidthPercents,
    getIboardTableWidthPx,
    getQueryForExchange,
    getVisibleLeafColumns,
    normalizeIboardRow,
    renderIboardValue,
} from '@/utils/iboard';

export const IBoardTable = () => {
    const trans = useTranslate();
    const router = useRouter();
    const { exchange } = useMarketIndexStore();
    const { selectedSearchStock, fetchStockInfo } = useStockInfoStore();
    const { currentWatchList, isOwnedLoading } = useWatchlistStore();
    const { profile } = useAuthStore();
    const { openAuthDialog } = useAuthFlowStore();
    const [stocks, setStocks] = useState<IboardDisplayRow[]>([]);
    const [tradeAnchor, setTradeAnchor] = useState<{
        symbol: string;
        side: string;
        price: number;
        rect: DOMRect;
    } | null>(null);
    const rawStocksRef = useRef<StockPriceMessage[]>([]);

    const [realtimeCellBgMap, setRealtimeCellBgMap] = useState<IboardRealtimeCellBgMap>({});
    const [isLoading, setIsLoading] = useState(true);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [totalMetric, setTotalMetric] = useState<string>('vol');
    const resetRealtimeTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
    const pendingMqttRef = useRef<Map<string, StockPriceMessage>>(new Map());
    const rafMqttRef = useRef<number | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const getSortDesc = useCallback(
        (columnId: string) => sorting.find((s) => s.id === columnId)?.desc ?? false,
        [sorting],
    );
    const numericSortFn = useMemo(
        () => createNumericSortFn<IboardDisplayRow>(getSortDesc),
        [getSortDesc],
    );
    const alphanumericSortFn = useMemo(
        () => createAlphanumericSortFn<IboardDisplayRow>(getSortDesc),
        [getSortDesc],
    );

    const stockSymbolsKey = useMemo(() => stocks.map((stock) => stock.symbol).join(','), [stocks]);
    const selectedSymbol = selectedSearchStock?.symbol ?? '';
    const watchlistDataKey = useMemo(() => {
        if (!currentWatchList) return '';
        const watchListId = currentWatchList.watchListId ?? currentWatchList.id;
        const symbolsKey = getOrderedWatchlistSymbols(currentWatchList).join(',');
        return `${watchListId}:${symbolsKey}`;
    }, [currentWatchList]);
    const mqttTopics = useMemo(() => {
        if (!stockSymbolsKey) return [];
        return buildRealtimeTopicsByExchange(stockSymbolsKey.split(','), exchange);
    }, [stockSymbolsKey, exchange]);

    const handlePriceCellClick = useCallback(
        async (key: ColumnKey, symbol: string, price: number, rect: DOMRect) => {
            const side = key.startsWith('bid') ? TRADE_LITERAL.BUY : TRADE_LITERAL.SELL;
            if (!profile) {
                openAuthDialog(AUTH_MODE.LOGIN);
                return;
            }
            await fetchStockInfo(symbol);
            setTradeAnchor({ symbol, side, price, rect });
        },
        [profile, openAuthDialog, fetchStockInfo],
    );

    const columns = useMemo<ColumnDef<IboardDisplayRow>[]>(() => {
        const makeLeafColumn = (key: ColumnKey, label: string): ColumnDef<IboardDisplayRow> => ({
            id: key,
            accessorFn: (row) => row[key],
            sortingFn: key === 'symbol' ? alphanumericSortFn : numericSortFn,
            header: () => <span className="font-tiny-highlight text-secondary">{label}</span>,
            cell: ({ row }) => {
                const display = row.original;
                const rawStock = display._raw;
                const value = display[key];
                const colorClass = getIboardCellColor(key, rawStock);
                const isSymbol = key === 'symbol';
                const isTradablePriceCell = IBOARD_BID_ASK_PRICE_KEYS.has(key);

                if (isSymbol) {
                    return (
                        <button
                            type="button"
                            onClick={() =>
                                router.push({
                                    pathname: '/giao-dich',
                                    query: { symbol: display.symbol },
                                })
                            }
                            className={`block w-full min-w-0 cursor-pointer truncate text-left font-tiny-highlight hover:underline ${colorClass}`}
                        >
                            {renderIboardValue(key, value)}
                        </button>
                    );
                }

                const valueSpan = (
                    <span
                        className={`block w-full min-w-0 truncate text-right font-tiny tabular-nums ${colorClass}`}
                    >
                        {renderIboardValue(key, value)}
                    </span>
                );

                if (isTradablePriceCell && value != null) {
                    return (
                        <Tooltip
                            content={trans.iboard.price_cell_trade_tooltip}
                            placement="right"
                            variant="light"
                            className="block w-full min-w-0"
                        >
                            <button
                                type="button"
                                onClick={(event) =>
                                    handlePriceCellClick(
                                        key,
                                        display.symbol,
                                        value as number,
                                        event.currentTarget.getBoundingClientRect(),
                                    )
                                }
                                className={`block w-full min-w-0 cursor-pointer truncate text-right font-tiny tabular-nums ${colorClass}`}
                            >
                                {renderIboardValue(key, value)}
                            </button>
                        </Tooltip>
                    );
                }

                return valueSpan;
            },
        });

        const visibleLeaves = getVisibleLeafColumns(totalMetric);

        return visibleLeaves.map((column) => {
            const leafKey = `leaf_${column.key}` as keyof typeof trans.iboard;
            const label = (trans.iboard[leafKey] as string | undefined) ?? column.label;
            return makeLeafColumn(column.key, label);
        });
    }, [alphanumericSortFn, numericSortFn, totalMetric, trans.iboard, handlePriceCellClick]);

    const clearRealtimeHighlight = useCallback((symbol: string, field: string) => {
        setRealtimeCellBgMap((prev) => {
            if (!prev[symbol]?.[field]) return prev;
            const nextForSymbol = { ...(prev[symbol] ?? {}) };
            delete nextForSymbol[field];
            const nextMap = { ...prev };
            if (Object.keys(nextForSymbol).length === 0) {
                delete nextMap[symbol];
            } else {
                nextMap[symbol] = nextForSymbol;
            }
            return nextMap;
        });
    }, []);

    const flushMqttBatch = useCallback(() => {
        rafMqttRef.current = null;
        const batch = new Map(pendingMqttRef.current);
        pendingMqttRef.current.clear();
        if (batch.size === 0) return;

        const { nextStocks, bgMerge, timerSpecs } = applyIboardMqttBatch(
            rawStocksRef.current,
            batch,
        );
        rawStocksRef.current = nextStocks;

        if (Object.keys(bgMerge).length > 0) {
            setRealtimeCellBgMap((prev) => {
                const merged = { ...prev };
                for (const [sym, fields] of Object.entries(bgMerge)) {
                    merged[sym] = { ...(merged[sym] ?? {}), ...fields };
                }
                return merged;
            });
            timerSpecs.forEach(({ symbol, field }) => {
                const timerKey = `${symbol}-${field}`;
                if (resetRealtimeTimersRef.current[timerKey]) {
                    clearTimeout(resetRealtimeTimersRef.current[timerKey]);
                }
                resetRealtimeTimersRef.current[timerKey] = setTimeout(() => {
                    clearRealtimeHighlight(symbol, field);
                    delete resetRealtimeTimersRef.current[timerKey];
                }, 800);
            });
        }

        setStocks(nextStocks.map(normalizeIboardRow));
    }, [clearRealtimeHighlight]);

    const scheduleMqttFlush = useCallback(() => {
        if (rafMqttRef.current != null) return;
        rafMqttRef.current = requestAnimationFrame(() => {
            flushMqttBatch();
        });
    }, [flushMqttBatch]);

    const handleMQTTMessage = useCallback(
        (_topic: string, message: Buffer) => {
            const update = StockPriceMessage.decode(new Uint8Array(message));
            if (!update.symbol) return;
            pendingMqttRef.current.set(update.symbol, update);
            scheduleMqttFlush();
        },
        [scheduleMqttFlush],
    );

    const applyRawStocks = (raw: StockPriceMessage[]) => {
        rawStocksRef.current = raw;
        setStocks(raw.map(normalizeIboardRow));
    };

    const fetchData = async () => {
        try {
            setIsLoading(true);

            if (selectedSearchStock?.symbol) {
                applyRawStocks([toStockPriceMessage(selectedSearchStock)]);
            } else if (currentWatchList) {
                applyRawStocks((currentWatchList.items ?? []).map(toStockPriceMessage));
            } else if (exchange) {
                const query = getQueryForExchange(exchange);
                const isOddLot = exchange.startsWith('LO-LE-');
                const stockData = isOddLot
                    ? await decodeOddLotStockPriceProtobufByQueryParam(query.name, query.value)
                    : await decodeStockPriceProtobufByQueryParam(query.name, query.value);
                applyRawStocks(stockData.stockPrices || []);
            } else {
                applyRawStocks([]);
            }
        } catch {
            applyRawStocks([]);
        } finally {
            setIsLoading(false);
        }
    };

    useMQTT(mqttTopics, handleMQTTMessage, mqttTopics.length > 0);

    useEffect(() => {
        fetchData();
    }, [exchange, watchlistDataKey, selectedSymbol]);

    useEffect(() => {
        return () => {
            if (rafMqttRef.current != null) {
                cancelAnimationFrame(rafMqttRef.current);
            }
            Object.values(resetRealtimeTimersRef.current).forEach((timer) => clearTimeout(timer));
        };
    }, []);

    const table = useReactTable({
        data: stocks,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getRowId: (row) => row.symbol,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const toggleTotalMetric = useCallback(() => {
        setTotalMetric((prev) => (prev === 'vol' ? 'val' : 'vol'));
        setSorting((sortState) => {
            const first = sortState[0];
            if (!first) return sortState;
            if (first.id === 'totalVol') return [{ id: 'totalVal', desc: first.desc }];
            if (first.id === 'totalVal') return [{ id: 'totalVol', desc: first.desc }];
            return sortState;
        });
    }, []);

    const sortedRowCount = table.getSortedRowModel().rows.length;

    const rowVirtualizer = useVirtualizer({
        count: sortedRowCount,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => 35,
        overscan: 10,
    });

    useEffect(() => {
        rowVirtualizer.measure();
    }, [stocks, sorting, sortedRowCount]);

    const tableWidthPx = useMemo(() => getIboardTableWidthPx(totalMetric), [totalMetric]);
    const columnWidthPercents = useMemo(
        () => getIboardColumnWidthPercents(totalMetric),
        [totalMetric],
    );

    return (
        <section
            aria-label={trans.iboard.stock_price_table}
            className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-secondary rounded-xl"
        >
            {isLoading || isOwnedLoading ? (
                <div className="flex-1 min-h-0 flex items-center justify-center">
                    <Spinner isLoading={true} isOverlay={false} />
                </div>
            ) : stocks.length === 0 ? (
                <div className="flex min-h-0 flex-1 items-center justify-center font-tiny text-secondary">
                    <EmptyState />
                </div>
            ) : (
                <div
                    ref={scrollRef}
                    className="scrollbar min-h-0 w-full min-w-0 flex-1 overflow-x-auto overflow-y-auto [contain:paint] [overflow-anchor:none]"
                >
                    <table
                        className="table-fixed max-w-none border-separate border-spacing-0 border-quaternary box-border"
                        style={{
                            width: `max(100%, ${tableWidthPx}px)`,
                        }}
                    >
                        <colgroup>
                            {columnWidthPercents.map(({ key, percent }) => (
                                <col key={key} style={{ width: `${percent}%` }} />
                            ))}
                        </colgroup>
                        <IBoardTableHeader
                            table={table}
                            totalMetric={totalMetric}
                            onToggleTotalMetric={toggleTotalMetric}
                        />
                        <IBoardTableBody
                            table={table}
                            rowVirtualizer={rowVirtualizer}
                            realtimeCellBgMap={realtimeCellBgMap}
                        />
                    </table>
                </div>
            )}

            {tradeAnchor && (
                <TradeQuickPanel
                    key={`${tradeAnchor.symbol}-${tradeAnchor.side}-${tradeAnchor.price}`}
                    anchorRect={tradeAnchor.rect}
                    side={tradeAnchor.side}
                    price={tradeAnchor.price}
                    onClose={() => setTradeAnchor(null)}
                />
            )}
        </section>
    );
};
