import type * as echarts from 'echarts';

import type { GoldChartItem, MetalChartDays, SilverChartItem } from '@/types/datafeed/finance';
import { formatNumberVN } from '@/utils/format';
import {
    buildCategoryTickIndices,
    formatChartAxisDate,
    resolveChartAxisDateStyle,
} from '@/utils/market/market-shared';

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

const SERIES_COLOR = {
    goldBar: '#2994ff',
    goldRing: '#e98e00',
    goldGlobal: '#999999',
    silverBar: '#2994ff',
    silverGlobal: '#999999',
} as const;

const MAX_Y_TICKS = 6;

type MetalLegendLabels = {
    goldBar: string;
    goldRing: string;
    goldGlobal: string;
    silverBar: string;
    silverGlobal: string;
};

const buildLineSeries = (
    name: string,
    data: (number | null)[],
    color: string,
): echarts.SeriesOption => ({
    type: 'line',
    name,
    data,
    symbol: 'none',
    showSymbol: false,
    connectNulls: false,
    lineStyle: { color, width: 1.5 },
    itemStyle: { color },
});

const collectSeriesValues = (series: echarts.SeriesOption[]): number[] => {
    const values: number[] = [];
    series.forEach((item) => {
        const data = (item as { data?: (number | null)[] }).data;
        if (!Array.isArray(data)) return;
        data.forEach((value) => {
            if (typeof value === 'number' && Number.isFinite(value)) values.push(value);
        });
    });
    return values;
};

const buildMetalYAxisScale = (values: number[]) => {
    if (values.length === 0) return { min: 0, max: 100, interval: 20 };

    const dataMin = Math.min(...values);
    const dataMax = Math.max(...values);
    const span = dataMax - dataMin || Math.abs(dataMax) || 1;
    let interval = getNiceAxisStep(span / (MAX_Y_TICKS - 1));
    let min = Math.floor(dataMin / interval) * interval;
    let max = Math.ceil(dataMax / interval) * interval;
    let ticks = Math.round((max - min) / interval) + 1;

    while (ticks > MAX_Y_TICKS) {
        interval = getNiceAxisStep(interval * 2);
        min = Math.floor(dataMin / interval) * interval;
        max = Math.ceil(dataMax / interval) * interval;
        ticks = Math.round((max - min) / interval) + 1;
    }

    return { min, max, interval };
};

const buildMetalHistoryOption = (
    categories: string[],
    series: echarts.SeriesOption[],
): echarts.EChartsOption | null => {
    if (categories.length === 0 || series.length === 0) return null;

    const xTickIndices = new Set(buildCategoryTickIndices(categories.length));
    const yScale = buildMetalYAxisScale(collectSeriesValues(series));

    return {
        animation: false,
        grid: { top: 10, right: 30, bottom: 10, left: 10, containLabel: true },
        legend: { show: false },
        xAxis: {
            type: 'category',
            data: categories,
            boundaryGap: false,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
                color: '#666666',
                fontSize: 12,
                margin: 16,
                interval: 0,
                showMinLabel: true,
                showMaxLabel: true,
                formatter: (_value: string, index: number) =>
                    xTickIndices.has(index) ? categories[index] : '',
            },
            axisPointer: {
                show: true,
                type: 'line',
                lineStyle: { color: '#999999', type: 'dashed', width: 1 },
            },
        },
        yAxis: {
            type: 'value',
            min: yScale.min,
            max: yScale.max,
            interval: yScale.interval,
            splitLine: { show: false },
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
                color: '#666666',
                fontSize: 12,
                formatter: (value: number) => formatNumberVN(value, { decimals: 0 }),
            },
        },
        tooltip: {
            trigger: 'axis',
            renderMode: 'html',
            backgroundColor: 'transparent',
            borderWidth: 0,
            padding: 0,
            formatter: (params: unknown) => {
                const list = Array.isArray(params) ? params : [params];
                if (list.length === 0) return '';

                const first = list[0] as { axisValue?: string; name?: string };
                const title = first.axisValue ?? first.name ?? '';

                const rows = list
                    .map((item) => {
                        const point = item as {
                            color?: string;
                            seriesName?: string;
                            value?: number | null;
                        };
                        if (point.value == null) return '';
                        return `
                            <p class="flex items-center gap-2 body-5 text-secondary">
                                <span
                                    class="h-2 w-2 shrink-0 rounded-full"
                                    style="background-color:${point.color ?? '#999999'}"
                                    aria-hidden="true"
                                ></span>
                                <span class="min-w-0 flex-1">
                                    <span>${point.seriesName ?? ''}</span>:
                                    <span class="body-5-highlight text-primary">${formatNumberVN(
                                        Number(point.value),
                                        { decimals: 2 },
                                    )}</span>
                                </span>
                            </p>
                        `;
                    })
                    .filter(Boolean)
                    .join('');

                return `
                    <div class="flex flex-col gap-1 rounded-xl base-tertiary p-2">
                        <span class="body-5 text-secondary">${title}</span>
                        ${rows}
                    </div>
                `;
            },
        },
        series,
    };
};

export const createChartGoldPriceHistory = (
    data: GoldChartItem[],
    labels: Pick<MetalLegendLabels, 'goldBar' | 'goldRing' | 'goldGlobal'>,
    days: MetalChartDays,
): echarts.EChartsOption | null => {
    if (data.length === 0) return null;

    const dateStyle = resolveChartAxisDateStyle(days);
    const categories = data.map((item) => formatChartAxisDate(item.date, dateStyle));
    const series = [
        buildLineSeries(
            labels.goldBar,
            data.map((item) => item.gold_bar ?? null),
            SERIES_COLOR.goldBar,
        ),
        buildLineSeries(
            labels.goldRing,
            data.map((item) => item.gold_ring ?? null),
            SERIES_COLOR.goldRing,
        ),
        buildLineSeries(
            labels.goldGlobal,
            data.map((item) => item.gold_global ?? null),
            SERIES_COLOR.goldGlobal,
        ),
    ];

    return buildMetalHistoryOption(categories, series);
};

export const createChartSilverPriceHistory = (
    data: SilverChartItem[],
    labels: Pick<MetalLegendLabels, 'silverBar' | 'silverGlobal'>,
    days: MetalChartDays,
): echarts.EChartsOption | null => {
    if (data.length === 0) return null;

    const dateStyle = resolveChartAxisDateStyle(days);
    const categories = data.map((item) => formatChartAxisDate(item.date, dateStyle));
    const series = [
        buildLineSeries(
            labels.silverBar,
            data.map((item) => item.silver_bar ?? null),
            SERIES_COLOR.silverBar,
        ),
        buildLineSeries(
            labels.silverGlobal,
            data.map((item) => item.silver_global ?? null),
            SERIES_COLOR.silverGlobal,
        ),
    ];

    return buildMetalHistoryOption(categories, series);
};
