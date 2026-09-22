import type * as echarts from 'echarts';

import type { FundNavHistoryItem } from '@/types/pages/fund';
import { formatNumberVN, formatShortDate } from '@/utils/format';

const NAV_LINE_COLOR = '#3ac45c';
const MAX_Y_TICKS = 5;
const MAX_X_TICKS = 5;

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

const buildChartCategoryTickIndices = (length: number, maxTicks: number): number[] => {
    if (length <= 0) return [];
    if (length <= maxTicks) {
        return Array.from({ length }, (_, index) => index);
    }

    const indices: number[] = [];
    for (let i = 0; i < maxTicks; i++) {
        indices.push(Math.round((i * (length - 1)) / (maxTicks - 1)));
    }

    return Array.from(new Set(indices)).sort((a, b) => a - b);
};

const buildNavYAxisScale = (values: number[]) => {
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

export const createChartFundNavHistory = (
    data: FundNavHistoryItem[],
): echarts.EChartsOption | null => {
    if (data.length === 0) return null;

    const categories = data.map((item) => formatShortDate(item.date));
    const values = data.map((item) => item.navpf ?? null);
    const numericValues = values.filter((value): value is number => value != null);
    const yScale = buildNavYAxisScale(numericValues);
    const xTickIndices = new Set(buildChartCategoryTickIndices(categories.length, MAX_X_TICKS));

    return {
        animation: false,
        grid: { top: 12, right: 8, bottom: 32, left: 8, containLabel: true },
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
            position: 'right',
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
                const point = list[0] as { axisValue?: string; value?: number | null };
                if (point.value == null) return '';
                return `
                    <div class="flex flex-col gap-1 rounded-xl base-tertiary p-2">
                        <span class="body-5 text-secondary">${point.axisValue ?? ''}</span>
                        <span class="body-5-highlight text-primary">${formatNumberVN(
                            Number(point.value),
                            { decimals: 2 },
                        )}</span>
                    </div>
                `;
            },
        },
        series: [
            {
                type: 'line',
                name: 'navpf',
                data: values,
                symbol: 'none',
                showSymbol: false,
                smooth: true,
                connectNulls: false,
                lineStyle: { color: NAV_LINE_COLOR, width: 2 },
                itemStyle: { color: NAV_LINE_COLOR },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(58, 196, 92, 0.35)' },
                            { offset: 1, color: 'rgba(58, 196, 92, 0)' },
                        ],
                    },
                },
            },
        ],
    };
};
