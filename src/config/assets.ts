import type * as echarts from 'echarts';

import { PORTFOLIO_TREEMAP_COLORS } from '@/constants/assets';
import { CHART_COLORS } from '@/constants/trading';
import type { PortfolioTreemapCell } from '@/types/pages/assets';
import { formatDate, formatNumberVN, formatPercentVN } from '@/utils/format';

const MIN_CHART_PIE_PERCENTAGE = 0.5;

const brightenColor = (hex: string, amount: number): string => {
    const match = /^#?([0-9a-f]{6})$/i.exec(hex);
    if (!match) return hex;

    const delta = Math.round(255 * amount);
    const channels = [0, 2, 4].map((offset) => {
        const channel = parseInt(match[1].slice(offset, offset + 2), 16);
        return Math.min(255, Math.max(0, channel + delta))
            .toString(16)
            .padStart(2, '0');
    });

    return `#${channels.join('')}`;
};

const normalizeChartData = (
    data: Array<{ name: string; y: number; color: string }>,
): Array<{ name: string; y: number; color: string }> => {
    const MIN_THRESHOLD = 0.001;
    const nonZeroData = data.filter((item) => item.y > MIN_THRESHOLD);
    if (nonZeroData.length === 0) return [];

    const hasSmallValues = nonZeroData.some((item) => item.y < MIN_CHART_PIE_PERCENTAGE);
    if (!hasSmallValues) return nonZeroData;

    const smallData = nonZeroData.filter((item) => item.y < MIN_CHART_PIE_PERCENTAGE);
    const normalData = nonZeroData.filter((item) => item.y >= MIN_CHART_PIE_PERCENTAGE);
    if (smallData.length === 0) return nonZeroData;

    const reservedPercentage = smallData.length * MIN_CHART_PIE_PERCENTAGE;
    const totalNormalPercentage = normalData.reduce((sum, item) => sum + item.y, 0);
    const remainingPercentage = 100 - reservedPercentage;
    if (remainingPercentage <= 0) return nonZeroData;

    const scaleFactor = remainingPercentage / totalNormalPercentage;
    const normalizedNormal = normalData.map((item) => ({
        ...item,
        y: item.y * scaleFactor,
    }));
    const normalizedSmall = smallData.map((item) => ({
        ...item,
        y: MIN_CHART_PIE_PERCENTAGE,
    }));

    return [...normalizedNormal, ...normalizedSmall].sort(
        (a, b) =>
            data.findIndex((d) => d.name === a.name) - data.findIndex((d) => d.name === b.name),
    );
};

export const createChartPortfolioTreemap = (
    cells: PortfolioTreemapCell[],
): echarts.EChartsOption => ({
    animation: false,
    tooltip: {
        trigger: 'item',
        backgroundColor: CHART_COLORS.tooltip.background,
        borderWidth: 0,
        borderRadius: 8,
        padding: 8,
        textStyle: { color: CHART_COLORS.tooltip.text, fontSize: 12 },
        formatter: (params) => {
            const data = (Array.isArray(params) ? params[0] : params).data as PortfolioTreemapCell;
            if (!data?.name) return '';
            return `<b>${data.name}</b>: ${formatPercentVN(data.percent)}`;
        },
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
            label: {
                show: true,
                position: 'inside',
                color: CHART_COLORS.tooltip.text,
                fontSize: 12,
                lineHeight: 16,
                fontWeight: 600,
                overflow: 'truncate',
                formatter: (params) => {
                    const data = params.data as PortfolioTreemapCell | undefined;
                    if (!data?.name) return '';
                    if ((data.percent ?? 0) < 3) {
                        return data.name;
                    }
                    return `${data.name}\n${formatPercentVN(data.percent)}`;
                },
            },
            itemStyle: {
                borderColor: PORTFOLIO_TREEMAP_COLORS.border,
                borderWidth: 0.5,
                gapWidth: 0.5,
            },
            data: cells,
        },
    ],
});

export const createChartAllocationPie = (
    data: Array<{ name: string; y: number; color: string }>,
): echarts.EChartsOption => {
    const normalizedData = normalizeChartData(data);

    return {
        animationDuration: 500,
        animationDurationUpdate: 500,
        animationEasing: 'sinusoidalInOut',
        backgroundColor: CHART_COLORS.background,
        tooltip: {
            trigger: 'item',
            backgroundColor: CHART_COLORS.tooltip.background,
            borderWidth: 0,
            borderRadius: 8,
            padding: 8,
            textStyle: { color: CHART_COLORS.tooltip.text, fontSize: 12 },
            formatter: (params) => {
                const param = Array.isArray(params) ? params[0] : params;
                const originalItem = data.find((item) => item.name === param.name);
                const y = originalItem?.y ?? (param.value as number);
                const originalPercent =
                    y != null
                        ? formatNumberVN(y, {
                              decimals: 2,
                              trimTrailingZeros: false,
                          })
                        : '';
                return `<b>${param.name}</b>: ${originalPercent}%`;
            },
        },
        series: [
            {
                type: 'pie',
                radius: ['70%', '100%'],
                center: ['50%', '50%'],
                label: { show: false },
                labelLine: { show: false },
                itemStyle: { borderWidth: 2, borderColor: CHART_COLORS.pie.border },
                emphasis: { scale: false },
                data: normalizedData.map((item) => ({
                    name: item.name,
                    value: item.y,
                    itemStyle: { color: item.color },
                    emphasis: { itemStyle: { color: brightenColor(item.color, 0.08) } },
                })),
            },
        ],
    };
};
