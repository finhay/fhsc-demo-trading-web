import * as echarts from 'echarts';

import { CHART_COLORS } from '@/constants/trading';
import { formatNumberVN, formatNumberVNWithUnit } from '@/utils/format';

type ImpactBarItem = { symbol: string; pnl: number };

const formatImpactBarLabel = (v: number): string => {
    const absBn = Math.abs(v) / 1_000_000_000;
    if (!Number.isFinite(absBn) || absBn === 0) return '0';

    let fracDigits = 2;
    if (absBn < 0.01) fracDigits = absBn < 0.001 ? 4 : 3;

    const sign = v >= 0 ? '+' : '-';
    return `${sign}${formatNumberVN(absBn, { decimals: fracDigits, trimTrailingZeros: false })}`;
};

export const createChartFundStockImpact = (data: ImpactBarItem[]): echarts.EChartsOption => {
    const seriesData: echarts.BarSeriesOption['data'] = data.map((d) => {
        const isPositive = d.pnl >= 0;
        const color = isPositive ? '#3AC45C' : '#EB4337';
        const pnlText = formatImpactBarLabel(d.pnl);
        const labelText = isPositive
            ? `{val|${pnlText}}\n{sym|${d.symbol}}`
            : `{sym|${d.symbol}}\n{val|${pnlText}}`;

        return {
            value: d.pnl,
            itemStyle: {
                color,
                borderRadius: isPositive ? [4, 4, 0, 0] : [0, 0, 4, 4],
            },
            label: {
                position: isPositive ? 'top' : 'bottom',
                formatter: labelText,
                rich: {
                    val: { color, fontSize: 12, lineHeight: 16 },
                    sym: { color: '#F8F8F8', fontSize: 12, lineHeight: 16 },
                },
            },
        };
    });

    return {
        animation: true,
        animationDuration: 400,
        backgroundColor: CHART_COLORS.background,
        grid: { top: 30, right: 8, bottom: 30, left: 0, containLabel: true },
        xAxis: {
            type: 'category',
            data: data.map((d) => d.symbol),
            axisLabel: { show: false },
            axisTick: { show: false },
            axisLine: { show: false },
        },
        yAxis: {
            type: 'value',
            position: 'right',
            splitNumber: 5,
            splitLine: {
                lineStyle: { type: 'dashed', color: CHART_COLORS.grid },
            },
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
                color: CHART_COLORS.axis.label,
                fontSize: 10,
                formatter: (value: number) => formatNumberVNWithUnit(value),
            },
        },
        tooltip: {
            trigger: 'item',
            renderMode: 'html',
            backgroundColor: 'transparent',
            borderWidth: 0,
            padding: 0,
            position: (point, _params, _dom, _rect, size) => {
                const [viewW, viewH] = size.viewSize as [number, number];
                const [contentW, contentH] = size.contentSize as [number, number];
                const x = Math.min(Math.max(8, point[0] + 16), viewW - contentW - 8);
                const y = Math.min(Math.max(8, point[1] - contentH - 12), viewH - contentH - 8);
                return [x, y];
            },
            formatter: (params) => {
                const p = Array.isArray(params) ? params[0] : params;
                const pnl = Number((p as { value?: number }).value ?? 0);
                const symbol = (p as { name?: string }).name ?? '';
                const valueClass = pnl >= 0 ? 'text-green' : 'text-red';
                const display = formatNumberVNWithUnit(pnl);
                return `<div class="rounded-xl bg-tertiary p-2">
                    <span class="font-caption-highlight text-primary">${symbol}:</span>
                    <span class="font-caption-highlight ${valueClass}">${display}</span>
                </div>`;
            },
        },
        series: [
            {
                type: 'bar',
                barMaxWidth: 40,
                data: seriesData,
                label: {
                    show: true,
                    fontSize: 12,
                },
                markLine: {
                    silent: true,
                    symbol: 'none',
                    animation: false,
                    label: { show: false },
                    lineStyle: { color: '#666666', type: 'dashed', width: 1 },
                    data: [{ yAxis: 0 }],
                },
            },
        ],
    };
};
