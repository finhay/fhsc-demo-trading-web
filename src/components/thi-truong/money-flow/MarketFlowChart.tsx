'use client';

import { useEffect, useRef } from 'react';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { createChartTradingFlow } from '@/config/market/market-flow';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import { useTranslate } from '@/hooks/useTranslate';
import type { TradingFlowSession } from '@/types/pages/market';

type Props = {
    sessions: TradingFlowSession[];
    isLoading?: boolean;
};

export const MarketFlowChart = ({ sessions, isLoading = false }: Props) => {
    const trans = useTranslate();
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useEChartsInstance(chartRef, {
        shouldInitialize: !isLoading && sessions.length > 0,
    });

    useEffect(() => {
        if (isLoading || sessions.length === 0) return;
        chartInstanceRef.current?.setOption(createChartTradingFlow(sessions, trans));
        requestAnimationFrame(() => {
            chartInstanceRef.current?.resize();
        });
    }, [isLoading, sessions, trans, chartInstanceRef]);

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
    }, [sessions.length, chartInstanceRef]);

    return (
        <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-xl border border-tertiary p-4">
            <div className="flex items-center gap-2">
                <h3 className="font-body-3-highlight text-primary">
                    {trans.market.flow.net_10_sessions}
                </h3>
                <span className="font-caption text-tertiary">({trans.market.flow.unit_value})</span>
            </div>
            {isLoading ? (
                <div className="min-h-40 w-full flex-1">
                    <Skeleton />
                </div>
            ) : sessions.length === 0 ? (
                <div className="flex min-h-40 flex-1 items-center justify-center">
                    <EmptyState />
                </div>
            ) : (
                <div className="min-h-40 w-full flex-1">
                    <div ref={chartRef} className="h-full w-full" aria-hidden="true" />
                </div>
            )}
        </div>
    );
};
