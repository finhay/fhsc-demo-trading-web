'use client';

import {
    DndContext,
    type DragEndEvent,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { FaArrowDown, FaArrowUp } from 'react-icons/fa6';
import { FiMinus } from 'react-icons/fi';
import { RxDragHandleDots2 } from 'react-icons/rx';

import { DropdownWatchlist } from '@/components/common/feature/DropdownWatchlist';
import { EmptyState } from '@/components/common/feature/EmptyState';
import { InputSearch } from '@/components/common/feature/InputSearch';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { MarketWatchlistPortfolio } from '@/components/thi-truong/watchlist/MarketWatchlistPortfolio';
import { useMQTT } from '@/hooks/useMQTT';
import { useTranslate } from '@/hooks/useTranslate';
import { StockPriceMessage } from '@/proto/stock';
import { fetchStockRealtime } from '@/services/api/datafeed/stock-info';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';
import {
    getOrderedWatchlistSymbols,
    isOwnedWatchlist,
    useWatchlistStore,
} from '@/stores/common/useWatchlistStore';
import type { StocksInfoV2Item } from '@/types/datafeed/stock-info';
import {
    buildStockPriceTopics,
    getMarketPriceColor,
    getPriceFlashBg,
    isSuccessApi,
    makeWatchlistItem,
    toStockPriceMessage,
} from '@/utils/common';
import { getChangeColor } from '@/utils/common';
import { formatNumberVN } from '@/utils/format';

export const MarketWatchlist = () => {
    const trans = useTranslate();
    const { profile, isInitialized, activeSubAccount } = useAuthStore();
    const { startLoading, stopLoading } = useLoadingStore();
    const {
        watchlists,
        currentWatchList,
        setCurrentWatchList,
        updateWatchlist,
        fetchWatchlists,
        removeStockFromWatchlist,
        addStockToWatchlist,
    } = useWatchlistStore();
    const canShowOwned = Boolean(activeSubAccount);
    const isOwned = canShowOwned && (!currentWatchList || isOwnedWatchlist(currentWatchList));

    const [stocks, setStocks] = useState<StockPriceMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatedSymbols, setUpdatedSymbols] = useState<Set<string>>(new Set());
    const highlightTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
    const { openStockDetail } = useStockInfoStore();

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const symbols = currentWatchList ? getOrderedWatchlistSymbols(currentWatchList) : [];
    const symbolsKey = symbols.join(',');

    const topics = useMemo(() => buildStockPriceTopics(symbols), [symbolsKey]);

    const existingSymbolsForSearch = currentWatchList
        ? new Set(getOrderedWatchlistSymbols(currentWatchList))
        : new Set<string>();

    const markSymbolUpdated = useCallback((symbol: string) => {
        if (!symbol) return;
        setUpdatedSymbols((prev) => {
            const next = new Set(prev);
            next.add(symbol);
            return next;
        });
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
    }, []);

    const handleSelectSymbol = useCallback(
        (symbol: string) => {
            openStockDetail(symbol);
        },
        [openStockDetail],
    );

    const handleRealtimeMessage = useCallback(
        (_topic: string, message: Buffer) => {
            const data = StockPriceMessage.decode(new Uint8Array(message));
            setStocks((prev) =>
                prev.map((stock) => (stock.symbol === data.symbol ? { ...stock, ...data } : stock)),
            );
            markSymbolUpdated(data.symbol);
        },
        [markSymbolUpdated],
    );

    const handleSelectStock = async (stock: StocksInfoV2Item) => {
        if (existingSymbolsForSearch.has(stock.symbol)) return;

        startLoading();
        try {
            const { result, error_code } = await fetchStockRealtime(stock.symbol);
            if (isSuccessApi(error_code)) {
                const item = makeWatchlistItem({
                    symbol: result.symbol,
                    name: result.name,
                    exchange: result.exchange,
                    stockType: result.stockType,
                    price: result.price,
                    change: result.change ?? 0,
                    changePercent: result.changePercent ?? 0,
                    reference: result.reference,
                    ceiling: result.ceiling,
                    floor: result.floor,
                    close: result.close,
                    average: result.average,
                    high: result.high,
                    low: result.low,
                    open: result.open,
                    volume: result.volume,
                    totalVolume: result.totalVolume,
                    totalValue: result.totalValue,
                    foreignBought: result.foreignBought,
                    foreignSold: result.foreignSold,
                    foreignRemain: result.foreignRemain,
                    remainBid: result.remainBid,
                    remainAsk: result.remainAsk,
                    buyPrice1: result.buyPrice1,
                    buyPrice2: result.buyPrice2,
                    buyPrice3: result.buyPrice3,
                    sellPrice1: result.sellPrice1,
                    sellPrice2: result.sellPrice2,
                    sellPrice3: result.sellPrice3,
                    buyVol1: result.buyVol1,
                    buyVol2: result.buyVol2,
                    buyVol3: result.buyVol3,
                    sellVol1: result.sellVol1,
                    sellVol2: result.sellVol2,
                    sellVol3: result.sellVol3,
                });

                await addStockToWatchlist(item);
            }
        } finally {
            stopLoading();
        }
    };

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id || !currentWatchList) return;

        setStocks((prev) => {
            const oldIndex = prev.findIndex((item) => item.symbol === active.id);
            const newIndex = prev.findIndex((item) => item.symbol === over.id);
            const reordered = arrayMove(prev, oldIndex, newIndex);

            updateWatchlist({
                id: currentWatchList.id,
                name: currentWatchList.name,
                symbols: reordered.map((item) => item.symbol),
            });

            return reordered;
        });
    };

    const handleSelectOwned = () => {
        setCurrentWatchList(null);
    };

    useEffect(() => {
        if (!isInitialized) return;

        const loadWatchlists = async () => {
            setIsLoading(true);
            await fetchWatchlists();
            setIsLoading(false);
        };

        loadWatchlists();
    }, [isInitialized, profile, fetchWatchlists]);

    useEffect(() => {
        if (canShowOwned || currentWatchList || watchlists.length === 0) return;
        setCurrentWatchList(watchlists[0]);
    }, [canShowOwned, currentWatchList, watchlists, setCurrentWatchList]);

    useEffect(() => {
        return () => {
            setCurrentWatchList(null);
        };
    }, [setCurrentWatchList]);

    useEffect(() => {
        return () => {
            Object.values(highlightTimersRef.current).forEach(clearTimeout);
            highlightTimersRef.current = {};
        };
    }, []);

    useEffect(() => {
        if (!currentWatchList || isOwnedWatchlist(currentWatchList)) {
            setStocks([]);
            return;
        }
        setStocks((currentWatchList.items ?? []).map(toStockPriceMessage));
    }, [currentWatchList?.id, symbolsKey]);

    useMQTT(topics, handleRealtimeMessage, topics.length > 0 && !isOwned);

    const SortableWatchlistRow = useMemo(
        () =>
            function SortableWatchlistRow({
                stock,
                onRemove,
                onSelectSymbol,
                isUpdated,
            }: {
                stock: StockPriceMessage;
                onRemove: () => void;
                onSelectSymbol: (symbol: string) => void;
                isUpdated: boolean;
            }) {
                const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
                    useSortable({ id: stock.symbol });

                const style = {
                    transform: CSS.Transform.toString(transform),
                    transition,
                    opacity: isDragging ? 0.5 : 1,
                };

                const priceColor = getMarketPriceColor(
                    stock.price,
                    stock.reference,
                    stock.floor,
                    stock.ceiling,
                );
                const changeColorClass = getChangeColor(stock.changePercent);

                const changeArrow =
                    stock.change > 0 ? (
                        <FaArrowUp size={12} aria-hidden />
                    ) : stock.change < 0 ? (
                        <FaArrowDown size={12} aria-hidden />
                    ) : null;

                const flashBg = getPriceFlashBg(
                    stock.price,
                    stock.reference,
                    stock.floor,
                    stock.ceiling,
                );

                return (
                    <li ref={setNodeRef} style={style} className="flex items-center gap-1">
                        <button
                            type="button"
                            {...attributes}
                            {...listeners}
                            className="shrink-0 cursor-grab active:cursor-grabbing text-tertiary hover:text-secondary transition-colors touch-none"
                            aria-label={trans.market.watchlist.aria_drag_fn(stock.symbol)}
                        >
                            <RxDragHandleDots2 size={16} />
                        </button>
                        <div className="flex flex-1 items-center gap-2 rounded-xl border border-tertiary px-2.5 py-1.5 min-w-0">
                            <button
                                type="button"
                                onClick={() => onSelectSymbol(stock.symbol)}
                                className="flex-1 min-w-0 cursor-pointer truncate text-left font-body-3-highlight text-primary"
                            >
                                {stock.symbol}
                            </button>
                            <div className={`flex items-center gap-1 shrink-0 ${changeColorClass}`}>
                                {changeArrow}
                                <span className="font-caption">
                                    {formatNumberVN(stock.change / 1000)} (
                                    {stock.changePercent > 0 ? '+' : ''}
                                    {formatNumberVN(stock.changePercent)}%)
                                </span>
                            </div>
                            <span
                                className={`font-body-3-highlight shrink-0 rounded px-1 transition-colors duration-1000 ${
                                    isUpdated && flashBg ? flashBg : priceColor
                                }`}
                            >
                                {formatNumberVN(stock.price / 1000)}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={onRemove}
                            className="shrink-0 p-1 text-tertiary hover:text-red transition-colors"
                            aria-label={trans.market.watchlist.aria_remove_fn(stock.symbol)}
                        >
                            <FiMinus size={16} />
                        </button>
                    </li>
                );
            },
        [trans],
    );

    return (
        <section className="bg-secondary flex h-full min-h-0 w-full flex-1 flex-col gap-2 overflow-hidden rounded-xl p-4">
            <div className="flex shrink-0 items-center justify-between gap-1">
                <h2 className="font-body-2-highlight text-primary flex shrink-0 items-center gap-2 whitespace-nowrap">
                    {trans.market.watchlist.heading}
                </h2>
                <div className="flex min-w-0 items-center gap-2">
                    <DropdownWatchlist
                        align="right"
                        buttonWidthClass="w-40"
                        buttonClass="bg-tertiary"
                        showOwnedOption={canShowOwned}
                        isOwnedActive={isOwned}
                        onSelectOwned={handleSelectOwned}
                    />
                </div>
            </div>
            {isLoading ? (
                <div className="flex min-h-0 flex-1 w-full">
                    <Skeleton />
                </div>
            ) : isOwned ? (
                <MarketWatchlistPortfolio />
            ) : (
                <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
                    <InputSearch
                        onSelectStock={handleSelectStock}
                        className="w-full shrink-0"
                        placeholder={trans.market.watchlist.placeholder}
                    />
                    {stocks.length === 0 ? (
                        <div className="flex min-h-0 flex-1 flex-col">
                            <EmptyState />
                        </div>
                    ) : (
                        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={stocks.map((item) => item.symbol)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <ul className="flex flex-col gap-3">
                                        {stocks.map((stock) => (
                                            <SortableWatchlistRow
                                                key={stock.symbol}
                                                stock={stock}
                                                isUpdated={updatedSymbols.has(stock.symbol)}
                                                onSelectSymbol={handleSelectSymbol}
                                                onRemove={() =>
                                                    removeStockFromWatchlist(stock.symbol)
                                                }
                                            />
                                        ))}
                                    </ul>
                                </SortableContext>
                            </DndContext>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};
