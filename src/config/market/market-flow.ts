import type * as echarts from 'echarts';

import { BAR_CHART_AXIS_TOOLTIP } from '@/constants/market';
import type { useTranslate } from '@/hooks/useTranslate';
import type { TradingStatsPeriod } from '@/types/datafeed/trading-data';
import type {
    TradingFlowBarPoint,
    TradingFlowSession,
    TradingFlowTopNetSide,
    TradingFlowTreemapCell,
    TradingFlowTreemapColorMode,
} from '@/types/pages/market';
import { getNetColor } from '@/utils/common';
import { formatDate, formatNumberVN, formatNumberVNWithUnit } from '@/utils/format';
import { toTradingFlowBillions } from '@/utils/market/market-flow';
import {
    buildCategoryTickIndices,
    formatChartAxisDate,
    getBarChartAxisTooltipPoint,
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

const buildCumulativeTradingFlowValues = (sessions: TradingFlowSession[]): number[] => {
    const cumulative: number[] = [];
    let sum = 0;
    for (const session of sessions) {
        sum += toTradingFlowBillions(session.net_value);
        cumulative.push(sum);
    }
    return cumulative;
};

const getTradingFlowHistoryYAxisScale = (
    values: number[],
    tickCount = 5,
): { min: number; max: number; interval: number } => {
    const intervals = tickCount - 1;
    const halfSpan = Math.floor(intervals / 2);
    const dataMin = values.length ? Math.min(...values) : 0;
    const dataMax = values.length ? Math.max(...values) : 0;
    const extent = Math.max(Math.abs(dataMin), Math.abs(dataMax));

    const step = extent === 0 ? 1 : getNiceAxisStep(extent / halfSpan);

    return {
        min: -halfSpan * step,
        max: halfSpan * step,
        interval: step,
    };
};

const getTradingFlowCumulativeYAxisScale = (
    values: number[],
    tickCount = 5,
): { min: number; max: number; interval: number } => {
    const intervals = tickCount - 1;

    if (!values.length) {
        return { min: 0, max: intervals, interval: 1 };
    }

    const dataMin = Math.min(...values, 0);
    const dataMax = Math.max(...values);
    const extent = Math.max(dataMax - dataMin, 1);

    let step = getNiceAxisStep(extent / intervals);
    let min = dataMin < 0 ? Math.floor(dataMin / step) * step : 0;
    let max = min + step * intervals;

    while (max < dataMax) {
        step = getNiceAxisStep(step * 1.25);
        min = dataMin < 0 ? Math.floor(dataMin / step) * step : 0;
        max = min + step * intervals;
    }

    return { min, max, interval: step };
};

const getTradingFlowHistoryBarLayout = (
    itemCount: number,
): {
    barWidth: number | string;
    barMaxWidth: number;
    barCategoryGap: number | string;
} => {
    if (itemCount <= 12) {
        return { barWidth: 18, barMaxWidth: 20, barCategoryGap: '32%' };
    }
    if (itemCount <= 24) {
        return { barWidth: '52%', barMaxWidth: 16, barCategoryGap: '36%' };
    }
    if (itemCount <= 52) {
        return { barWidth: '48%', barMaxWidth: 10, barCategoryGap: '42%' };
    }
    return { barWidth: '42%', barMaxWidth: 6, barCategoryGap: '48%' };
};

const mapTradingFlowSessionsToSeriesData = (
    sessions: TradingFlowSession[],
): TradingFlowBarPoint[] =>
    sessions.map((session) => {
        const value = toTradingFlowBillions(session.net_value);
        const borderRadius: [number, number, number, number] =
            value > 0 ? [4, 4, 0, 0] : value < 0 ? [0, 0, 4, 4] : [0, 0, 0, 0];
        return {
            value,
            itemStyle: {
                color: value > 0 ? '#3ac45c' : value < 0 ? '#eb4337' : '#e98e00',
                borderRadius,
            },
        };
    });

export const createChartTradingFlow = (
    sessions: TradingFlowSession[],
    trans: ReturnType<typeof useTranslate>,
): echarts.EChartsOption => {
    const categories = sessions.map((s) => formatDate(s.date, 'DD/MM'));

    return {
        animation: false,
        grid: { top: 8, right: 70, bottom: 8, left: 8, containLabel: false },
        xAxis: {
            type: 'category',
            data: categories,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { show: false },
        },
        yAxis: {
            type: 'value',
            position: 'right',
            splitNumber: 3,
            offset: 40,
            splitLine: { show: false },
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
                align: 'right',
                color: '#999999',
                fontSize: 10,
                formatter: (value: number) => {
                    if (value === 0) return '0';
                    return formatNumberVN(value, { decimals: 0 });
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
                const absVal = formatNumberVN(Math.abs(value), { decimals: 2 });
                const valueClass = value === 0 ? 'text-orange' : getNetColor(value);
                const label = point?.name ?? point?.axisValue ?? '';
                return `
                    <div class="flex flex-col gap-1 rounded-xl bg-tertiary p-2">
                        <span class="font-caption text-secondary">${label}</span>
                        <p class="font-caption text-secondary">${trans.market.flow.chart_net}</p>
                        <p class="font-caption-highlight ${valueClass}">${absVal} tỷ</p>
                    </div>
                `;
            },
        },
        series: [
            {
                type: 'bar',
                id: 'trading-flow-10-sessions',
                name: trans.market.flow.chart_net,
                barWidth: '55%',
                barMinHeight: 2,
                data: mapTradingFlowSessionsToSeriesData(sessions),
                markLine: {
                    silent: true,
                    symbol: 'none',
                    animation: false,
                    label: { show: false },
                    lineStyle: { color: '#999999', type: 'dashed', width: 1 },
                    data: [{ yAxis: 0 }],
                },
            },
        ],
    };
};

export const createChartTradingFlowHistory = (
    sessions: TradingFlowSession[],
    trans: ReturnType<typeof useTranslate>,
    period: TradingStatsPeriod,
): echarts.EChartsOption => {
    const dateStyle = resolveChartAxisDateStyle(period);
    const categories = sessions.map((s) => formatChartAxisDate(s.date, dateStyle));
    const xTickIndices = new Set(buildCategoryTickIndices(sessions.length));
    const barData = mapTradingFlowSessionsToSeriesData(sessions);
    const cumulativeData = buildCumulativeTradingFlowValues(sessions);
    const barValues = barData.map((item) => item.value);

    const barYAxis = getTradingFlowHistoryYAxisScale(barValues, 5);
    const cumulativeYAxis = getTradingFlowCumulativeYAxisScale(cumulativeData, 5);
    const barLayout = getTradingFlowHistoryBarLayout(sessions.length);

    const formatYAxisLabel = (value: number) => {
        if (value === 0) return '0';
        return formatNumberVN(value, { decimals: 0 });
    };

    const legendNet = trans.market.flow.modal.legend_net;
    const legendCumulative = trans.market.flow.modal.legend_cumulative;

    return {
        animation: false,
        grid: { top: 8, right: 40, bottom: 20, left: 40, containLabel: false },
        xAxis: {
            type: 'category',
            data: categories,
            boundaryGap: true,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
                color: '#666666',
                fontSize: 10,
                margin: 24,
                interval: 0,
                showMinLabel: true,
                showMaxLabel: true,
                formatter: (value: string, index: number) => (xTickIndices.has(index) ? value : ''),
            },
        },
        yAxis: [
            {
                type: 'value',
                position: 'left',
                min: barYAxis.min,
                max: barYAxis.max,
                interval: barYAxis.interval,
                splitNumber: 4,
                minInterval: barYAxis.interval,
                maxInterval: barYAxis.interval,
                splitLine: { show: false },
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: {
                    color: '#666666',
                    fontSize: 10,
                    formatter: formatYAxisLabel,
                },
            },
            {
                type: 'value',
                position: 'right',
                min: cumulativeYAxis.min,
                max: cumulativeYAxis.max,
                interval: cumulativeYAxis.interval,
                splitNumber: 4,
                minInterval: cumulativeYAxis.interval,
                maxInterval: cumulativeYAxis.interval,
                splitLine: { show: false },
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: {
                    color: '#666666',
                    fontSize: 10,
                    formatter: formatYAxisLabel,
                },
            },
        ],
        tooltip: {
            trigger: 'axis',
            renderMode: 'html',
            backgroundColor: 'transparent',
            borderWidth: 0,
            padding: 0,
            formatter: (params: any) => {
                const list = Array.isArray(params) ? params : [params];
                const dataIndex = Number(list[0]?.dataIndex ?? 0);
                const session = sessions[dataIndex];
                const dateLabel = session
                    ? formatDate(session.date, 'DD/MM/YYYY')
                    : (list[0]?.axisValue ?? '');
                const rows = list
                    .map((point: any) => {
                        const value = Number(point?.value ?? 0);
                        const absVal = formatNumberVN(Math.abs(value), { decimals: 2 });
                        const colorClass = getNetColor(value);
                        return `
                            <p class="font-caption text-secondary">${point.seriesName}: <span class="font-caption-highlight ${colorClass}">${absVal} tỷ</span></p>
                        `;
                    })
                    .join('');
                return `
                    <div class="flex flex-col gap-1 rounded-xl bg-tertiary p-2">
                        <span class="font-caption text-secondary">${dateLabel}</span>
                        ${rows}
                    </div>
                `;
            },
        },
        series: [
            {
                type: 'bar',
                name: legendNet,
                yAxisIndex: 0,
                barWidth: barLayout.barWidth,
                barMaxWidth: barLayout.barMaxWidth,
                barCategoryGap: barLayout.barCategoryGap,
                barMinHeight: 2,
                data: barData,
                markLine: {
                    silent: true,
                    symbol: 'none',
                    animation: false,
                    label: { show: false },
                    lineStyle: { color: '#999999', type: 'dashed', width: 1 },
                    data: [{ yAxis: 0 }],
                },
                z: 1,
            },
            {
                type: 'line',
                name: legendCumulative,
                yAxisIndex: 1,
                data: cumulativeData,
                smooth: false,
                symbol: 'circle',
                showSymbol: false,
                symbolSize: 6,
                lineStyle: { color: '#e98e00', width: 2 },
                itemStyle: { color: '#e98e00' },
                z: 2,
            },
        ],
    };
};

const FLOW_TREEMAP_SIDE_COLORS = {
    buy: 'rgba(58, 196, 92, 0.3)',
    sell: 'rgba(235, 67, 55, 0.3)',
} as const;

const FLOW_TREEMAP_CELL_COLORS = {
    ceiling: 'rgba(179, 84, 227, 0.3)',
    floor: 'rgba(41, 148, 255, 0.3)',
    up: 'rgba(58, 196, 92, 0.3)',
    down: 'rgba(235, 67, 55, 0.3)',
    reference: 'rgba(233, 142, 0, 0.3)',
} as const;

const getFlowTreemapCellColor = (
    item: TradingFlowTreemapCell,
    colorMode: TradingFlowTreemapColorMode,
): string => {
    const { price = 0, ceiling = 0, floor = 0, changePercent } = item;

    if (colorMode === 'price-limit') {
        if (price > 0 && ceiling > 0 && price >= ceiling) return FLOW_TREEMAP_CELL_COLORS.ceiling;
        if (price > 0 && floor > 0 && price <= floor) return FLOW_TREEMAP_CELL_COLORS.floor;
    }
    if (changePercent == null || changePercent === 0) return FLOW_TREEMAP_CELL_COLORS.reference;
    if (changePercent > 0) return FLOW_TREEMAP_CELL_COLORS.up;
    return FLOW_TREEMAP_CELL_COLORS.down;
};

const formatFlowTreemapChangePercent = (changePercent: number | null | undefined): string => {
    const value = changePercent ?? 0;
    const sign = value > 0 ? '+' : '';
    return `${sign}${formatNumberVN(value, { decimals: 2 })}%`;
};

const formatFlowTreemapCellLabel = (data: TradingFlowTreemapCell): string => {
    if (!data?.name) return '';
    if ((data.percent ?? 0) < 3) {
        return data.name;
    }
    return `${data.name}\n${formatFlowTreemapChangePercent(data.changePercent)}`;
};

const formatFlowTreemapTooltip = (
    params: { data?: TradingFlowTreemapCell & { key?: string } },
    side: TradingFlowTopNetSide,
    trans: ReturnType<typeof useTranslate>,
): string => {
    const data = params?.data;
    if (!data?.name) return '';

    const netTextClass = getNetColor(data.netValue ?? 0);
    const companyLine = data.companyName
        ? `<span class="font-caption text-secondary">${data.companyName}</span>`
        : '';
    const netLabel =
        side === 'buy' ? trans.market.flow.tooltip_net_buy : trans.market.flow.tooltip_net_sell;

    return `<div class="flex min-w-32 flex-col gap-1 rounded-lg bg-tertiary p-2">
        <span class="font-caption-highlight text-primary">${data.name}</span>
        ${companyLine}
        <span class="font-caption ${netTextClass}">${netLabel}: ${formatNumberVNWithUnit(
            Math.abs(data.netValue ?? 0),
        )}</span>
    </div>`;
};

export const createMarketFlowTreemapOptions = (
    items: TradingFlowTreemapCell[],
    side: TradingFlowTopNetSide,
    trans: ReturnType<typeof useTranslate>,
    options?: { clickable?: boolean; colorMode?: TradingFlowTreemapColorMode },
): echarts.EChartsOption => {
    const sideColor = FLOW_TREEMAP_SIDE_COLORS[side];
    const clickable = !!options?.clickable;
    const colorMode = options?.colorMode ?? 'price-limit';

    return {
        animation: false,
        tooltip: {
            trigger: 'item',
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            borderWidth: 0,
            borderRadius: 8,
            padding: 0,
            show: true,
            renderMode: 'html',
            appendToBody: true,
            showDelay: 0,
            hideDelay: 0,
            transitionDuration: 0,
            confine: false,
            position: (point, _params, _dom, _rect, size) => {
                const [tooltipWidth, tooltipHeight] = size.contentSize;
                const [, viewHeight] = size.viewSize;
                const x = side === 'sell' ? point[0] - tooltipWidth - 10 : point[0] + 10;
                const y =
                    point[1] + 10 + tooltipHeight > viewHeight
                        ? point[1] - tooltipHeight - 10
                        : point[1] + 10;
                return [x, y];
            },
            formatter: (params) =>
                formatFlowTreemapTooltip(
                    params as { data?: TradingFlowTreemapCell & { key?: string } },
                    side,
                    trans,
                ),
        },
        series: [
            {
                type: 'treemap',
                width: '100%',
                height: '100%',
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                roam: false,
                nodeClick: false,
                breadcrumb: { show: false },
                squareRatio: 1,
                silent: false,
                cursor: clickable ? 'pointer' : 'default',
                color: [sideColor],
                colorMappingBy: 'index',
                colorAlpha: 'none',
                colorSaturation: 'none',
                label: {
                    show: true,
                    position: 'inside',
                    color: '#f8f8f8',
                    fontSize: 12,
                    lineHeight: 16,
                    fontWeight: 600,
                    overflow: 'truncate',
                    formatter: (params) => {
                        const data = params.data as
                            | (TradingFlowTreemapCell & { key?: string })
                            | undefined;
                        return formatFlowTreemapCellLabel(data ?? ({} as TradingFlowTreemapCell));
                    },
                },
                itemStyle: {
                    color: sideColor,
                    borderColor: '#171719',
                    borderWidth: 0.5,
                    gapWidth: 0.5,
                    borderRadius: 0,
                },
                levels: [
                    {
                        itemStyle: {
                            color: sideColor,
                            borderColor: '#171719',
                            borderWidth: 0,
                            gapWidth: 0.5,
                        },
                        color: [sideColor],
                        colorMappingBy: 'index',
                        colorAlpha: 'none',
                        colorSaturation: 'none',
                    },
                    {
                        itemStyle: {
                            color: sideColor,
                            borderColor: '#171719',
                            borderWidth: 0.5,
                            gapWidth: 0.5,
                        },
                        color: [sideColor],
                        colorMappingBy: 'index',
                        colorAlpha: 'none',
                        colorSaturation: 'none',
                    },
                ],
                emphasis: {
                    disabled: true,
                },
                data: items.map((item) => ({
                    key: item.key,
                    name: item.name,
                    value: item.value,
                    percent: item.percent,
                    netValue: item.netValue,
                    netValueBillion: item.netValueBillion,
                    companyName: item.companyName,
                    changePercent: item.changePercent,
                    price: item.price,
                    ceiling: item.ceiling,
                    floor: item.floor,
                    itemStyle: { color: getFlowTreemapCellColor(item, colorMode) },
                })),
            },
        ],
    };
};
