'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { MarketFlowTreemapSide } from '@/components/thi-truong/money-flow/MarketFlowTreemapSide';
import { MarketDot } from '@/components/thi-truong/shared/MarketDot';
import { useTopNetRealtimeQuotes } from '@/hooks/market/useTopNetRealtimeQuotes';
import {
    fetchAllStockScreener,
    fetchStocksMetadataBySymbolsV4,
} from '@/services/api/datafeed/stock-info';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';
import type { TopNetDisplayItem, TopNetPriceLimit } from '@/types/pages/market';
import { isSuccessApi } from '@/utils/common';
import { formatApiDate } from '@/utils/format';
import {
    applyPriceLimitsToTopNetItems,
    applyRealtimeQuotesToTopNetItems,
    buildPriceLimitMap,
    buildTopNetScreenerParams,
    mapStockScreenerToDisplayItems,
    sumTopNetAbsValues,
    toTradingFlowBillions,
    toTreemapCells,
} from '@/utils/market/market-flow';

type Props = {
    isForeign: boolean;
    activeExchange: string;
    showDot?: boolean;
};

const TOP_NET_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

const buildFetchKey = (isForeign: boolean, exchange: string) => `${isForeign}-${exchange}`;

export const MarketFlowTopNet = ({ isForeign, activeExchange, showDot = true }: Props) => {
    const openStockDetail = useStockInfoStore((state) => state.openStockDetail);
    const requestedKeyRef = useRef(buildFetchKey(isForeign, activeExchange));
    const [symbolBuy, setSymbolBuy] = useState<TopNetDisplayItem[]>([]);
    const [symbolSell, setSymbolSell] = useState<TopNetDisplayItem[]>([]);
    const [isSymbolLoading, setIsSymbolLoading] = useState(false);
    const [priceLimits, setPriceLimits] = useState<Record<string, TopNetPriceLimit>>({});
    const priceLimitsRef = useRef<Record<string, TopNetPriceLimit>>({});
    const priceLimitsDateRef = useRef('');

    const realtimeSymbols = useMemo(
        () => [...symbolBuy, ...symbolSell].map((item) => item.key),
        [symbolBuy, symbolSell],
    );
    const realtimeQuotes = useTopNetRealtimeQuotes(realtimeSymbols);

    const buyTotalValue = useMemo(() => sumTopNetAbsValues(symbolBuy), [symbolBuy]);
    const sellTotalValue = useMemo(() => sumTopNetAbsValues(symbolSell), [symbolSell]);
    const combinedTotalValue = buyTotalValue + sellTotalValue;
    const buyCells = useMemo(
        () =>
            toTreemapCells(
                applyRealtimeQuotesToTopNetItems(
                    applyPriceLimitsToTopNetItems(symbolBuy, priceLimits),
                    realtimeQuotes,
                ),
                combinedTotalValue,
            ),
        [symbolBuy, priceLimits, realtimeQuotes, combinedTotalValue],
    );
    const sellCells = useMemo(
        () =>
            toTreemapCells(
                applyRealtimeQuotesToTopNetItems(
                    applyPriceLimitsToTopNetItems(symbolSell, priceLimits),
                    realtimeQuotes,
                ),
                combinedTotalValue,
            ),
        [symbolSell, priceLimits, realtimeQuotes, combinedTotalValue],
    );
    const buyWidthRatio = buyTotalValue;
    const sellWidthRatio = sellTotalValue;
    const hasBuySide = buyCells.length > 0;
    const hasSellSide = sellCells.length > 0;
    const buyHeaderTotal = toTradingFlowBillions(buyTotalValue);
    const sellHeaderTotal = toTradingFlowBillions(sellTotalValue);
    const isEmpty = buyCells.length === 0 && sellCells.length === 0;
    const isLoading = isSymbolLoading;
    const treemapKey = buildFetchKey(isForeign, activeExchange);

    const openDetail = useCallback((key: string) => openStockDetail(key), [openStockDetail]);
    const handleCellClick = openDetail;

    useEffect(() => {
        const fetchKey = buildFetchKey(isForeign, activeExchange);
        requestedKeyRef.current = fetchKey;

        const syncPriceLimits = async (items: TopNetDisplayItem[]) => {
            const today = formatApiDate();
            if (priceLimitsDateRef.current !== today) {
                priceLimitsDateRef.current = today;
                priceLimitsRef.current = {};
                setPriceLimits({});
            }

            const missingSymbols = Array.from(
                new Set(items.map((item) => item.key).filter(Boolean)),
            ).filter((symbol) => !priceLimitsRef.current[symbol]);

            if (missingSymbols.length === 0) return;

            try {
                const { result, error_code } = await fetchStocksMetadataBySymbolsV4(missingSymbols);
                if (!isSuccessApi(error_code) || !result) return;

                priceLimitsRef.current = {
                    ...priceLimitsRef.current,
                    ...buildPriceLimitMap(result),
                };
                setPriceLimits(priceLimitsRef.current);
            } catch {
                return;
            }
        };

        const fetchSymbol = async (isSilent: boolean) => {
            if (!isSilent) setIsSymbolLoading(true);
            try {
                const [buyItems, sellItems] = await Promise.all([
                    fetchAllStockScreener(
                        buildTopNetScreenerParams(activeExchange, isForeign, 'buy'),
                    ),
                    fetchAllStockScreener(
                        buildTopNetScreenerParams(activeExchange, isForeign, 'sell'),
                    ),
                ]);

                if (requestedKeyRef.current !== fetchKey) return;

                const buyDisplayItems = mapStockScreenerToDisplayItems(buyItems, isForeign);
                const sellDisplayItems = mapStockScreenerToDisplayItems(sellItems, isForeign);

                await syncPriceLimits([...buyDisplayItems, ...sellDisplayItems]);

                if (requestedKeyRef.current !== fetchKey) return;

                setSymbolBuy(buyDisplayItems);
                setSymbolSell(sellDisplayItems);
            } catch {
                if (requestedKeyRef.current !== fetchKey || isSilent) return;
                setSymbolBuy([]);
                setSymbolSell([]);
            } finally {
                if (!isSilent && requestedKeyRef.current === fetchKey) {
                    setIsSymbolLoading(false);
                }
            }
        };

        fetchSymbol(false);

        const intervalId = setInterval(() => {
            fetchSymbol(true);
        }, TOP_NET_REFRESH_INTERVAL_MS);

        return () => {
            clearInterval(intervalId);
        };
    }, [isForeign, activeExchange]);

    return (
        <div className="border-tertiary flex min-w-0 flex-col gap-3 rounded-xl border p-4">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    {showDot && <MarketDot />}
                    <h3
                        className={`text-primary ${
                            showDot ? 'font-body-3-highlight' : 'font-body-2-highlight'
                        }`}
                    >
                        {'Bản đồ nhiệt theo mã'}
                    </h3>
                </div>
                {/* <div className="border-tertiary flex shrink-0 items-center gap-1 rounded-full border p-1">
                    {(['symbol', 'sector'] as const).map((tab) => {
                        const isActive = activeTopNetTab === tab;
                        return (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setActiveTopNetTab(tab)}
                                className={`rounded-full px-2 py-1 transition-colors ${
                                    isActive
                                        ? 'bg-tertiary font-caption-highlight text-primary'
                                        : 'font-caption text-secondary'
                                }`}
                            >
                                {tabLabels[tab]}
                            </button>
                        );
                    })}
                </div> */}
            </div>
            {isLoading ? (
                <div className="h-96 w-full">
                    <Skeleton />
                </div>
            ) : isEmpty ? (
                <div className="flex h-96 items-center justify-center">
                    <EmptyState />
                </div>
            ) : (
                <div
                    className="grid h-96 min-h-0 w-full gap-1"
                    style={{
                        gridTemplateColumns:
                            hasBuySide && hasSellSide && buyWidthRatio + sellWidthRatio > 0
                                ? `${buyWidthRatio}fr ${sellWidthRatio}fr`
                                : '1fr',
                        gridTemplateRows: '1fr',
                    }}
                >
                    {hasBuySide && (
                        <div className="min-h-0 min-w-0 overflow-hidden">
                            <MarketFlowTreemapSide
                                key={`${treemapKey}-buy`}
                                side="buy"
                                totalBillion={buyHeaderTotal}
                                items={buyCells}
                                onCellClick={handleCellClick}
                            />
                        </div>
                    )}
                    {hasSellSide && (
                        <div className="min-h-0 min-w-0 overflow-hidden">
                            <MarketFlowTreemapSide
                                key={`${treemapKey}-sell`}
                                side="sell"
                                totalBillion={sellHeaderTotal}
                                items={sellCells}
                                onCellClick={handleCellClick}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
