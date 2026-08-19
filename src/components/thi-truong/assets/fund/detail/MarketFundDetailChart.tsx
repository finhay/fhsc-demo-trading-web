'use client';

import { useEffect, useRef, useState } from 'react';

import { createChartFundNavHistory } from '@/config/market/market-fund-detail';
import { FUND_NAV_CHART_DEFAULT_PERIOD, FUND_NAV_CHART_PERIODS } from '@/constants/market';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import { useTranslate } from '@/hooks/useTranslate';
import { fetchFundNavHistories } from '@/services/api/fund';
import type { FundNavChartPeriod, FundNavHistoryItem } from '@/types/pages/fund';
import { isSuccessApi } from '@/utils/common';
import { formatDate, formatNumberVN } from '@/utils/format';

type Props = {
    fundName: string;
    latestNav: { navpf: number | null; date: string | null };
    initialChartData: FundNavHistoryItem[];
};

const isChartDate = (value: string) =>
    /^\d{4}-\d{2}-\d{2}/.test(value) ||
    /^\d{2}\/\d{2}\/\d{4}/.test(value) ||
    /^\d{2}-\d{2}-\d{4}/.test(value) ||
    /^\d{1,2}\/\d{4}$/.test(value) ||
    /^\d{1,2}-\d{4}$/.test(value);

export const MarketFundDetailChart = ({ fundName, latestNav, initialChartData }: Props) => {
    const trans = useTranslate();
    const d = trans.market.assets.fund_modal.detail;

    const [period, setPeriod] = useState<FundNavChartPeriod>(FUND_NAV_CHART_DEFAULT_PERIOD);
    const [chartData, setChartData] = useState<FundNavHistoryItem[]>(initialChartData);

    const requestedPeriodRef = useRef<FundNavChartPeriod>(FUND_NAV_CHART_DEFAULT_PERIOD);
    const containerRef = useRef<HTMLDivElement>(null);
    const hasData = chartData.length > 0;
    const chartInstanceRef = useEChartsInstance(containerRef, { shouldInitialize: hasData });

    const latestPoint = hasData ? chartData[chartData.length - 1] : null;
    const displayNavpf = latestPoint?.navpf ?? latestNav.navpf;
    const displayDate = latestPoint?.date ?? latestNav.date;
    const formattedDate =
        displayDate && isChartDate(displayDate)
            ? /^\d{1,2}[/-]\d{4}$/.test(displayDate)
                ? formatDate(displayDate, 'MM/YYYY')
                : formatDate(displayDate)
            : '';

    const handleChangePeriod = async (nextPeriod: FundNavChartPeriod) => {
        if (nextPeriod === period) return;

        setPeriod(nextPeriod);
        requestedPeriodRef.current = nextPeriod;

        try {
            const { result, error_code } = await fetchFundNavHistories(fundName, nextPeriod);
            if (requestedPeriodRef.current !== nextPeriod) return;
            setChartData(isSuccessApi(error_code) ? (result?.nav_histories ?? []) : []);
        } catch {
            if (requestedPeriodRef.current !== nextPeriod) return;
            setChartData([]);
        }
    };

    useEffect(() => {
        if (!hasData) return;

        const options = createChartFundNavHistory(chartData);
        if (!options) return;

        chartInstanceRef.current?.setOption(options, { notMerge: true });
        requestAnimationFrame(() => {
            chartInstanceRef.current?.resize();
        });
    }, [chartData, hasData, chartInstanceRef]);

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
    }, [hasData, chartInstanceRef]);

    return (
        <section className="flex flex-col gap-4 rounded-2xl bg-secondary p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                    <span className="font-body-3 text-secondary">
                        {d.latest_price_label}{' '}
                        {formattedDate ? d.latest_price_date_fn(formattedDate) : null}
                    </span>
                    <span className="font-heading-4 text-primary">
                        {displayNavpf == null
                            ? '--'
                            : `${formatNumberVN(displayNavpf, { decimals: 2 })}đ`}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    {FUND_NAV_CHART_PERIODS.map((item) => {
                        const isActive = period === item;
                        return (
                            <button
                                key={item}
                                type="button"
                                onClick={() => handleChangePeriod(item)}
                                className={`rounded-full px-3 py-1 transition-colors ${
                                    isActive
                                        ? 'bg-tertiary font-body-3-highlight text-primary'
                                        : 'font-body-3 text-secondary'
                                }`}
                            >
                                {d.chart_periods[item]}
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="h-96 w-full">
                <div ref={containerRef} className="h-full w-full" aria-hidden="true" />
            </div>
        </section>
    );
};
