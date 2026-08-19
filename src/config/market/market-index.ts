import type { MutableRefObject } from 'react';

import * as echarts from 'echarts';

import { BAR_CHART_AXIS_TOOLTIP, MARKET_BREADTH_SERIES } from '@/constants/market';
import type { useTranslate } from '@/hooks/useTranslate';
import type { MarketLeaderboardItem } from '@/types/datafeed/trading-data';
import type {
    InfluenceBubbleDirection,
    InfluenceBubblePoint,
    InvestmentPerformanceBarItem,
    MarketBreadthChartData,
    MarketBreadthSeriesKey,
    MarketIndexMiniData,
} from '@/types/pages/market';
import { formatNumberVN, formatStockTimeRange } from '@/utils/format';
import { getBarChartAxisTooltipPoint } from '@/utils/market/market-shared';

const INVESTMENT_PERFORMANCE_HIGHLIGHTED_CHANNEL = 'VNINDEX';
const INVESTMENT_PERFORMANCE_CHANNEL_LABEL_MAX_LENGTH = 20;

const filterIntradayPoints = (
    times: number[],
    values: number[],
    minX: number,
    maxX: number,
): [number, number][] => {
    const linePoints: [number, number][] = [];
    for (let i = 0; i < times.length; i++) {
        if (times[i] >= minX && times[i] <= maxX) {
            linePoints.push([times[i], values[i]]);
        }
    }
    return linePoints;
};

const buildInfluenceBubblePoints = (
    stocks: MarketLeaderboardItem[],
    direction: InfluenceBubbleDirection,
    plotWidth: number,
    plotHeight: number,
): InfluenceBubblePoint[] => {
    if (stocks.length === 0) return [];

    const weights = stocks.map((_, index) =>
        stocks.length === 1 ? 1 : 1 - (index / (stocks.length - 1)) * 0.2,
    );
    const weightSum = weights.reduce((sum, weight) => sum + weight, 0);

    let sizes = weights.map(
        (weight) => (weight * (plotWidth - (stocks.length - 1) * 8)) / weightSum,
    );

    const heightLimit = Math.max(plotHeight - 8, 1);
    const largestSize = Math.max(...sizes);
    if (largestSize > heightLimit) {
        sizes = sizes.map((size) => (size * heightLimit) / largestSize);
    }

    let totalWidth = sizes.reduce((sum, size) => sum + size, 0) + (stocks.length - 1) * 8;
    if (totalWidth > plotWidth) {
        const shrink = plotWidth / totalWidth;
        sizes = sizes.map((size) => size * shrink);
        totalWidth = plotWidth;
    }

    const xCenters: number[] = [];
    let centerX = (plotWidth - totalWidth) / 2 + sizes[0] / 2;
    xCenters.push(centerX);

    for (let index = 1; index < stocks.length; index++) {
        centerX += sizes[index - 1] / 2 + 6 + sizes[index] / 2;
        xCenters.push(centerX);
    }

    return stocks.map((stock, index) => {
        const isFirst = index === 0;
        const borderColor = isFirst
            ? direction === 'increase'
                ? '#3ac45c'
                : '#eb4337'
            : '#313235';

        return {
            value: [xCenters[index], 0],
            symbolSize: sizes[index],
            itemStyle: {
                color: '#171719',
                borderColor,
                borderWidth: isFirst ? 2 : 1,
            },
            code: stock.symbol,
            changeLabel: `${formatNumberVN(stock.influenceScore ?? 0)}`,
        };
    });
};

type MarketBreadthStackPoints = Record<MarketBreadthSeriesKey, [number, number][]>;

const buildMarketBreadthStackPoints = (
    data: MarketBreadthChartData,
    minX: number,
    maxX: number,
): MarketBreadthStackPoints => {
    const result: MarketBreadthStackPoints = {
        floors: [],
        declines: [],
        nochanges: [],
        advances: [],
        ceilings: [],
    };

    const { times, floors, declines, nochanges, advances, ceilings } = data;

    const length = Math.min(
        times.length,
        floors.length,
        declines.length,
        nochanges.length,
        advances.length,
        ceilings.length,
    );

    for (let i = 0; i < length; i++) {
        const time = times[i];
        if (time < minX || time > maxX) continue;

        const floorVal = floors[i] ?? 0;
        const declineVal = declines[i] ?? 0;
        const nochangeVal = nochanges[i] ?? 0;
        const advanceVal = advances[i] ?? 0;
        const ceilingVal = ceilings[i] ?? 0;
        const total = floorVal + declineVal + nochangeVal + advanceVal + ceilingVal;

        if (total <= 0) {
            result.floors.push([time, 0]);
            result.declines.push([time, 0]);
            result.nochanges.push([time, 0]);
            result.advances.push([time, 0]);
            result.ceilings.push([time, 0]);
            continue;
        }

        result.floors.push([time, (floorVal / total) * 100]);
        result.declines.push([time, (declineVal / total) * 100]);
        result.nochanges.push([time, (nochangeVal / total) * 100]);
        result.advances.push([time, (advanceVal / total) * 100]);
        result.ceilings.push([time, (ceilingVal / total) * 100]);
    }

    return result;
};

const getInvestmentPerformanceAxisMax = (items: InvestmentPerformanceBarItem[]): number => {
    if (items.length === 0) return 50;
    const maxAbs = Math.max(...items.map((item) => Math.abs(item.returnPercent)), 0);
    return Math.max(50, Math.ceil(maxAbs / 10) * 10);
};

const mapInvestmentPerformanceToBarData = (items: InvestmentPerformanceBarItem[]) =>
    items.map((item) => {
        const value = item.returnPercent;
        const borderRadius: [number, number, number, number] = [4, 4, 4, 4];

        let color = '#3ac45c';
        if (value < 0) color = '#eb4337';
        else if (value === 0) color = '#e98e00';

        return {
            value,
            itemStyle: { color, borderRadius },
        };
    });

const truncateInvestmentPerformanceChannelLabel = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length <= INVESTMENT_PERFORMANCE_CHANNEL_LABEL_MAX_LENGTH) {
        return trimmed;
    }
    return `${trimmed.slice(0, INVESTMENT_PERFORMANCE_CHANNEL_LABEL_MAX_LENGTH)}...`;
};

const createInfluenceBubbleChartOptions = (
    stocks: MarketLeaderboardItem[],
    direction: InfluenceBubbleDirection,
    plotWidth: number,
    plotHeight: number,
): echarts.EChartsOption => {
    const changeColor = direction === 'increase' ? '#3ac45c' : '#eb4337';

    return {
        animation: false,
        grid: { top: 4, right: 0, bottom: 4, left: 4, containLabel: false },
        xAxis: { type: 'value', show: false, min: 0, max: plotWidth },
        yAxis: { type: 'value', show: false, min: -0.5, max: 0.5 },
        tooltip: { show: false },
        series: [
            {
                type: 'scatter',
                silent: false,
                cursor: 'pointer',
                emphasis: { disabled: true },
                symbol: 'circle',
                data: buildInfluenceBubblePoints(stocks, direction, plotWidth, plotHeight),
                label: {
                    show: true,
                    position: 'inside',
                    formatter: (params: any) => {
                        const code = params.data.code ?? '';
                        const symTag = code.length > 3 ? 'symSm' : 'sym';
                        return `{${symTag}|${code}}\n{chg|${params.data.changeLabel}}`;
                    },
                    rich: {
                        sym: { fontSize: 10, fontWeight: 500, color: '#f8f8f8', lineHeight: 10 },
                        symSm: { fontSize: 8, fontWeight: 500, color: '#f8f8f8', lineHeight: 8 },
                        chg: {
                            fontSize: 10,
                            fontWeight: 400,
                            color: changeColor,
                            lineHeight: 10,
                            padding: [4, 0, 0, 0],
                        },
                    },
                },
            },
        ],
    };
};

export const renderInfluenceBubbleChart = (
    container: HTMLDivElement,
    chartRef: MutableRefObject<echarts.ECharts | null>,
    stocks: MarketLeaderboardItem[],
    direction: InfluenceBubbleDirection,
    onSelectSymbol?: (symbol: string) => void,
) => {
    const plotWidth = container.clientWidth;
    const plotHeight = container.clientHeight;
    if (plotWidth <= 0 || plotHeight <= 0) return;

    const options = createInfluenceBubbleChartOptions(stocks, direction, plotWidth, plotHeight);
    if (!chartRef.current) {
        chartRef.current = echarts.init(container, 'vnsc-default');
    }
    chartRef.current.setOption(options, true);

    chartRef.current.off('click');
    chartRef.current.on('click', (params) => {
        const code = (params?.data as InfluenceBubblePoint | undefined)?.code;
        if (code) onSelectSymbol?.(code);
    });

    requestAnimationFrame(() => {
        chartRef.current?.resize();
    });
};

export const createChartMarketIndexMini = (
    indexData: MarketIndexMiniData | null | undefined,
): echarts.EChartsOption | null => {
    if (!indexData) return null;

    const { values, times, reference } = indexData;
    const refNum = Number(reference) || 0;

    let rangeTime = formatStockTimeRange();
    let minX = rangeTime[0];
    let maxX = rangeTime[rangeTime.length - 1];
    let linePoints = filterIntradayPoints(times, values, minX, maxX);

    if (linePoints.length === 0 && times.length > 0) {
        rangeTime = formatStockTimeRange(times[0]);
        minX = rangeTime[0];
        maxX = rangeTime[rangeTime.length - 1];
        linePoints = filterIntradayPoints(times, values, minX, maxX);
    }

    const lineReference: [number, number][] = rangeTime.map((t) => [t, refNum]);
    const ys = linePoints.map((p) => p[1]).filter((v) => Number.isFinite(v));
    const dataSpan = ys.length ? Math.max(...ys, refNum) - Math.min(...ys, refNum) : 1;
    const eps = Math.max(dataSpan, 1) * 0.0015;

    return {
        animation: false,
        useUTC: true,
        grid: { top: 0, right: 0, bottom: 0, left: 0 },
        visualMap: {
            show: false,
            type: 'continuous',
            seriesIndex: 1,
            dimension: 1,
            min: refNum - eps,
            max: refNum + eps,
            inRange: { color: ['#ea1b2a', '#00ba3c'] },
            outOfRange: { color: ['#ea1b2a', '#00ba3c'] },
        },
        xAxis: {
            type: 'time',
            min: minX,
            max: maxX,
            interval: 3600 * 1000,
            axisLabel: {
                fontSize: 10,
                color: '#666666',
                formatter: '{HH}h',
                margin: 14,
                showMinLabel: true,
            },
            axisLine: { lineStyle: { color: '#999999', width: 1 } },
            axisTick: { show: true, length: 10, lineStyle: { color: '#999999' } },
            splitLine: { show: false },
        },
        yAxis: {
            type: 'value',
            show: false,
            scale: true,
            splitLine: { show: false },
        },
        tooltip: {
            trigger: 'axis',
            renderMode: 'html',
            backgroundColor: 'transparent',
            borderWidth: 0,
            padding: 0,
            formatter: (params: any) => {
                const list = Array.isArray(params) ? params : [params];
                const area = list.find((p: any) => p.seriesIndex === 1) ?? list[list.length - 1];
                const value = Number(area?.value?.[1] ?? 0);
                return `
                    <div class="rounded-xl bg-tertiary p-2">
                        <span class="font-caption-highlight text-primary">${formatNumberVN(value)}</span>
                    </div>
                `;
            },
        },
        series: [
            {
                type: 'line',
                data: lineReference,
                silent: true,
                symbol: 'none',
                showSymbol: false,
                lineStyle: { color: '#999999', width: 1.5, type: 'dashed' },
                z: 1,
            },
            {
                type: 'line',
                data: linePoints,
                symbol: 'circle',
                showSymbol: false,
                symbolSize: 6,
                lineStyle: { width: 1 },
                areaStyle: { opacity: 0.15, origin: refNum },
                z: 2,
            },
        ],
    };
};

export const createChartMarketIndexCompareSparkline = (
    indexData: MarketIndexMiniData | null | undefined,
): echarts.EChartsOption | null => {
    if (!indexData) return null;

    const { values, times, reference } = indexData;
    const refNum = Number(reference) || 0;

    let rangeTime = formatStockTimeRange();
    let minX = rangeTime[0];
    let maxX = rangeTime[rangeTime.length - 1];
    let linePoints = filterIntradayPoints(times, values, minX, maxX);

    if (linePoints.length === 0 && times.length > 0) {
        rangeTime = formatStockTimeRange(times[0]);
        minX = rangeTime[0];
        maxX = rangeTime[rangeTime.length - 1];
        linePoints = filterIntradayPoints(times, values, minX, maxX);
    }

    if (linePoints.length === 0) return null;

    const lineReference: [number, number][] = rangeTime.map((t) => [t, refNum]);
    const ys = linePoints.map((p) => p[1]).filter((v) => Number.isFinite(v));
    const dataSpan = ys.length ? Math.max(...ys, refNum) - Math.min(...ys, refNum) : 1;
    const eps = Math.max(dataSpan, 1) * 0.0015;

    return {
        animation: false,
        useUTC: true,
        grid: { top: 0, right: 0, bottom: 0, left: 0 },
        visualMap: {
            show: false,
            type: 'continuous',
            seriesIndex: 1,
            dimension: 1,
            min: refNum - eps,
            max: refNum + eps,
            inRange: { color: ['#eb4337', '#3ac45c'] },
            outOfRange: { color: ['#eb4337', '#3ac45c'] },
        },
        xAxis: {
            type: 'time',
            min: minX,
            max: maxX,
            show: false,
        },
        yAxis: {
            type: 'value',
            show: false,
            scale: true,
            splitLine: { show: false },
        },
        tooltip: {
            trigger: 'axis',
            renderMode: 'html',
            backgroundColor: 'transparent',
            borderWidth: 0,
            padding: 0,
            formatter: (params: any) => {
                const list = Array.isArray(params) ? params : [params];
                const area = list.find((p: any) => p.seriesIndex === 1) ?? list[list.length - 1];
                const value = Number(area?.value?.[1] ?? 0);
                const time = Number(area?.value?.[0] ?? 0);
                const date = new Date(time);
                const hours = String(date.getUTCHours()).padStart(2, '0');
                const minutes = String(date.getUTCMinutes()).padStart(2, '0');
                return `
                    <div class="flex flex-col gap-1 rounded-xl bg-tertiary p-2">
                        <span class="font-caption text-secondary">${hours}:${minutes}</span>
                        <span class="font-caption-highlight text-primary">${formatNumberVN(value, { decimals: 2 })}</span>
                    </div>
                `;
            },
        },
        series: [
            {
                type: 'line',
                data: lineReference,
                silent: true,
                symbol: 'none',
                showSymbol: false,
                lineStyle: { color: '#999999', width: 1, type: 'dashed' },
                z: 1,
            },
            {
                type: 'line',
                data: linePoints,
                symbol: 'circle',
                showSymbol: false,
                symbolSize: 6,
                lineStyle: { width: 1.5 },
                areaStyle: { opacity: 0.2, origin: refNum },
                z: 2,
            },
        ],
    };
};

export const createChartMarketBreadth = (
    data: MarketBreadthChartData | null | undefined,
    trans: ReturnType<typeof useTranslate>,
): echarts.EChartsOption | null => {
    if (!data?.times?.length) return null;

    let rangeTime = formatStockTimeRange();
    let minX = rangeTime[0];
    let maxX = rangeTime[rangeTime.length - 1];

    if (data.times.length > 0) {
        rangeTime = formatStockTimeRange(data.times[0]);
        minX = rangeTime[0];
        maxX = rangeTime[rangeTime.length - 1];
    }

    const stackPoints = buildMarketBreadthStackPoints(data, minX, maxX);
    if (stackPoints.floors.length === 0) return null;

    return {
        animation: false,
        useUTC: true,
        grid: { top: 5, right: 32, bottom: 28, left: 0, containLabel: false },
        xAxis: {
            type: 'time',
            min: minX,
            max: maxX,
            interval: 3600 * 1000 * 3,
            axisLabel: {
                fontSize: 10,
                color: '#666666',
                formatter: (value: number) => {
                    const date = new Date(value);
                    const hours = String(date.getUTCHours()).padStart(2, '0');
                    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
                    return `${hours}:${minutes}`;
                },
                margin: 14,
                showMinLabel: true,
                showMaxLabel: true,
            },
            axisLine: { lineStyle: { color: '#999999', width: 1 } },
            axisTick: { show: false },
            splitLine: { show: false },
        },
        yAxis: {
            type: 'value',
            position: 'right',
            min: 0,
            max: 100,
            interval: 20,
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: {
                color: '#666666',
                fontSize: 10,
                align: 'right',
                margin: 32,
                formatter: (value: number) => `${value}%`,
            },
        },
        tooltip: {
            trigger: 'axis',
            renderMode: 'html',
            backgroundColor: 'transparent',
            borderWidth: 0,
            padding: 0,
            formatter: (params: any) => {
                const list = Array.isArray(params) ? params : [params];
                const rows = [...list]
                    .sort((a: any, b: any) => b.seriesIndex - a.seriesIndex)
                    .map((p: any) => {
                        const seriesConfig = MARKET_BREADTH_SERIES[p.seriesIndex];
                        if (!seriesConfig) return '';
                        const label = trans.market.index.breadth_series[seriesConfig.key];
                        const val = Number(p?.value?.[1] ?? 0);
                        return `<span class="font-caption" style="color:${seriesConfig.color}">${label}: ${formatNumberVN(val, { decimals: 1 })}%</span>`;
                    })
                    .filter(Boolean)
                    .join('');
                return `<div class="flex flex-col gap-1 rounded-xl bg-tertiary p-2">${rows}</div>`;
            },
        },
        series: MARKET_BREADTH_SERIES.map((series) => ({
            name: trans.market.index.breadth_series[series.key],
            type: 'line' as const,
            stack: 'breadth',
            smooth: true,
            symbol: 'none',
            showSymbol: false,
            lineStyle: { width: 0 },
            areaStyle: { color: series.color, opacity: 1 },
            emphasis: { disabled: true },
            data: stackPoints[series.key],
            z: 1,
        })),
    };
};

export const createChartInvestmentPerformance = (
    items: InvestmentPerformanceBarItem[],
): echarts.EChartsOption | null => {
    if (items.length === 0) return null;

    const sortedItems = [...items].sort((a, b) => b.returnPercent - a.returnPercent);
    const categories = sortedItems.map((item) => item.channelName);
    const highlightedNames = new Set(
        sortedItems
            .filter(
                (item) =>
                    item.channel.trim().toUpperCase() ===
                    INVESTMENT_PERFORMANCE_HIGHLIGHTED_CHANNEL,
            )
            .map((item) => item.channelName),
    );
    const returnPercentByName = new Map(
        sortedItems.map((item) => [item.channelName, item.returnPercent]),
    );
    const axisMax = getInvestmentPerformanceAxisMax(sortedItems);
    const hasNegative = sortedItems.some((item) => item.returnPercent < 0);
    const barData = mapInvestmentPerformanceToBarData(sortedItems);

    return {
        animation: false,
        grid: { top: 0, right: 0, bottom: 0, left: 90, containLabel: false },
        xAxis: {
            type: 'value',
            min: hasNegative ? -axisMax : 0,
            max: axisMax,
            show: false,
            splitLine: { show: false },
        },
        yAxis: {
            type: 'category',
            data: categories,
            inverse: true,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
                width: 100,
                align: 'left',
                margin: 100,
                formatter: (value: string) => {
                    const nameTag = highlightedNames.has(value) ? 'highlight' : 'normal';
                    const nameDisplay = truncateInvestmentPerformanceChannelLabel(value);
                    const percent = returnPercentByName.get(value) ?? 0;
                    const valueTag =
                        percent > 0 ? 'valueGreen' : percent < 0 ? 'valueRed' : 'valueOrange';
                    const percentText = `${formatNumberVN(percent, { decimals: 2 })}%`;
                    return `{${nameTag}|${nameDisplay}}\n{${valueTag}|${percentText}}`;
                },
                rich: {
                    highlight: {
                        color: '#f8f8f8',
                        fontWeight: 600,
                        fontSize: 12,
                        lineHeight: 16,
                    },
                    normal: {
                        color: '#999999',
                        fontWeight: 400,
                        fontSize: 14,
                        lineHeight: 16,
                    },
                    valueGreen: {
                        color: '#3ac45c',
                        fontWeight: 600,
                        fontSize: 12,
                        lineHeight: 16,
                        padding: [4, 0, 0, 0],
                    },
                    valueRed: {
                        color: '#eb4337',
                        fontWeight: 600,
                        fontSize: 12,
                        lineHeight: 16,
                        padding: [4, 0, 0, 0],
                    },
                    valueOrange: {
                        color: '#e98e00',
                        fontWeight: 600,
                        fontSize: 12,
                        lineHeight: 16,
                        padding: [4, 0, 0, 0],
                    },
                },
            },
        },
        tooltip: {
            ...BAR_CHART_AXIS_TOOLTIP,
            renderMode: 'html',
            backgroundColor: 'transparent',
            borderWidth: 0,
            padding: 0,
            formatter: (params: any) => {
                const point = getBarChartAxisTooltipPoint(params);
                const value = Number(point?.value ?? 0);
                const colorClass =
                    value > 0 ? 'text-green' : value < 0 ? 'text-red' : 'text-orange';
                const label = point?.name ?? point?.axisValue ?? '';
                return `
                    <div class="flex flex-col gap-1 rounded-xl bg-tertiary p-2">
                        <span class="font-caption text-secondary">${label}</span>
                        <span class="font-caption-highlight ${colorClass}">${formatNumberVN(value, { decimals: 2 })}%</span>
                    </div>
                `;
            },
        },
        series: [
            {
                type: 'bar',
                data: barData,
                barCategoryGap: '70%',
                cursor: 'pointer',
                emphasis: { disabled: true },
            },
        ],
    };
};

export const createChartInvestmentPerformanceModal = (
    items: InvestmentPerformanceBarItem[],
): echarts.EChartsOption | null => {
    if (items.length === 0) return null;

    const sortedItems = [...items].sort((a, b) => b.returnPercent - a.returnPercent);
    const categories = sortedItems.map((item) => item.channel);
    const axisMax = getInvestmentPerformanceAxisMax(sortedItems);
    const hasNegative = sortedItems.some((item) => item.returnPercent < 0);

    const barData = sortedItems.map((item) => {
        const value = item.returnPercent;
        const isHighlighted =
            item.channel.trim().toUpperCase() === INVESTMENT_PERFORMANCE_HIGHLIGHTED_CHANNEL;
        const isPositive = value >= 0;
        const borderRadius: [number, number, number, number] = isPositive
            ? [8, 8, 0, 0]
            : [0, 0, 8, 8];

        let color = 'rgba(58, 196, 92, 0.6)';
        if (value < 0) color = 'rgba(235, 67, 55, 0.6)';
        else if (value === 0) color = 'rgba(233, 142, 0, 0.6)';
        else if (isHighlighted) color = '#3ac45c';

        const nameKey = isHighlighted ? 'nameHighlight' : 'name';
        const valueKey = value > 0 ? 'valueGreen' : value < 0 ? 'valueRed' : 'valueOrange';
        const percentText = `${formatNumberVN(value, { decimals: 1 })}%`;

        return {
            value,
            itemStyle: {
                color,
                borderRadius,
                ...(isHighlighted && value > 0 ? { borderColor: '#49d82f', borderWidth: 1 } : {}),
            },
            label: {
                show: true,
                position: isPositive ? ('top' as const) : ('bottom' as const),
                distance: 4,
                formatter: `{${nameKey}|${item.channelName}}\n{${valueKey}|${percentText}}`,
                rich: {
                    name: {
                        color: '#999999',
                        fontSize: 12,
                        lineHeight: 16,
                        fontWeight: 400,
                        align: 'center' as const,
                    },
                    nameHighlight: {
                        color: '#f8f8f8',
                        fontSize: 12,
                        lineHeight: 16,
                        fontWeight: 600,
                        align: 'center' as const,
                    },
                    valueGreen: {
                        color: '#3ac45c',
                        fontSize: 12,
                        lineHeight: 16,
                        fontWeight: 600,
                        align: 'center' as const,
                    },
                    valueRed: {
                        color: '#eb4337',
                        fontSize: 12,
                        lineHeight: 16,
                        fontWeight: 600,
                        align: 'center' as const,
                    },
                    valueOrange: {
                        color: '#e98e00',
                        fontSize: 12,
                        lineHeight: 16,
                        fontWeight: 600,
                        align: 'center' as const,
                    },
                },
            },
        };
    });

    return {
        animation: false,
        grid: {
            top: 44,
            right: 0,
            bottom: hasNegative ? 44 : 8,
            left: 0,
            containLabel: false,
        },
        xAxis: {
            type: 'category',
            data: categories,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { show: false },
        },
        yAxis: {
            type: 'value',
            min: hasNegative ? -axisMax : 0,
            max: axisMax,
            show: false,
            splitLine: { show: false },
        },
        tooltip: { show: false },
        series: [
            {
                type: 'bar',
                data: barData,
                barWidth: 24,
                barCategoryGap: '20%',
                silent: true,
                emphasis: { disabled: true },
            },
        ],
    };
};
