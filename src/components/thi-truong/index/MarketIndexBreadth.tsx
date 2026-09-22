'use client';

import { useEffect, useMemo, useRef } from 'react';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { MarketDot } from '@/components/thi-truong/shared/MarketDot';
import { MarketOutOfSession } from '@/components/thi-truong/shared/MarketOutOfSession';
import { createChartMarketBreadth } from '@/config/market/market-index';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import { useMarketIndexStore } from '@/stores/common/useMarketIndexStore';
import type { MarketBreadthChartData } from '@/types/pages/market';
import { hasMarketBreadthData } from '@/utils/market/market-index';

type Props = {
    selectedIndex: string;
};

export const MarketIndexBreadth = ({ selectedIndex }: Props) => {
    const { data, isPreSession } = useMarketIndexStore();

    const containerRef = useRef<HTMLDivElement>(null);

    const indexData = data.find((item) => item?.index === selectedIndex);
    const breadthData: MarketBreadthChartData | null = useMemo(() => {
        if (!indexData?.times?.length) return null;
        return {
            times: indexData.times,
            floors: indexData.floors ?? [],
            declines: indexData.declinesArr ?? [],
            nochanges: indexData.nochangesArr ?? [],
            advances: indexData.advancesArr ?? [],
            ceilings: indexData.ceilings ?? [],
        };
    }, [indexData]);

    const hasBreadthData = hasMarketBreadthData(breadthData);
    const shouldShowChart = !isPreSession && hasBreadthData;
    const chartInstanceRef = useEChartsInstance(containerRef, {
        shouldInitialize: shouldShowChart,
    });

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !shouldShowChart || !breadthData) return;

        const options = createChartMarketBreadth(breadthData);
        if (!options) return;

        chartInstanceRef.current?.setOption(options, { lazyUpdate: true });

        requestAnimationFrame(() => {
            chartInstanceRef.current?.resize();
        });
    }, [breadthData, shouldShowChart, chartInstanceRef]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !shouldShowChart) return;

        const observer = new ResizeObserver(() => {
            requestAnimationFrame(() => {
                chartInstanceRef.current?.resize();
            });
        });
        observer.observe(container);

        return () => {
            observer.disconnect();
        };
    }, [chartInstanceRef, shouldShowChart]);

    const renderContent = () => {
        if (isPreSession) {
            return <MarketOutOfSession />;
        }
        if (!hasBreadthData) {
            return <EmptyState />;
        }
        return <div ref={containerRef} className="h-full w-full" />;
    };

    return (
        <div className="flex shrink-0 flex-col gap-4">
            <h2 className="body-3-highlight text-primary flex items-center gap-2">
                <MarketDot />
                {'Độ rộng thị trường'}
            </h2>
            <div className="flex h-80 w-full min-h-0 items-center justify-center">
                {renderContent()}
            </div>
        </div>
    );
};
