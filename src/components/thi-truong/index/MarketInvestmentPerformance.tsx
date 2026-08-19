'use client';

import { useEffect, useRef, useState } from 'react';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Dropdown } from '@/components/common/ui/Dropdown';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { createChartInvestmentPerformance } from '@/config/market/market-index';
import { INVESTMENT_CHANNEL_PERIODS, INVESTMENT_PERFORMANCE_PERIOD } from '@/constants/market';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import {
    fetchIndexComparison,
    fetchInvestmentChannelPerformance,
} from '@/services/api/datafeed/trading-data';
import type { InvestmentChannelPeriod } from '@/types/datafeed/trading-data';
import type { InvestmentPerformanceBarItem } from '@/types/pages/market';
import { isSuccessApi } from '@/utils/common';

export const MarketInvestmentPerformance = () => {
    const [view, setView] = useState<string>('market');
    const [period, setPeriod] = useState<InvestmentChannelPeriod>('YTD');
    const [items, setItems] = useState<InvestmentPerformanceBarItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const containerRef = useRef<HTMLDivElement>(null);
    const hasData = items.length > 0;
    const chartInstanceRef = useEChartsInstance(containerRef, {
        shouldInitialize: !isLoading && hasData,
    });

    const viewOptions = [
        { value: 'market', label: 'Thị trường' },
        {
            value: 'investment_channel',
            label: 'Kênh đầu tư',
        },
    ];

    const mapToPerformanceItems = (
        items: { channel: string; channel_name: string; return_percent: number }[] = [],
    ): InvestmentPerformanceBarItem[] =>
        items.map((item) => ({
            channel: item.channel,
            channelName: item.channel_name,
            returnPercent: item.return_percent,
        }));

    const fetchPerformanceData = async () => {
        setIsLoading(true);
        try {
            if (view === 'market') {
                const res = await fetchIndexComparison(period);
                if (isSuccessApi(res.error_code)) {
                    setItems(mapToPerformanceItems(res.data?.indices));
                } else {
                    setItems([]);
                }
            } else {
                const res = await fetchInvestmentChannelPerformance(period);
                if (isSuccessApi(res.error_code)) {
                    setItems(mapToPerformanceItems(res.data?.channels));
                } else {
                    setItems([]);
                }
            }
        } catch {
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPerformanceData();
    }, [period, view]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || isLoading || !hasData) return;

        const options = createChartInvestmentPerformance(items);
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
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="font-body-2-highlight text-primary">{'Hiệu suất đầu tư'}</h2>
                    <Dropdown
                        options={viewOptions}
                        value={view}
                        onChange={(value) => setView(value as string)}
                    />
                </div>
                <div className="flex gap-1">
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
                <div className="flex h-96 w-full">
                    <Skeleton />
                </div>
            ) : !hasData ? (
                <div className="flex h-96 w-full items-center justify-center">
                    <EmptyState />
                </div>
            ) : (
                <div className="h-96 w-full min-h-0 rounded-xl border border-tertiary px-3 py-1">
                    <div className="relative h-full w-full">
                        <div ref={containerRef} className="h-full w-full" />
                        <div className="pointer-events-none absolute inset-0 flex flex-col">
                            {items.map((item, index) => (
                                <div
                                    key={item.channel}
                                    className={`flex-1 ${
                                        index < items.length - 1 ? 'border-b border-tertiary' : ''
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
