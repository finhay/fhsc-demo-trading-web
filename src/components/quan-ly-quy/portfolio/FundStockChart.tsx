import { useEffect, useRef, useState } from 'react';

import * as echarts from 'echarts';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { INTRADAY_SPARK_COLORS, INTRADAY_SPARK_FILLS } from '@/constants/fund';
import { useTranslate } from '@/hooks/useTranslate';
import { fetchStockIntradayChartLine } from '@/services/api/datafeed/stock-info';
import type { StockChartLinePoint } from '@/types/datafeed/stock-info';

type Props = {
    symbol: string;
};

const HEIGHT = 80;
const CLASS_NAME = 'rounded-xl bg-quaternary/30';

export const FundStockChart = ({ symbol }: Props) => {
    const trans = useTranslate();
    const mountRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<echarts.ECharts | null>(null);
    const [points, setPoints] = useState<StockChartLinePoint[]>([]);

    useEffect(() => {
        let alive = true;
        const sym = symbol.trim().toUpperCase();
        if (!sym) {
            setPoints([]);
            return undefined;
        }
        fetchStockIntradayChartLine(sym)
            .then((res) => {
                if (!alive) return;
                const vol = res?.data?.chartLineVolatility ?? [];
                setPoints(Array.isArray(vol) ? vol : []);
            })
            .catch(() => {
                if (alive) setPoints([]);
            });
        return () => {
            alive = false;
        };
    }, [symbol]);

    useEffect(() => {
        const el = mountRef.current;
        if (!el || points.length < 2) {
            chartRef.current?.dispose();
            chartRef.current = null;
            return undefined;
        }

        const prices = points.map((p) => p.price);
        const first = prices[0];
        const last = prices[prices.length - 1];
        const trend = last > first ? 'green' : last < first ? 'red' : 'yellow';
        const color = INTRADAY_SPARK_COLORS[trend];
        const fillTop = INTRADAY_SPARK_FILLS[trend];
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const pad = (maxPrice - minPrice) * 0.1 || maxPrice * 0.001;

        const chart = echarts.getInstanceByDom(el) ?? echarts.init(el);
        chartRef.current = chart;
        chart.setOption(
            {
                animation: false,
                backgroundColor: 'transparent',
                grid: { top: 2, right: 0, bottom: 2, left: 0 },
                tooltip: { show: false },
                xAxis: {
                    type: 'category',
                    show: false,
                    boundaryGap: false,
                    data: prices.map((_, i) => i),
                },
                yAxis: {
                    type: 'value',
                    show: false,
                    scale: true,
                    min: minPrice - pad,
                    max: maxPrice + pad,
                },
                series: [
                    {
                        type: 'line',
                        data: prices,
                        showSymbol: false,
                        silent: true,
                        lineStyle: { width: 1.5, color },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: fillTop },
                                { offset: 1, color: 'rgba(0,0,0,0)' },
                            ]),
                        },
                    },
                ],
            },
            true,
        );

        return () => {
            chartRef.current?.dispose();
            chartRef.current = null;
        };
    }, [points]);

    if (points.length < 2) {
        return <EmptyState />;
    }

    return (
        <figure
            className={`w-full ${CLASS_NAME}`}
            style={{ height: HEIGHT }}
            aria-label={`${trans.fund.portfolio.detail.chart_from} – ${trans.fund.portfolio.detail.chart_to}: ${symbol}`}
        >
            <div ref={mountRef} className="h-full w-full" aria-hidden="true" />
        </figure>
    );
};
