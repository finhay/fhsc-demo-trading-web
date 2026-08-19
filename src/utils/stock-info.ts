import type * as echarts from 'echarts';

import {
    BASE_UI_LABELS,
    COMPANY_TYPE,
    PLAN,
    REPORT_SCHEMAS,
    STATUS_COLORS,
    UI_LABEL_OVERRIDES,
} from '@/constants/stock-info';
import type {
    CompanyType,
    PlanItem,
    ReportTab,
    StockInfoPercentTooltipItem,
    StockInfoSparklineData,
    StockInfoTabKey,
    SymbolInfoRealtimeSnapshot,
    TradeReportSchemaRow,
    TradingChartPoint,
} from '@/types/pages/stock-info';
import { getMarketPriceColor } from '@/utils/common';
import { formatNumberVN } from '@/utils/format';

export const getSymbolInfoPriceColor = (
    value: number,
    snapshot: SymbolInfoRealtimeSnapshot,
): string =>
    value > 0 && snapshot.reference > 0
        ? getMarketPriceColor(value, snapshot.reference, snapshot.floor, snapshot.ceiling)
        : 'text-primary';

export const stockInfoHiddenAxis = {
    show: false,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
    splitLine: { show: false },
};

export const normalizeChartData = (data: StockInfoSparklineData): number[] =>
    data.map((item) => (typeof item === 'number' ? item : item.y));

const formatPercentTooltip = (params: unknown, items: StockInfoPercentTooltipItem[]): string => {
    const pts = (Array.isArray(params) ? params : [params]) as {
        seriesName?: string;
        value?: number | string;
    }[];
    const rows = pts
        .map((p) => {
            const item = items.find((i) => i.label === p.seriesName);
            const value = Number(p.value ?? 0);
            return `
                <div class="flex items-center gap-2">
                    <span class="h-1.5 w-1.5 shrink-0 rounded-full ${item?.dotColor ?? ''}"></span>
                    <span class="font-caption text-secondary">${p.seriesName ?? ''}:</span>
                    <span class="font-caption-highlight text-primary">${formatNumberVN(value)}%</span>
                </div>`;
        })
        .join('');
    return `<div class="flex flex-col gap-1">${rows}</div>`;
};

export const appendPercentTooltip = (
    options: echarts.EChartsOption,
    items: StockInfoPercentTooltipItem[],
): echarts.EChartsOption => ({
    ...options,
    tooltip: {
        trigger: 'axis',
        renderMode: 'html',
        backgroundColor: '#28292b',
        borderWidth: 0,
        padding: 8,
        formatter: (params: unknown) => formatPercentTooltip(params, items),
    },
    series: (options.series as echarts.SeriesOption[] | undefined)?.map((s) => ({
        ...s,
        silent: false,
    })),
});

export const formatTradeBarTooltip = (params: unknown): string => {
    const p = params as {
        value?: number;
        data?: TradingChartPoint & { value?: number };
        name?: string;
    };
    const point = (p.data ?? {}) as TradingChartPoint;
    const y = Number(p.value ?? point.netValueInBillion ?? 0);
    const valueClass = y >= 0 ? 'text-green' : 'text-red';
    const date = point.fullDateLabel || String(p.name ?? '');

    return `
        <div class="flex flex-col gap-1 rounded-xl bg-tertiary px-2.5 py-2">
            <p class="font-caption-highlight text-secondary">${date}</p>
            <p class="font-caption text-secondary">Mua bán ròng</p>
            <p class="font-caption-highlight ${valueClass}">${formatNumberVN(Math.abs(y), { trimTrailingZeros: true })} tỷ đồng</p>
        </div>
    `;
};

export const formatBusinessTrendTooltip = (params: unknown): string => {
    const pts = (Array.isArray(params) ? params : [params]) as {
        value?: number | string;
        color?: string;
    }[];
    let html = '<div class="flex flex-col gap-0.5 text-center">';
    for (const p of pts) {
        const y = Number(p.value ?? 0);
        const color = String(p.color ?? '#f8f8f8');
        html += `<span class="block font-tiny-highlight" style="color:${color}">${formatNumberVN(
            y,
            {
                decimals: 2,
                trimTrailingZeros: false,
            },
        )}</span>`;
    }
    html += '</div>';
    return html;
};

export const sortByYearAsc = (arr: any): any[] => {
    if (!Array.isArray(arr)) return [];
    return [...arr].sort((a, b) => {
        const yearDiff = (a?.year ?? 0) - (b?.year ?? 0);
        if (yearDiff !== 0) return yearDiff;
        return (a?.quarter ?? 0) - (b?.quarter ?? 0);
    });
};

export const trendColor = (series: number[]): string => {
    if (series.length < 2) return STATUS_COLORS.positive;
    return series[0] > series[series.length - 1] ? STATUS_COLORS.negative : STATUS_COLORS.positive;
};

export const toneClass = (color: string): string =>
    color === STATUS_COLORS.positive ? 'text-green' : 'text-red';

export const getValueClass = (value: number, strict = false): string => {
    const positive = strict ? value > 0 : value >= 0;
    return positive ? 'text-green' : 'text-red';
};

export const getToneByValue = (value: number): string => (value > 0 ? 'positive' : 'negative');

export const pickPlanItems = (
    latest: any,
    defs: { labelKey: string; key: string }[] = PLAN.itemDefs,
): PlanItem[] =>
    defs.map((item) => {
        const value = Number(latest?.[item.key]) * 100 || 0;
        const isZero = value === 0;
        const color = isZero
            ? { textColor: 'text-gray', bgColor: 'bg-gray' }
            : value >= PLAN.threshold
              ? { textColor: 'text-green', bgColor: 'bg-green' }
              : { textColor: 'text-orange', bgColor: 'bg-orange' };
        return { ...item, value, isZero, ...color };
    });

export const getTabInformationLabel = (key: StockInfoTabKey) => {
    switch (key) {
        case 'CHART':
            return 'Biểu đồ';
        case 'OVERVIEW':
            return 'Tổng quan';
        case 'NEWS':
            return 'Tin tức';
        case 'FINANCE':
            return 'Tài chính';
        case 'STATISTICS':
            return 'Thống kê';
        case 'EVENTS':
            return 'Sự kiện';
        case 'PROFILE':
            return 'Hồ sơ';
        default:
            return key;
    }
};

const resolveUiLabel = (
    companyType: CompanyType,
    tab: ReportTab,
    metricKey: string,
): string | undefined => {
    const caseOverride = UI_LABEL_OVERRIDES[companyType]?.[tab]?.[metricKey];
    if (caseOverride) return caseOverride;
    return BASE_UI_LABELS[metricKey];
};

export const getTradeReportSchema = (
    companyType: string | undefined,
    activeTab: ReportTab,
): TradeReportSchemaRow[] => {
    const normalizedCompanyType = (companyType || COMPANY_TYPE.NON_FINANCIAL) as CompanyType;
    const schemaByCompanyType =
        REPORT_SCHEMAS[normalizedCompanyType] || REPORT_SCHEMAS[COMPANY_TYPE.NON_FINANCIAL];
    const baseSchema = schemaByCompanyType[activeTab] || [];

    return baseSchema.map((row) => {
        if (row.kind !== 'data') return row;
        return {
            ...row,
            uiLabel: resolveUiLabel(normalizedCompanyType, activeTab, row.metricKey),
        };
    });
};
