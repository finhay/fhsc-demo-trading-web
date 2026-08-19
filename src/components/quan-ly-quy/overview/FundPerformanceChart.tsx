import { useEffect, useRef, useState } from 'react';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { createChartFundStockImpact } from '@/config/fund';
import { FUND_IMPACT_CHART_THROTTLE_MS } from '@/constants/fund';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import { useTranslate } from '@/hooks/useTranslate';
import { useFundDataStore } from '@/stores/fund/useFundDataStore';
import { calcTopStockImpact } from '@/utils/fund/fund';

export const FundPerformanceChart = () => {
    const trans = useTranslate();
    const { portfolioSummary, holdings } = useFundDataStore();

    const holdingSymbols = Array.from(new Set(holdings.map((h) => h.ma_ck)));

    const isHoveringChartRef = useRef(false);
    const lastCommitRef = useRef(0);
    const pendingTimerRef = useRef<number | null>(null);

    const [impactData, setImpactData] = useState(() => calcTopStockImpact(portfolioSummary));

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useEChartsInstance(chartContainerRef, {
        shouldInitialize: impactData.length > 0,
    });

    useEffect(() => {
        if (holdingSymbols.length === 0) {
            setImpactData([]);
            return;
        }

        const next = calcTopStockImpact(portfolioSummary);
        if (next.length === 0) {
            setImpactData([]);
            return;
        }

        const commit = () => {
            lastCommitRef.current = Date.now();
            setImpactData(calcTopStockImpact(useFundDataStore.getState().portfolioSummary));
        };

        if (isHoveringChartRef.current) return;

        const elapsed = Date.now() - lastCommitRef.current;
        if (elapsed >= FUND_IMPACT_CHART_THROTTLE_MS) {
            commit();
        } else if (pendingTimerRef.current == null) {
            pendingTimerRef.current = window.setTimeout(() => {
                pendingTimerRef.current = null;
                if (!isHoveringChartRef.current) commit();
            }, FUND_IMPACT_CHART_THROTTLE_MS - elapsed);
        }
    }, [portfolioSummary, holdingSymbols.length]);

    useEffect(() => {
        return () => {
            if (pendingTimerRef.current != null) window.clearTimeout(pendingTimerRef.current);
        };
    }, []);

    useEffect(() => {
        const el = chartContainerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            requestAnimationFrame(() => chartInstanceRef.current?.resize());
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [chartInstanceRef]);

    useEffect(() => {
        if (impactData.length === 0) return;
        chartInstanceRef.current?.setOption(createChartFundStockImpact(impactData));
        requestAnimationFrame(() => chartInstanceRef.current?.resize());
    }, [impactData, chartInstanceRef]);

    return (
        <figure className="flex h-full flex-col gap-2 rounded-xl bg-secondary p-4">
            <figcaption className="shrink-0">
                <h3 className="font-body-2-highlight text-primary">
                    {trans.fund.overview.chart.title}
                </h3>
            </figcaption>
            {impactData.length === 0 ? (
                <EmptyState />
            ) : (
                <div
                    ref={chartContainerRef}
                    role="img"
                    aria-label={trans.fund.overview.chart.title}
                    className="min-h-0 w-full flex-1"
                    onMouseEnter={() => {
                        isHoveringChartRef.current = true;
                    }}
                    onMouseLeave={() => {
                        isHoveringChartRef.current = false;
                        const ps = useFundDataStore.getState().portfolioSummary;
                        setImpactData(calcTopStockImpact(ps));
                        lastCommitRef.current = Date.now();
                    }}
                />
            )}
        </figure>
    );
};
