import type * as echarts from 'echarts';

import type { ExchangeRateChartItem, MacroPoint, OmoHistoryItem } from '@/types/datafeed/finance';
import type { ChartAxisDateStyle, OmoChartTab } from '@/types/pages/market';
import { getNetColor } from '@/utils/common';
import { formatNumberVN } from '@/utils/format';
import { buildCategoryTickIndices, formatChartAxisDate } from '@/utils/market/market-shared';

const EXCHANGE_SERIES = [
    { key: 'VCB' as const, color: '#2994ff' },
    { key: 'SBV' as const, color: '#e98e00' },
    { key: 'BLACK_MARKET' as const, color: '#999999' },
];

const NET_BAR_COLORS = {
    positive: '#3ac45c',
    negative: '#eb4337',
    flat: '#e98e00',
} as const;

const Y_TICK_COUNT = 6;
const CHART_GRID: echarts.GridComponentOption = {
    top: 8,
    right: 12,
    bottom: 8,
    left: 8,
    containLabel: true,
};

const getNiceAxisStep = (value: number): number => {
    if (value <= 0) return 1;
    const exp = Math.floor(Math.log10(value));
    const base = 10 ** exp;
    const steps = [1, 2, 2.5, 5, 10];
    for (const step of steps) {
        if (value <= step * base) return step * base;
    }
    return 10 * base;
};

const getTightYAxisScale = (
    values: number[],
    tickCount = Y_TICK_COUNT,
): { min: number; max: number; interval: number } => {
    const intervals = tickCount - 1;
    const valid = values.filter((value) => Number.isFinite(value));

    if (!valid.length) {
        return { min: 0, max: intervals, interval: 1 };
    }

    let dataMin = Math.min(...valid);
    let dataMax = Math.max(...valid);

    if (dataMin === dataMax) {
        const delta = Math.max(Math.abs(dataMin) * 0.05, 1);
        dataMin -= delta;
        dataMax += delta;
    }

    const span = dataMax - dataMin;
    const pad = Math.max(span * 0.08, Math.abs(dataMax) * 0.001);
    const rawMin = dataMin - pad;
    const rawMax = dataMax + pad;

    let step = getNiceAxisStep((rawMax - rawMin) / intervals);
    let min = Math.floor(rawMin / step) * step;
    let max = min + step * intervals;

    while (max < rawMax) {
        step = getNiceAxisStep(step * 1.25);
        min = Math.floor(rawMin / step) * step;
        max = min + step * intervals;
    }

    return { min, max, interval: step };
};

const getBarYAxisScale = (
    values: number[],
    tickCount = Y_TICK_COUNT,
): { min: number; max: number; interval: number } => {
    const intervals = tickCount - 1;
    const valid = values.filter((value) => Number.isFinite(value));

    if (!valid.length) {
        return { min: -intervals / 2, max: intervals / 2, interval: 1 };
    }

    const dataMin = Math.min(...valid, 0);
    const dataMax = Math.max(...valid, 0);
    const extent = Math.max(Math.abs(dataMin), Math.abs(dataMax), 1e-6);
    let step = getNiceAxisStep(extent / Math.ceil(intervals / 2));
    let max = step * Math.ceil(intervals / 2);
    let min = -max;

    while (max < dataMax || min > dataMin) {
        step = getNiceAxisStep(step * 1.25);
        max = step * Math.ceil(intervals / 2);
        min = -max;
    }

    return { min, max, interval: step };
};

const buildXAxis = (
    dates: string[],
    options?: { boundaryGap?: boolean; dateStyle?: ChartAxisDateStyle },
): echarts.XAXisComponentOption => {
    const dateStyle = options?.dateStyle ?? 'month';
    const tickIndices = new Set(buildCategoryTickIndices(dates.length));

    return {
        type: 'category',
        data: dates.map((date) => formatChartAxisDate(date, dateStyle)),
        boundaryGap: options?.boundaryGap ?? false,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
            color: '#999999',
            fontSize: 12,
            hideOverlap: false,
            showMinLabel: true,
            showMaxLabel: true,
            alignMinLabel: 'left',
            alignMaxLabel: 'right',
            interval: (index: number) => tickIndices.has(index),
        },
    };
};

const buildYAxis = (
    scale: { min: number; max: number; interval: number },
    formatter?: (value: number) => string,
): echarts.YAXisComponentOption => ({
    type: 'value',
    position: 'left',
    min: scale.min,
    max: scale.max,
    interval: scale.interval,
    splitLine: { show: false },
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
        color: '#999999',
        fontSize: 12,
        formatter: (value: number) =>
            formatter ? formatter(value) : formatNumberVN(value, { trimTrailingZeros: true }),
    },
});

const buildTooltip = (options?: { valueSuffix?: string }): echarts.TooltipComponentOption => ({
    trigger: 'axis',
    renderMode: 'html',
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    formatter: (params: unknown) => {
        const list = Array.isArray(params) ? params : [params];
        if (!list.length) return '';
        const first = list[0] as { axisValue?: string };
        const suffix = options?.valueSuffix ?? '';
        const rows = list
            .map((point) => {
                const item = point as {
                    seriesName?: string;
                    value?: number | string | { value?: number };
                    color?: string;
                };
                const raw = typeof item.value === 'object' ? item.value?.value : item.value;
                if (raw == null || !Number.isFinite(Number(raw))) return '';
                const value = Number(raw);
                return `
                    <p class="flex items-center gap-2 body-5 text-secondary">
                        <span class="shrink-0 rounded-full h-2 w-2" style="background:${item.color}" aria-hidden="true"></span>
                        <span class="min-w-0 flex-1">
                            <span>${item.seriesName ?? ''}</span>:
                            <span class="body-5-highlight text-primary">${formatNumberVN(value, { trimTrailingZeros: true })}${suffix}</span>
                        </span>
                    </p>
                `;
            })
            .join('');

        return `
            <div class="flex flex-col gap-1 rounded-xl base-tertiary p-2">
                <span class="body-5 text-secondary">${first.axisValue ?? ''}</span>
                ${rows}
            </div>
        `;
    },
});

const mapOmoNetBarData = (values: number[]) =>
    values.map((value) => {
        const borderRadius: [number, number, number, number] =
            value > 0 ? [4, 4, 0, 0] : value < 0 ? [0, 0, 4, 4] : [0, 0, 0, 0];
        const color =
            value > 0
                ? NET_BAR_COLORS.positive
                : value < 0
                  ? NET_BAR_COLORS.negative
                  : NET_BAR_COLORS.flat;
        return {
            value,
            itemStyle: { color, borderRadius },
        };
    });

export const createChartExchangeRate = (
    items: ExchangeRateChartItem[],
    labels: { vcb: string; sbv: string; free: string },
    dateStyle: ChartAxisDateStyle = 'day',
): echarts.EChartsOption => {
    const dates = items.map((item) => item.date);
    const allValues = items
        .flatMap((item) => [item.VCB, item.SBV, item.BLACK_MARKET])
        .filter((value) => Number.isFinite(value));
    const labelMap = {
        VCB: labels.vcb,
        SBV: labels.sbv,
        BLACK_MARKET: labels.free,
    };

    return {
        animationDuration: 450,
        animationDurationUpdate: 0,
        grid: CHART_GRID,
        xAxis: buildXAxis(dates, { dateStyle }),
        yAxis: buildYAxis(getTightYAxisScale(allValues)),
        tooltip: buildTooltip(),
        series: EXCHANGE_SERIES.map(({ key, color }) => ({
            type: 'line' as const,
            name: labelMap[key],
            data: items.map((item) => item[key]),
            showSymbol: false,
            smooth: 0.15,
            lineStyle: { width: 1.5, color },
            itemStyle: { color },
        })),
    };
};

export const createChartInterbank = (
    points: MacroPoint[],
    seriesName: string,
): echarts.EChartsOption => {
    const dates = points.map((point) => point.date || point.month);
    const values = points.map((point) => point.value).filter((value) => Number.isFinite(value));

    return {
        animationDuration: 450,
        animationDurationUpdate: 0,
        grid: CHART_GRID,
        xAxis: buildXAxis(dates),
        yAxis: buildYAxis(
            getTightYAxisScale(values),
            (value) => `${formatNumberVN(value, { trimTrailingZeros: true })}%`,
        ),
        tooltip: buildTooltip({ valueSuffix: '%' }),
        series: [
            {
                type: 'line',
                name: seriesName,
                data: points.map((point) => point.value),
                showSymbol: false,
                smooth: 0.15,
                lineStyle: { width: 1.5, color: '#2994ff' },
                itemStyle: { color: '#2994ff' },
            },
        ],
    };
};

export const createChartOmo = (
    items: OmoHistoryItem[],
    tab: OmoChartTab,
): echarts.EChartsOption => {
    const dates = items.map((item) => item.date);

    if (tab === 'net') {
        const values = items.map((item) => item.net_injection / 1000);
        const scale = getBarYAxisScale(values);

        return {
            animationDuration: 450,
            animationDurationUpdate: 0,
            grid: CHART_GRID,
            xAxis: buildXAxis(dates, { boundaryGap: true }),
            yAxis: buildYAxis(scale),
            tooltip: {
                trigger: 'axis',
                renderMode: 'html',
                backgroundColor: 'transparent',
                borderWidth: 0,
                padding: 0,
                formatter: (params: unknown) => {
                    const list = Array.isArray(params) ? params : [params];
                    const point = list[0] as {
                        axisValue?: string;
                        value?: number | { value?: number };
                    };
                    const raw =
                        typeof point?.value === 'object' ? point.value?.value : point?.value;
                    const value = Number(raw ?? 0);
                    const label = value > 0 ? 'Bơm ròng' : value < 0 ? 'Hút ròng' : 'Bơm hút ròng';
                    const absVal = formatNumberVN(Math.abs(value), { trimTrailingZeros: true });
                    const valueClass = getNetColor(value);

                    return `
                        <div class="flex flex-col gap-1 rounded-xl base-tertiary p-2">
                            <span class="body-5 text-secondary">${point?.axisValue ?? ''}</span>
                            <p class="body-5 text-secondary">${label}</p>
                            <p class="body-5-highlight ${valueClass}">${absVal}</p>
                        </div>
                    `;
                },
            },
            series: [
                {
                    type: 'bar',
                    name: 'Bơm hút ròng',
                    barWidth: '55%',
                    barMaxWidth: 16,
                    barMinHeight: 2,
                    data: mapOmoNetBarData(values),
                },
            ],
        };
    }

    const values = items.map((item) => item.outstanding_volume / 1000);

    return {
        animationDuration: 450,
        animationDurationUpdate: 0,
        grid: CHART_GRID,
        xAxis: buildXAxis(dates),
        yAxis: buildYAxis(getTightYAxisScale(values)),
        tooltip: buildTooltip(),
        series: [
            {
                type: 'line',
                name: 'Tổng lưu hành',
                data: values,
                showSymbol: false,
                smooth: 0.15,
                lineStyle: { width: 1.5, color: '#2994ff' },
                itemStyle: { color: '#2994ff' },
            },
        ],
    };
};
