'use client';

import { useEffect, useRef, useState } from 'react';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { createChartInvestmentPerformanceModal } from '@/config/market/market-index';
import { INVESTMENT_CHANNEL_PERIODS, INVESTMENT_PERFORMANCE_PERIOD } from '@/constants/market';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import {
    fetchIndexComparison,
    fetchInvestmentChannelPerformance,
} from '@/services/api/datafeed/trading-data';
import type { InvestmentChannelPeriod } from '@/types/datafeed/trading-data';
import type { InvestmentPerformanceBarItem } from '@/types/pages/market';
import { isSuccessApi } from '@/utils/common';

export const MarketIndexInvestment = () => {
    const [period, setPeriod] = useState<InvestmentChannelPeriod>('YTD');
    const [items, setItems] = useState<InvestmentPerformanceBarItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const containerRef = useRef<HTMLDivElement>(null);
    const hasData = items.length > 0;
    const chartInstanceRef = useEChartsInstance(containerRef, {
        shouldInitialize: !isLoading && hasData,
    });

    const mapToPerformanceItems = (
        rawItems: { channel: string; channel_name: string; return_percent: number }[] = [],
    ): InvestmentPerformanceBarItem[] =>
        rawItems.map((item) => ({
            channel: item.channel,
            channelName: item.channel_name,
            returnPercent: item.return_percent,
        }));

    const fetchPerformanceData = async () => {
        setIsLoading(true);
        try {
            const [comparisonRes, channelRes] = await Promise.all([
                fetchIndexComparison(period),
                fetchInvestmentChannelPerformance(period),
            ]);

            const mergedItems = [
                ...(isSuccessApi(comparisonRes.error_code)
                    ? mapToPerformanceItems(comparisonRes.data?.indices)
                    : []),
                ...(isSuccessApi(channelRes.error_code)
                    ? mapToPerformanceItems(channelRes.data?.channels)
                    : []),
            ];

            const uniqueItems = mergedItems.filter(
                (item, index) =>
                    mergedItems.findIndex((it) => it.channel === item.channel) === index,
            );

            setItems(uniqueItems);
        } catch {
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPerformanceData();
    }, [period]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || isLoading || !hasData) return;

        const options = createChartInvestmentPerformanceModal(items);
        if (!options) return;

        chartInstanceRef.current?.setOption(options, { notMerge: true });

        requestAnimationFrame(() => {
            chartInstanceRef.current?.resize();
        });
    }, [items, isLoading, hasData, chartInstanceRef]);

    useEffect(() => {
        const container = containerRef.current;
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
    }, [chartInstanceRef]);

    return (
        <div className="flex shrink-0 flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <h2 className="font-body-2-highlight text-primary">{'So sánh hiệu suất đầu tư'}</h2>
                <div className="flex flex-wrap gap-1">
                    {INVESTMENT_CHANNEL_PERIODS.map((value) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setPeriod(value)}
                            className={`rounded-full px-3 py-1 transition-colors ${
                                period === value
                                    ? 'bg-tertiary font-caption-highlight text-primary'
                                    : 'font-caption text-secondary'
                            }`}
                        >
                            {INVESTMENT_PERFORMANCE_PERIOD[value]}
                        </button>
                    ))}
                </div>
            </div>
            {isLoading ? (
                <div className="flex h-44 w-full">
                    <Skeleton />
                </div>
            ) : !hasData ? (
                <div className="flex h-44 w-full items-center justify-center">
                    <EmptyState />
                </div>
            ) : (
                <div className="h-44 w-full min-h-0">
                    <div ref={containerRef} className="h-full w-full" />
                </div>
            )}
        </div>
    );
};
