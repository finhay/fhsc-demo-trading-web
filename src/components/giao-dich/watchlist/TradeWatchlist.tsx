'use client';

import {
    type SortingState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { DropdownWatchlist } from '@/components/common/feature/DropdownWatchlist';
import { EmptyState } from '@/components/common/feature/EmptyState';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { createWatchlistColumns } from '@/components/giao-dich/watchlist/TradeWatchlistColumns';
import { useMQTT } from '@/hooks/useMQTT';
import { StockPriceMessage } from '@/proto/stock';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import {
    getOrderedWatchlistSymbols,
    isOwnedWatchlist,
    useWatchlistStore,
} from '@/stores/common/useWatchlistStore';
import type { WatchlistItem, WatchlistStockItem } from '@/types/accounts/watchlist';
import type { StocksInfoItem } from '@/types/datafeed/stock-info';
import type { MarketPortfolioColumnMeta } from '@/types/pages/trading';
import { buildStockPriceTopics } from '@/utils/common';
import { createAlphanumericSortFn, createNumericSortFn } from '@/utils/iboard';
import { mapWatchlistItemToStock } from '@/utils/trading/shared';

export const TradeWatchlist = () => {
    const router = useRouter();
    const { activeSubAccount } = useAuthStore();
    const [stocks, setStocks] = useState<StocksInfoItem[]>([]);
    const [updatedSymbols, setUpdatedSymbols] = useState<Set<string>>(new Set());
    const {
        watchlists,
        currentWatchList,
        setCurrentWatchList,
        fetchOwnedPortfolio,
        isOwnedLoading,
    } = useWatchlistStore();
    const [sorting, setSorting] = useState<SortingState>([]);
    const pendingMqttRef = useRef<Map<string, StockPriceMessage>>(new Map());
    const rafMqttRef = useRef<number | null>(null);
    const highlightTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
    const stockSymbolsKey = useMemo(() => stocks.map((stock) => stock.symbol).join(','), [stocks]);
    const mqttTopics = useMemo(
        () => (stockSymbolsKey ? buildStockPriceTopics(stockSymbolsKey.split(',')) : []),
        [stockSymbolsKey],
    );

    const flushMqttBatch = useCallback(() => {
        rafMqttRef.current = null;
        const batch = new Map(pendingMqttRef.current);
        pendingMqttRef.current.clear();
        if (batch.size === 0) return;

        setStocks((prevStocks) =>
            prevStocks.map((stock) => {
                const update = batch.get(stock.symbol);
                if (!update) return stock;
                return {
                    ...stock,
                    price: update.price ?? stock.price,
                    price_change: update.change ?? stock.price_change,
                    price_change_percent: update.changePercent ?? stock.price_change_percent,
                    floor: update.floor ?? stock.floor,
                    ceiling: update.ceiling ?? stock.ceiling,
                    reference: update.reference ?? stock.reference,
                };
            }),
        );

        setUpdatedSymbols((prev) => {
            const next = new Set(prev);
            batch.forEach((_update, symbol) => {
                next.add(symbol);
                const prevTimer = highlightTimersRef.current[symbol];
                if (prevTimer) clearTimeout(prevTimer);
                highlightTimersRef.current[symbol] = setTimeout(() => {
                    setUpdatedSymbols((s) => {
                        const n = new Set(s);
                        n.delete(symbol);
                        return n;
                    });
                    delete highlightTimersRef.current[symbol];
                }, 500);
            });
            return next;
        });
    }, []);

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

    const getSortDesc = useCallback(
        (columnId: string) => sorting.find((s) => s.id === columnId)?.desc ?? false,
        [sorting],
    );

    const handleSelectSymbol = useCallback(
        (symbol: string) => {
            router.push(`/giao-dich?symbol=${symbol}`);
        },
        [router],
    );

    const currentWatchlistSymbolsKey = useMemo(
        () => (currentWatchList ? getOrderedWatchlistSymbols(currentWatchList).join(',') : ''),
        [currentWatchList],
    );

    const showWatchlistStocks = (watchlist: WatchlistItem) => {
        const itemBySymbol = new Map(
            (watchlist.items ?? []).map((item) => [item.symbol.trim().toUpperCase(), item]),
        );
        const mapped = getOrderedWatchlistSymbols(watchlist)
            .map((symbol) => itemBySymbol.get(symbol))
            .filter((item): item is WatchlistStockItem => Boolean(item))
            .map(mapWatchlistItemToStock);
        setStocks(mapped);
    };

    const numericSortFn = useMemo(
        () => createNumericSortFn<StocksInfoItem>(getSortDesc),
        [getSortDesc],
    );
    const alphanumericSortFn = useMemo(
        () => createAlphanumericSortFn<StocksInfoItem>(getSortDesc),
        [getSortDesc],
    );

    const columns = useMemo(
        () =>
            createWatchlistColumns({
                labels: {
                    col_symbol: 'Mã',
                    col_market_price_ref: 'Giá TT / Giá TC',
                    col_change: 'Biến động',
                },
                numericSortFn,
                alphanumericSortFn,
                onSelectSymbol: handleSelectSymbol,
            }),
        [
            alphanumericSortFn,
            numericSortFn,
            'Mã',
            'Giá TT / Giá TC',
            'Biến động',
            handleSelectSymbol,
        ],
    );

    const table = useReactTable({
        data: stocks,
        columns,
        state: { sorting },
        meta: { updatedSymbols },
        onSortingChange: setSorting,
        getRowId: (row) => row.symbol,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const rows = table.getSortedRowModel().rows;
    const canShowOwned = Boolean(activeSubAccount);
    const isOwned = canShowOwned && (!currentWatchList || isOwnedWatchlist(currentWatchList));

    const handleSelectOwned = () => {
        setCurrentWatchList(null);
    };

    useMQTT(mqttTopics, handleMQTTMessage, stocks.length > 0);

    useEffect(() => {
        return () => {
            if (rafMqttRef.current != null) {
                cancelAnimationFrame(rafMqttRef.current);
            }
            Object.values(highlightTimersRef.current).forEach(clearTimeout);
            highlightTimersRef.current = {};
        };
    }, []);

    useEffect(() => {
        if (!currentWatchList) {
            setStocks([]);
            return;
        }
        showWatchlistStocks(currentWatchList);
    }, [currentWatchList?.id, currentWatchlistSymbolsKey]);

    useEffect(() => {
        if (!isOwned) return;
        fetchOwnedPortfolio();
    }, [isOwned, activeSubAccount?.sub_account_id]);

    useEffect(() => {
        if (canShowOwned || currentWatchList || watchlists.length === 0) return;
        setCurrentWatchList(watchlists[0]);
    }, [canShowOwned, currentWatchList, watchlists, setCurrentWatchList]);

    return (
        <section
            aria-label={'Danh mục sở hữu'}
            aria-live="polite"
            className="base-secondary flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-3 overflow-hidden rounded-xl p-3"
        >
            <div className="flex items-center">
                <DropdownWatchlist
                    align="left"
                    buttonWidthClass="w-40"
                    buttonClass="base-tertiary"
                    showCreateButton={false}
                    showOwnedOption={canShowOwned}
                    isOwnedActive={isOwned}
                    onSelectOwned={handleSelectOwned}
                />
            </div>
            {isOwnedLoading ? (
                <div className="flex-1 min-h-0">
                    <Skeleton />
                </div>
            ) : stocks.length === 0 ? (
                <div className="flex-1 min-h-0">
                    <EmptyState />
                </div>
            ) : (
                <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
                    <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
                        <thead className="sticky top-0 z-10">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        const align =
                                            (
                                                header.column.columnDef.meta as
                                                    | MarketPortfolioColumnMeta
                                                    | undefined
                                            )?.align ?? 'right';
                                        const textAlignClass =
                                            align === 'left' ? 'text-left' : 'text-right';
                                        const colSize = header.column.columnDef.size;
                                        return (
                                            <th
                                                key={header.id}
                                                scope="col"
                                                style={colSize ? { width: colSize } : undefined}
                                                className={`base-secondary pb-3 align-top body-4 text-secondary ${textAlignClass}`}
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column.columnDef.header,
                                                          header.getContext(),
                                                      )}
                                            </th>
                                        );
                                    })}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {rows.map((row, index) => (
                                <tr
                                    key={row.id}
                                    aria-label={`${row.original.symbol} — ${'Giá'} ${row.original.price}, ${'biến động'} ${row.original.price_change}/${row.original.price_change_percent}%`}
                                    className="text-left"
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        const align =
                                            (
                                                cell.column.columnDef.meta as
                                                    | MarketPortfolioColumnMeta
                                                    | undefined
                                            )?.align ?? 'right';
                                        const textAlignClass =
                                            align === 'left' ? 'text-left' : 'text-right';
                                        const spacingClass = index === 0 ? '' : 'pt-3';
                                        return (
                                            <td
                                                key={cell.id}
                                                className={`align-top ${textAlignClass} ${spacingClass}`}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
};
