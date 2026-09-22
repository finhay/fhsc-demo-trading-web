'use client';

import { useEffect, useRef, useState } from 'react';

import { createChartSilverPriceHistory } from '@/config/market/market-assets';
import { ASSETS_MODAL } from '@/constants/assets';
import { METAL_CHART_DEFAULT_DAYS, METAL_CHART_PERIODS } from '@/constants/market';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import { fetchSilverChart } from '@/services/api/datafeed/finance';
import type { MetalChartDays, SilverChartItem, SilverItem } from '@/types/datafeed/finance';
import { isSuccessApi } from '@/utils/common';
import { getChangeColor } from '@/utils/common';
import { formatNumberVN } from '@/utils/format';
import { formatMetalChangePercent } from '@/utils/market/market-assets';

type Props = {
    globalItem: SilverItem | null;
    initialChartData: SilverChartItem[];
};

const formatLegendValue = (value?: number | null) =>
    value == null ? '--' : formatNumberVN(value, { trimTrailingZeros: true });

export const MarketSilverChart = ({ globalItem, initialChartData }: Props) => {
    const modal = ASSETS_MODAL;
    const [days, setDays] = useState<MetalChartDays>(METAL_CHART_DEFAULT_DAYS);
    const [chartData, setChartData] = useState<SilverChartItem[]>(initialChartData);

    const requestedDaysRef = useRef<MetalChartDays>(METAL_CHART_DEFAULT_DAYS);
    const containerRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useEChartsInstance(containerRef);

    const changePercent = globalItem?.change_percent ?? null;
    const changeLabel = formatMetalChangePercent(changePercent);
    const lastItem = chartData.at(-1);
    const legends = [
        {
            key: 'bar',
            label: modal.legend_silver_bar,
            colorClass: 'base-blue',
            value: lastItem?.silver_bar,
        },
        {
            key: 'global',
            label: modal.legend_silver_global,
            colorClass: 'bg-gray',
            value: lastItem?.silver_global,
        },
    ];

    const handleChangeDays = async (nextDays: MetalChartDays) => {
        if (nextDays === days) return;

        setDays(nextDays);
        requestedDaysRef.current = nextDays;

        try {
            const { data, error_code } = await fetchSilverChart(nextDays);
            if (requestedDaysRef.current !== nextDays) return;
            setChartData(isSuccessApi(error_code) ? (data ?? []) : []);
        } catch {
            if (requestedDaysRef.current !== nextDays) return;
            setChartData([]);
        }
    };

    useEffect(() => {
        const options = createChartSilverPriceHistory(
            chartData,
            {
                silverBar: modal.legend_silver_bar,
                silverGlobal: modal.legend_silver_global,
            },
            days,
        );
        if (!options) return;

        chartInstanceRef.current?.setOption(options, { notMerge: true });
        requestAnimationFrame(() => {
            chartInstanceRef.current?.resize();
        });
    }, [chartData, modal, days, chartInstanceRef]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new ResizeObserver(() => {
            requestAnimationFrame(() => {
                chartInstanceRef.current?.resize();
            });
        });
        observer.observe(container);
        return () => observer.disconnect();
    }, [chartInstanceRef]);

    return (
        <div className="base-secondary flex flex-col gap-4 rounded-2xl p-4">
            <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <h4 className="body-3-highlight text-primary">
                        {modal.silver_global_label}
                    </h4>
                    <span className="body-4 text-secondary">({modal.unit_usd_ounce})</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="body-2-highlight text-primary">
                        {globalItem?.usd_value
                            ? formatNumberVN(globalItem.usd_value, { decimals: 2 })
                            : '--'}
                    </span>
                    {changeLabel && (
                        <span className={`body-4 ${getChangeColor(changePercent ?? 0)}`}>
                            {changeLabel}
                        </span>
                    )}
                </div>
            </div>

            <div className="border-tertiary border-t" aria-hidden="true" />

            <div className="flex flex-wrap items-center gap-3">
                {METAL_CHART_PERIODS.map((period) => {
                    const isActive = days === period.value;
                    return (
                        <button
                            key={period.value}
                            type="button"
                            onClick={() => handleChangeDays(period.value)}
                            className={`rounded-full px-3 py-1 transition-colors ${
                                isActive
                                    ? 'base-tertiary body-4-highlight text-primary'
                                    : 'body-4 text-secondary'
                            }`}
                        >
                            {modal[period.labelKey]}
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-wrap items-center gap-4">
                {legends.map((legend) => (
                    <div
                        key={legend.key}
                        className="border-tertiary flex items-center gap-4 rounded-full border px-3 py-1"
                    >
                        <div className="flex items-center gap-2">
                            <span
                                className={`h-2 w-2 shrink-0 rounded-full ${legend.colorClass}`}
                                aria-hidden
                            />
                            <span className="body-4 text-secondary">{legend.label}</span>
                        </div>
                        <span className="body-4-highlight text-primary">
                            {formatLegendValue(legend.value)}
                        </span>
                    </div>
                ))}
            </div>

            <div className="h-72 w-full">
                <div ref={containerRef} className="h-full w-full" aria-hidden="true" />
            </div>
        </div>
    );
};
