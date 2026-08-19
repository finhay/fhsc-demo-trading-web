import type { HeatmapTreemapNode } from '@/types/pages/market';
import { formatNumberVN, formatNumberVNWithUnit } from '@/utils/format';
import { getStockChangeColor } from '@/utils/market/market-heatmap';

const formatSectorTooltip = (
    data: any,
): string => `<div class="max-w-64 rounded-md border border-quaternary bg-tertiary px-2 py-1">
        <span class="block whitespace-normal break-words font-caption text-primary">${data.name ?? ''}</span>
    </div>`;

const formatHeatmapTooltip = (params: any): string => {
    const data = params?.data;
    if (!data) return '';
    if (!data.symbol) return data.name ? formatSectorTooltip(data) : '';

    const { symbol, stockName, changePercent, price, ceiling, floor, totalValue, totalVolume } =
        data;

    const pct = Number.isFinite(changePercent) ? changePercent : 0;
    const sign = pct > 0 ? '+' : '';
    const pctStr = formatNumberVN(pct);
    const pctTextClass = getStockChangeColor(price, ceiling, floor, pct);
    const displayPrice = formatNumberVN(price / 1000, {
        decimals: 2,
        trimTrailingZeros: false,
    });
    const statusLabel =
        price >= ceiling
            ? `<span class="font-caption text-purple">${'Tăng trần'}</span>`
            : price <= floor
              ? `<span class="font-caption text-blue">${'Giảm sàn'}</span>`
              : '';

    return `<div class="flex w-52 flex-col gap-2 rounded-lg bg-tertiary p-2">
        <div class="flex min-w-0 flex-col gap-0.5">
            <span class="font-caption-highlight text-primary">${symbol}</span>
            <span class="block break-words font-caption text-secondary whitespace-normal">${stockName ?? ''}</span>
        </div>
        <div class="flex items-center justify-between gap-4">
            <span class="font-body-3-highlight text-primary">${displayPrice}</span>
            <span class="font-body-3-highlight ${pctTextClass}">${sign}${pctStr}%</span>
        </div>
        ${statusLabel}
        <div class="flex flex-col gap-1.5 border-t border-quaternary pt-2">
            <div class="flex items-center justify-between gap-4">
                <span class="font-caption text-secondary">${'GTGD'}</span>
                <span class="font-caption-highlight text-primary">${formatNumberVNWithUnit(totalValue)}</span>
            </div>
            <div class="flex items-center justify-between gap-4">
                <span class="font-caption text-secondary">${'KLGD'}</span>
                <span class="font-caption-highlight text-primary">${formatNumberVN(totalVolume, { decimals: 0 })}</span>
            </div>
        </div>
    </div>`;
};

export const createMarketHeatmapEChartsOptions = (hierarchicalData: HeatmapTreemapNode[]): any => ({
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
        position: (
            point: number[],
            _params: unknown,
            _dom: unknown,
            _rect: unknown,
            size: { contentSize: number[]; viewSize: number[] },
        ) => {
            const [tooltipWidth, tooltipHeight] = size.contentSize;
            const [viewWidth, viewHeight] = size.viewSize;
            const x =
                point[0] + 10 + tooltipWidth > viewWidth
                    ? point[0] - tooltipWidth - 10
                    : point[0] + 10;
            const y =
                point[1] + 10 + tooltipHeight > viewHeight
                    ? point[1] - tooltipHeight - 10
                    : point[1] + 10;
            return [x, y];
        },
        formatter: (params: any) => formatHeatmapTooltip(params),
    },
    series: [
        {
            type: 'treemap',
            width: '100%',
            height: '100%',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            roam: false,
            nodeClick: false,
            breadcrumb: { show: false },
            animation: true,
            animationThreshold: 10000,
            animationDuration: 600,
            animationEasing: 'cubicOut',
            animationDurationUpdate: 900,
            animationEasingUpdate: 'cubicInOut',
            stateAnimation: { duration: 200, easing: 'cubicOut' },
            label: {
                show: true,
                position: 'inside',
                color: '#f8f8f8',
                fontSize: 12,
                lineHeight: 16,
                fontWeight: 600,
                overflow: 'truncate',
                formatter: (params: any) => {
                    if (!params) return '';
                    const { data, treePathInfo } = params;
                    if (treePathInfo && treePathInfo.length === 2) {
                        return data.name;
                    }
                    const { symbol, changePercent } = data ?? {};
                    if (!symbol) return '';
                    const sign = changePercent > 0 ? '+' : '';
                    return `${symbol}\n${sign}${formatNumberVN(changePercent)}%`;
                },
            },
            upperLabel: {
                show: true,
                formatter: (params: any) => {
                    const { data, treePathInfo } = params;
                    if (!data || !treePathInfo) return '';
                    if (treePathInfo.length === 2) return data.name;
                    return '';
                },
            },
            levels: [
                {
                    itemStyle: { borderColor: '#171719', gapWidth: 4 },
                    upperLabel: { show: false },
                },
                {
                    itemStyle: {
                        borderColor: '#171719',
                        borderWidth: 0,
                        gapWidth: 0,
                        borderRadius: 0,
                    },
                    upperLabel: {
                        height: 24,
                        padding: [4, 4, 4, 4],
                        backgroundColor: '#171719',
                        color: '#999999',
                        fontSize: 14,
                        fontWeight: 600,
                        borderRadius: [0, 0, 0, 0],
                        borderWidth: 0,
                    },
                },
                {
                    itemStyle: {
                        borderColor: '#313235',
                        borderWidth: 0.5,
                        gapWidth: 0.5,
                        borderRadius: 0,
                    },
                },
            ],
            data: hierarchicalData,
        },
    ],
});
