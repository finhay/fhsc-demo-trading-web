import type * as echarts from 'echarts';

import type {
    StockInfoMultiLineOpts,
    StockInfoMultiLineSeries,
    StockInfoSparklineData,
    StockInfoSparklineOpts,
    TradingChartPoint,
} from '@/types/pages/stock-info';
import { formatNumberVN } from '@/utils/format';
import {
    formatBusinessTrendTooltip,
    formatTradeBarTooltip,
    normalizeChartData,
    stockInfoHiddenAxis,
} from '@/utils/stock-info';

export const createStockInfoSparkline = (
    data: StockInfoSparklineData,
    color: string,
    opts: StockInfoSparklineOpts = {},
): echarts.EChartsOption => {
    const {
        smooth = true,
        gridPadding = 2,
        enableTooltip = false,
        categories,
        tooltipSuffix = '%',
    } = opts;
    const values = normalizeChartData(data);

    return {
        animation: false,
        backgroundColor: 'transparent',
        grid: {
            top: gridPadding,
            right: gridPadding,
            bottom: gridPadding,
            left: gridPadding,
            containLabel: false,
        },
        xAxis: { type: 'category', data: categories, ...stockInfoHiddenAxis, boundaryGap: false },
        yAxis: { type: 'value', ...stockInfoHiddenAxis, scale: true },
        tooltip: enableTooltip
            ? {
                  trigger: 'axis',
                  renderMode: 'html',
                  backgroundColor: '#28292b',
                  borderWidth: 0,
                  padding: 8,
                  axisPointer: { type: 'line', lineStyle: { color: '#666666', width: 1 } },
                  formatter: (params: unknown) => {
                      const p = (Array.isArray(params) ? params[0] : params) as {
                          axisValue?: string;
                          value?: number | string;
                      };
                      const label = p?.axisValue
                          ? `<span class="font-caption text-secondary">${p.axisValue}</span>`
                          : '';
                      return `<div class="flex flex-col gap-0.5">${label}<span class="font-caption-highlight text-primary">${formatNumberVN(
                          Number(p?.value ?? 0),
                      )}${tooltipSuffix}</span></div>`;
                  },
              }
            : { show: false },
        series: [
            {
                type: 'line',
                data: values,
                silent: !enableTooltip,
                symbol: 'none',
                showSymbol: false,
                smooth,
                lineStyle: { color, width: 2 },
                itemStyle: { color },
            },
        ],
    };
};

export const createStockInfoAxisLine = (categories: string[], data: number[], color: string) => ({
    animation: false,
    backgroundColor: 'transparent',
    grid: { top: 8, right: 8, bottom: 28, left: 8, containLabel: true },
    tooltip: {
        trigger: 'axis' as const,
        renderMode: 'html' as const,
        backgroundColor: '#28292b',
        borderWidth: 0,
        padding: 8,
        formatter: (params: any) => {
            const p = Array.isArray(params) ? params[0] : params;
            return `<div class="flex flex-col gap-0.5"><span class="font-caption text-secondary">${p?.axisValue ?? ''}</span><span class="font-caption-highlight text-primary">${formatNumberVN(Number(p?.value ?? 0))}%</span></div>`;
        },
    },
    xAxis: {
        type: 'category' as const,
        data: categories,
        boundaryGap: false,
        offset: 10,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
            color: '#666666',
            fontSize: 11,
            interval: Math.max(0, Math.ceil(categories.length / 5) - 1),
        },
    },
    yAxis: {
        type: 'value' as const,
        splitNumber: 4,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
            color: '#666666',
            fontSize: 11,
            formatter: (v: number) => `${formatNumberVN(v, { trimTrailingZeros: true })}%`,
        },
    },
    series: [
        {
            type: 'line' as const,
            data,
            symbol: 'none' as const,
            showSymbol: false,
            smooth: true,
            lineStyle: { color, width: 2 },
            itemStyle: { color },
        },
    ],
});

export const createStockInfoMultiLine = (
    series: StockInfoMultiLineSeries[],
    opts: StockInfoMultiLineOpts = {},
): echarts.EChartsOption => {
    const { gridPadding = 6, enableTooltip = false, categories } = opts;

    return {
        animation: false,
        backgroundColor: 'transparent',
        grid: {
            top: gridPadding,
            right: gridPadding,
            bottom: gridPadding,
            left: gridPadding,
            containLabel: false,
        },
        xAxis: {
            type: 'category',
            data: categories,
            ...stockInfoHiddenAxis,
            boundaryGap: false,
        },
        yAxis: { type: 'value', ...stockInfoHiddenAxis, scale: true },
        tooltip: enableTooltip ? { trigger: 'axis', renderMode: 'html' } : { show: false },
        series: series.map((item) => ({
            type: 'line',
            name: item.name,
            data: normalizeChartData(item.data),
            symbol: 'none',
            showSymbol: false,
            smooth: true,
            silent: !enableTooltip,
            lineStyle: { color: item.color, width: 2 },
            itemStyle: { color: item.color },
        })),
    };
};

export const createStockInfoTradeBar = (points: TradingChartPoint[]): echarts.EChartsOption => ({
    animation: false,
    backgroundColor: 'transparent',
    grid: { top: 8, right: 8, bottom: 24, left: 8, containLabel: true },
    xAxis: {
        type: 'category',
        data: points.map((item) => item.dateLabel),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
            color: '#999999',
            fontSize: 10,
        },
    },
    yAxis: {
        type: 'value',
        splitNumber: 4,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
            lineStyle: { color: '#313235' },
        },
        axisLabel: {
            color: '#999999',
            fontSize: 12,
        },
    },
    tooltip: {
        trigger: 'item',
        renderMode: 'html',
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
        formatter: formatTradeBarTooltip,
    },
    series: [
        {
            type: 'bar',
            data: points.map((item) => ({
                value: item.netValueInBillion,
                fullDateLabel: item.fullDateLabel,
                netValueInBillion: item.netValueInBillion,
                dateLabel: item.dateLabel,
                itemStyle: {
                    color: item.netValueInBillion >= 0 ? '#3ac45c' : '#eb4337',
                },
            })),
            barMaxWidth: 32,
        },
    ],
});

export const createStockInfoBusinessTrend = (
    categories: string[],
    netRevenue: number[],
    profitAfterTax: number[],
    seriesLabels: {
        netRevenue: string;
        profitAfterTax: string;
    },
): echarts.EChartsOption => ({
    animation: false,
    backgroundColor: 'transparent',
    legend: { show: false },
    grid: { top: 8, right: 8, bottom: 24, left: 8, containLabel: true },
    xAxis: {
        type: 'category',
        data: categories,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
            color: '#999999',
            fontSize: 12,
        },
        offset: 10,
    },
    yAxis: {
        type: 'value',
        position: 'right',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
            color: '#999999',
            fontSize: 12,
            align: 'right',
            formatter: (value: number) => formatNumberVN(value, { decimals: 0 }),
        },
        offset: 10,
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow',
            shadowStyle: { color: '#28292b' },
            z: 0,
        },
        renderMode: 'html',
        backgroundColor: '#28292b',
        borderWidth: 0,
        padding: 8,
        formatter: formatBusinessTrendTooltip,
    },
    series: [
        {
            type: 'bar',
            name: seriesLabels.netRevenue,
            data: netRevenue,
            itemStyle: { color: '#2994ff' },
            barGap: '14%',
            barCategoryGap: '18%',
        },
        {
            type: 'bar',
            name: seriesLabels.profitAfterTax,
            data: profitAfterTax,
            itemStyle: { color: '#e98e00' },
        },
    ],
});
