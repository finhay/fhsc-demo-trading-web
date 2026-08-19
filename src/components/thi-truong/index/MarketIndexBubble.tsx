'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import * as echarts from 'echarts';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { MarketDot } from '@/components/thi-truong/shared/MarketDot';
import { MarketOutOfSession } from '@/components/thi-truong/shared/MarketOutOfSession';
import { renderInfluenceBubbleChart } from '@/config/market/market-index';
import { INDEX_TO_EXCHANGE } from '@/constants/market';
import { fetchMarketLeaderboardV2 } from '@/services/api/datafeed/trading-data';
import { useMarketIndexStore } from '@/stores/common/useMarketIndexStore';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';
import type { MarketLeaderboardItem } from '@/types/datafeed/trading-data';
import { isSuccessApi } from '@/utils/common';
import { sortTopInfluenceLeaderboard } from '@/utils/market/market-index';

type Props = {
    selectedIndex: string;
};

export const MarketIndexBubble = ({ selectedIndex }: Props) => {
    const { isPreSession } = useMarketIndexStore();

    const [increaseStocks, setIncreaseStocks] = useState<MarketLeaderboardItem[]>([]);
    const [decreaseStocks, setDecreaseStocks] = useState<MarketLeaderboardItem[]>([]);
    const [isInfluenceLoading, setIsInfluenceLoading] = useState(true);
    const { openStockDetail } = useStockInfoStore();

    const increaseBubbleContainerRef = useRef<HTMLDivElement>(null);
    const decreaseBubbleContainerRef = useRef<HTMLDivElement>(null);
    const increaseBubbleChartRef = useRef<echarts.ECharts | null>(null);
    const decreaseBubbleChartRef = useRef<echarts.ECharts | null>(null);
    const hasDataRef = useRef(false);

    const hasInfluenceData = increaseStocks.length > 0 || decreaseStocks.length > 0;

    useEffect(() => {
        hasDataRef.current = hasInfluenceData;
    }, [hasInfluenceData]);

    const fetchInfluenceData = async (showLoading = false) => {
        const exchange = INDEX_TO_EXCHANGE[selectedIndex];
        if (showLoading) setIsInfluenceLoading(true);

        if (!exchange) {
            setIncreaseStocks([]);
            setDecreaseStocks([]);
            if (showLoading) setIsInfluenceLoading(false);
            return;
        }

        const [increaseRes, decreaseRes] = await Promise.all([
            fetchMarketLeaderboardV2(exchange, 'INCREASE'),
            fetchMarketLeaderboardV2(exchange, 'DECREASE'),
        ]);

        if (isSuccessApi(increaseRes.error_code) && increaseRes.result) {
            setIncreaseStocks(sortTopInfluenceLeaderboard(increaseRes.result));
            setDecreaseStocks(
                isSuccessApi(decreaseRes.error_code) && decreaseRes.result
                    ? sortTopInfluenceLeaderboard(decreaseRes.result)
                    : [],
            );
        } else if (showLoading) {
            setIncreaseStocks([]);
            setDecreaseStocks([]);
        }
        if (showLoading) setIsInfluenceLoading(false);
    };

    const handleSelectSymbol = useCallback(
        (symbol: string) => {
            openStockDetail(symbol);
        },
        [openStockDetail],
    );

    const disposeIncrease = useCallback(() => {
        increaseBubbleChartRef.current?.dispose();
        increaseBubbleChartRef.current = null;
    }, []);

    const disposeDecrease = useCallback(() => {
        decreaseBubbleChartRef.current?.dispose();
        decreaseBubbleChartRef.current = null;
    }, []);

    useEffect(() => {
        setIsInfluenceLoading(true);
        fetchInfluenceData(true);

        const intervalId = setInterval(() => {
            fetchInfluenceData(!hasDataRef.current);
        }, 180_000);

        return () => {
            clearInterval(intervalId);
        };
    }, [selectedIndex]);

    useEffect(() => {
        if (isPreSession || isInfluenceLoading || !hasInfluenceData) return;

        const renderAll = () => {
            const increaseContainer = increaseBubbleContainerRef.current;
            if (increaseContainer && increaseStocks.length > 0) {
                renderInfluenceBubbleChart(
                    increaseContainer,
                    increaseBubbleChartRef,
                    increaseStocks,
                    'increase',
                    handleSelectSymbol,
                );
            } else {
                disposeIncrease();
            }

            const decreaseContainer = decreaseBubbleContainerRef.current;
            if (decreaseContainer && decreaseStocks.length > 0) {
                renderInfluenceBubbleChart(
                    decreaseContainer,
                    decreaseBubbleChartRef,
                    decreaseStocks,
                    'decrease',
                    handleSelectSymbol,
                );
            } else {
                disposeDecrease();
            }
        };

        renderAll();

        const observer = new ResizeObserver(() => {
            requestAnimationFrame(renderAll);
        });

        if (increaseBubbleContainerRef.current && increaseStocks.length > 0) {
            observer.observe(increaseBubbleContainerRef.current);
        }
        if (decreaseBubbleContainerRef.current && decreaseStocks.length > 0) {
            observer.observe(decreaseBubbleContainerRef.current);
        }

        return () => {
            observer.disconnect();
            disposeIncrease();
            disposeDecrease();
        };
    }, [
        increaseStocks,
        decreaseStocks,
        disposeIncrease,
        disposeDecrease,
        handleSelectSymbol,
        isPreSession,
        isInfluenceLoading,
        hasInfluenceData,
    ]);

    const renderContent = () => {
        if (isPreSession) {
            return <MarketOutOfSession />;
        }
        if (isInfluenceLoading) {
            return <Skeleton />;
        }
        if (!hasInfluenceData) {
            return <EmptyState />;
        }
        return (
            <div className="flex h-full min-h-0 w-full flex-col gap-2">
                <div ref={increaseBubbleContainerRef} className="min-h-0 w-full flex-1" />
                <div ref={decreaseBubbleContainerRef} className="min-h-0 w-full flex-1" />
            </div>
        );
    };

    return (
        <div className="flex shrink-0 flex-col gap-4">
            <h2 className="font-body-2-highlight text-primary flex items-center gap-2">
                <MarketDot />
                {'Top mã tác động'} {selectedIndex}
            </h2>
            <div className="flex h-60 w-full items-center justify-center">{renderContent()}</div>
        </div>
    );
};
