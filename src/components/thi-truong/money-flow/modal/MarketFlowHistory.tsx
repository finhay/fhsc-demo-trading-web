'use client';

import { useEffect, useRef } from 'react';

import { FaCircle } from 'react-icons/fa6';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { createChartTradingFlowHistory } from '@/config/market/market-flow';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import type { TradingStatsPeriod } from '@/types/datafeed/trading-data';
import type { TradingFlowSession } from '@/types/pages/market';

type Props = {
    isLoading: boolean;
    sessions: TradingFlowSession[];
    period: TradingStatsPeriod;
};

export const MarketFlowHistory = ({ isLoading, sessions, period }: Props) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const hasData = sessions.length > 0;
    const chartInstanceRef = useEChartsInstance(chartRef, {
        shouldInitialize: !isLoading && hasData,
    });

    useEffect(() => {
        if (isLoading || !hasData) return;
        chartInstanceRef.current?.setOption(createChartTradingFlowHistory(sessions, period), {
            notMerge: true,
        });
        requestAnimationFrame(() => {
            chartInstanceRef.current?.resize();
        });
    }, [isLoading, hasData, sessions, period, chartInstanceRef]);

    useEffect(() => {
        const container = chartRef.current;
        if (!container) return;

        const observer = new ResizeObserver(() => {
            requestAnimationFrame(() => {
                chartInstanceRef.current?.resize();
            });
        });
        observer.observe(container);

        return () => {
            observer.disconnect();
        };
    }, [isLoading, hasData, chartInstanceRef]);

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
            <div className="flex shrink-0 items-center gap-6">
                <div className="flex items-center gap-2">
                    <span className="flex shrink-0 items-center gap-1">
                        <FaCircle className="shrink-0 text-green" size={8} />
                        <FaCircle className="shrink-0 text-red" size={8} />
                    </span>
                    <span className="font-body-3 text-secondary">{'Mua/bán ròng'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <FaCircle className="shrink-0 text-orange" size={8} />
                    <span className="font-body-3 text-secondary">
                        {'GTGD ròng luỹ kế (bên phải)'}
                    </span>
                </div>
            </div>
            <div className="min-h-0 w-full flex-1">
                {isLoading ? (
                    <Skeleton />
                ) : !hasData ? (
                    <EmptyState />
                ) : (
                    <div ref={chartRef} className="h-full w-full" aria-hidden="true" />
                )}
            </div>
        </div>
    );
};
