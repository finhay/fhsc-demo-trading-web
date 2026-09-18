import type * as echarts from 'echarts';

import { MACRO_SERIES_COLORS } from '@/constants/market';
import type { MacroExportPoint, MacroPoint } from '@/types/datafeed/finance';
import { formatNumberVN } from '@/utils/format';
import { buildCategoryTickIndices, formatChartAxisDate } from '@/utils/market/market-shared';

const Y_TICK_COUNT = 4;
const CHART_GRID: echarts.GridComponentOption = {
    top: 8,
    right: 8,
    bottom: 8,
    left: 8,
    containLabel: true,
};

type MacroChartSeries = {
    name: string;
    color: string;
    values: (number | null)[];
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

const buildXAxis = (dates: string[]): echarts.XAXisComponentOption => {
    const tickIndices = new Set(buildCategoryTickIndices(dates.length));

    return {
        type: 'category',
        data: dates.map((date) => formatChartAxisDate(date, 'month')),
        boundaryGap: false,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
            color: '#999999',
            fontSize: 12,
            margin: 16,
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

const buildTooltip = (options?: {
    valueSuffix?: string;
    valueFormatter?: (value: number) => string;
}): echarts.TooltipComponentOption => ({
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
                const formatted = options?.valueFormatter
                    ? options.valueFormatter(value)
                    : `${formatNumberVN(value, { trimTrailingZeros: true })}${suffix}`;
                return `
                    <p class="flex items-center gap-2 body-5 text-secondary">
                        <span class="shrink-0 rounded-full h-2 w-2" style="background:${item.color}" aria-hidden="true"></span>
                        <span class="min-w-0 flex-1">
                            <span>${item.seriesName ?? ''}</span>:
                            <span class="body-5-highlight text-primary">${formatted}</span>
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

const sortMacroPoints = (points: MacroPoint[]): MacroPoint[] =>
    [...points].sort((a, b) => {
        const aKey = a.date || a.month;
        const bKey = b.date || b.month;
        return aKey.localeCompare(bKey);
    });

const sortExportPoints = (points: MacroExportPoint[]): MacroExportPoint[] =>
    [...points].sort((a, b) => a.month.localeCompare(b.month));

export const createChartMacroLine = (
    points: MacroPoint[],
    seriesName: string,
    options?: {
        color?: string;
        valueSuffix?: string;
        yFormatter?: (value: number) => string;
        valueFormatter?: (value: number) => string;
    },
): echarts.EChartsOption => {
    const sorted = sortMacroPoints(points);
    const dates = sorted.map((point) => point.date || point.month);
    const values = sorted.map((point) => point.value).filter((value) => Number.isFinite(value));
    const color = options?.color ?? MACRO_SERIES_COLORS.orange;
    const suffix = options?.valueSuffix ?? '';

    return {
        animationDuration: 450,
        animationDurationUpdate: 0,
        grid: CHART_GRID,
        xAxis: buildXAxis(dates),
        yAxis: buildYAxis(
            getTightYAxisScale(values),
            options?.yFormatter ??
                ((value) => `${formatNumberVN(value, { trimTrailingZeros: true })}${suffix}`),
        ),
        tooltip: buildTooltip({
            valueSuffix: suffix,
            valueFormatter: options?.valueFormatter,
        }),
        series: [
            {
                type: 'line',
                name: seriesName,
                data: sorted.map((point) => point.value),
                showSymbol: false,
                smooth: 0.15,
                lineStyle: { width: 1.5, color },
                itemStyle: { color },
            },
        ],
    };
};

export const createChartMacroMulti = (
    dates: string[],
    series: MacroChartSeries[],
    options?: { valueSuffix?: string },
): echarts.EChartsOption => {
    const allValues = series
        .flatMap((item) => item.values)
        .filter((value): value is number => value != null && Number.isFinite(value));
    const suffix = options?.valueSuffix ?? '';

    return {
        animationDuration: 450,
        animationDurationUpdate: 0,
        grid: CHART_GRID,
        xAxis: buildXAxis(dates),
        yAxis: buildYAxis(
            getTightYAxisScale(allValues),
            (value) => `${formatNumberVN(value, { trimTrailingZeros: true })}${suffix}`,
        ),
        tooltip: buildTooltip({ valueSuffix: suffix }),
        series: series.map((item) => ({
            type: 'line' as const,
            name: item.name,
            data: item.values,
            showSymbol: false,
            smooth: 0.15,
            lineStyle: { width: 1.5, color: item.color },
            itemStyle: { color: item.color },
        })),
    };
};

export const buildExportChartSeries = (
    points: MacroExportPoint[],
    labels: { domestic: string; fdi: string; total: string },
): { dates: string[]; series: MacroChartSeries[] } => {
    const sorted = sortExportPoints(points);
    return {
        dates: sorted.map((point) => point.month),
        series: [
            {
                name: labels.domestic,
                color: MACRO_SERIES_COLORS.blue,
                values: sorted.map((point) => point.domestic),
            },
            {
                name: labels.fdi,
                color: MACRO_SERIES_COLORS.orange,
                values: sorted.map((point) => point.fdi),
            },
            {
                name: labels.total,
                color: MACRO_SERIES_COLORS.gray,
                values: sorted.map((point) => point.total),
            },
        ],
    };
};

export const buildDualMacroChartSeries = (
    primary: MacroPoint[],
    secondary: MacroPoint[],
    labels: { primary: string; secondary: string },
    colors?: { primary?: string; secondary?: string },
): { dates: string[]; series: MacroChartSeries[] } => {
    const primarySorted = sortMacroPoints(primary);
    const secondarySorted = sortMacroPoints(secondary);
    const monthSet = new Set<string>();
    primarySorted.forEach((point) => monthSet.add(point.date || point.month));
    secondarySorted.forEach((point) => monthSet.add(point.date || point.month));
    const dates = Array.from(monthSet).sort((a, b) => a.localeCompare(b));

    const primaryMap = new Map(
        primarySorted.map((point) => [point.date || point.month, point.value]),
    );
    const secondaryMap = new Map(
        secondarySorted.map((point) => [point.date || point.month, point.value]),
    );

    return {
        dates,
        series: [
            {
                name: labels.primary,
                color: colors?.primary ?? MACRO_SERIES_COLORS.blue,
                values: dates.map((date) => primaryMap.get(date) ?? null),
            },
            {
                name: labels.secondary,
                color: colors?.secondary ?? MACRO_SERIES_COLORS.orange,
                values: dates.map((date) => secondaryMap.get(date) ?? null),
            },
        ],
    };
};
