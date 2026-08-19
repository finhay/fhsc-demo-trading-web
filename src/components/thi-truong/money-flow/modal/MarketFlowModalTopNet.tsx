'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { MarketFlowTreemapSide } from '@/components/thi-truong/money-flow/MarketFlowTreemapSide';
import { useTranslate } from '@/hooks/useTranslate';
import { fetchAllStockScreener } from '@/services/api/datafeed/stock-info';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';
import type { TradingStatsPeriod } from '@/types/datafeed/trading-data';
import type { TopNetDisplayItem } from '@/types/pages/market';
import {
    buildTopNetScreenerParams,
    mapStockScreenerToDisplayItems,
    sumTopNetAbsValues,
    toTradingFlowBillions,
    toTreemapCells,
} from '@/utils/market/market-flow';

type Props = {
    isForeign: boolean;
    activeExchange: string;
    period: TradingStatsPeriod;
};

const buildFetchKey = (isForeign: boolean, exchange: string, period: TradingStatsPeriod) =>
    `${isForeign}-${exchange}-${period}`;

export const MarketFlowModalTopNet = ({ isForeign, activeExchange, period }: Props) => {
    const trans = useTranslate();
    const openStockDetail = useStockInfoStore((state) => state.openStockDetail);
    const requestedKeyRef = useRef(buildFetchKey(isForeign, activeExchange, period));
    const [symbolBuy, setSymbolBuy] = useState<TopNetDisplayItem[]>([]);
    const [symbolSell, setSymbolSell] = useState<TopNetDisplayItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const buyTotalValue = useMemo(() => sumTopNetAbsValues(symbolBuy), [symbolBuy]);
    const sellTotalValue = useMemo(() => sumTopNetAbsValues(symbolSell), [symbolSell]);
    const combinedTotalValue = buyTotalValue + sellTotalValue;
    const buyCells = useMemo(
        () => toTreemapCells(symbolBuy, combinedTotalValue),
        [symbolBuy, combinedTotalValue],
    );
    const sellCells = useMemo(
        () => toTreemapCells(symbolSell, combinedTotalValue),
        [symbolSell, combinedTotalValue],
    );
    const buyWidthRatio = buyTotalValue;
    const sellWidthRatio = sellTotalValue;
    const hasBuySide = buyCells.length > 0;
    const hasSellSide = sellCells.length > 0;
    const buyHeaderTotal = toTradingFlowBillions(buyTotalValue);
    const sellHeaderTotal = toTradingFlowBillions(sellTotalValue);
    const isEmpty = !hasBuySide && !hasSellSide;
    const treemapKey = buildFetchKey(isForeign, activeExchange, period);

    const handleCellClick = useCallback((key: string) => openStockDetail(key), [openStockDetail]);

    useEffect(() => {
        const fetchKey = buildFetchKey(isForeign, activeExchange, period);
        requestedKeyRef.current = fetchKey;

        const fetchSymbol = async () => {
            setIsLoading(true);
            try {
                const [buyItems, sellItems] = await Promise.all([
                    fetchAllStockScreener(
                        buildTopNetScreenerParams(activeExchange, isForeign, 'buy', period),
                    ),
                    fetchAllStockScreener(
                        buildTopNetScreenerParams(activeExchange, isForeign, 'sell', period),
                    ),
                ]);

                if (requestedKeyRef.current !== fetchKey) return;

                setSymbolBuy(mapStockScreenerToDisplayItems(buyItems, isForeign));
                setSymbolSell(mapStockScreenerToDisplayItems(sellItems, isForeign));
            } catch {
                if (requestedKeyRef.current !== fetchKey) return;
                setSymbolBuy([]);
                setSymbolSell([]);
            } finally {
                if (requestedKeyRef.current === fetchKey) {
                    setIsLoading(false);
                }
            }
        };

        fetchSymbol();
    }, [isForeign, activeExchange, period]);

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
            <div className="flex shrink-0 items-center gap-2">
                <h3
                    className={`text-primary ${
                        isForeign ? 'font-body-3-highlight' : 'font-body-2-highlight'
                    }`}
                >
                    {trans.market.flow.top_net}
                </h3>
            </div>
            {isLoading ? (
                <div className="min-h-0 w-full flex-1">
                    <Skeleton />
                </div>
            ) : isEmpty ? (
                <div className="flex min-h-0 flex-1 items-center justify-center">
                    <EmptyState />
                </div>
            ) : (
                <div
                    className="grid min-h-0 w-full flex-1 gap-1"
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
                                colorMode="change-percent"
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
                                colorMode="change-percent"
                                onCellClick={handleCellClick}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
