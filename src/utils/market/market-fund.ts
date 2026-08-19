import {
    FUND_UNIVERSE_TAB,
    PROFIT_PERIOD_ONE_YEAR,
    PROFIT_PERIOD_THREE_YEARS,
} from '@/constants/market';
import type {
    FundCertificateItem,
    FundCompareWinner,
    FundFee,
    FundListTab,
    FundPlanetItem,
    FundTopFundFlowItem,
    FundTopGrowthItem,
    FundUniverseTab,
} from '@/types/pages/fund';
import { getChangeColor } from '@/utils/common';
import { formatNumberVN, formatNumberVNWithUnit } from '@/utils/format';

type FundFeeRangeLabels = {
    under: (value: string) => string;
    over: (value: string) => string;
    between: (start: string, end: string) => string;
    unitDay: string;
    unitMonth: string;
    unitYear: string;
};

export const getFundValueColor = (
    value: number | null | undefined,
    fallbackClass = 'text-secondary',
): string => (value == null || value === 0 ? fallbackClass : getChangeColor(value));

export const getProfitByPeriod = (item: FundCertificateItem, period: string): number | null => {
    const periods =
        period === 'YEAR_TO_DATE'
            ? ['YEAR_TO_DATE', 'YTD', 'BEGINNING_OF_YEAR', 'BEGIN_THE_YEAR']
            : [period];
    for (const key of periods) {
        const found = item.average_profits?.find((profit) => profit.period === key);
        if (found) return found.average_percent_profit ?? null;
    }
    return null;
};

export const filterFundCertificatesByType = (
    certificates: FundCertificateItem[],
    tab: FundListTab,
): FundCertificateItem[] => certificates.filter((item) => item.type === tab);

export const formatFundPercent = (
    value: number | null | undefined,
    options?: { withSign?: boolean; decimals?: number; zeroAsDash?: boolean },
): string => {
    const { withSign = true, decimals = 2, zeroAsDash = true } = options ?? {};
    if (value == null) return '--';
    if (value === 0) return zeroAsDash ? '--' : '0%';
    const formatted = formatNumberVN(Math.abs(value), { decimals, trimTrailingZeros: true });
    if (!withSign) return `${formatted}%`;
    const sign = value > 0 ? '+' : '-';
    return `${sign}${formatted}%`;
};

export const formatFundMoneyCompact = (value: number | null | undefined): string => {
    if (value == null || value === 0) return '--';
    const sign = value > 0 ? '+' : value < 0 ? '-' : '';
    return `${sign}${formatNumberVNWithUnit(Math.abs(value))}`;
};

export const formatFundNetFlowBillion = (value: number | null | undefined): string => {
    if (value == null) return '--';
    const billions = Math.trunc(value / 1_000_000_000);
    if (billions === 0) return '0 tỷ';
    const sign = billions > 0 ? '+' : '-';
    return `${sign}${Math.abs(billions)} tỷ`;
};

export const formatFundCurrency = (value: number | null | undefined): string => {
    if (value == null) return '--';
    return `${formatNumberVN(value, { decimals: 0 })}đ`;
};

export const formatFundFeePercent = (
    percent: number | null | undefined,
    freeLabel: string,
): string => {
    if (percent == null || percent === 0) return freeLabel;
    return `${formatNumberVN(percent, { trimTrailingZeros: true })}%`;
};

export const formatFundFeeRange = (fee: FundFee, labels: FundFeeRangeLabels): string => {
    const unitLabel =
        fee.unit === 'DAY'
            ? labels.unitDay
            : fee.unit === 'MONTH'
              ? labels.unitMonth
              : fee.unit === 'YEAR'
                ? labels.unitYear
                : '';
    const withUnit = (value: number) =>
        unitLabel
            ? `${formatNumberVN(value, { decimals: 0 })} ${unitLabel}`
            : formatNumberVN(value, { decimals: 0 });

    const start = fee.start_value ?? 0;
    const end = fee.end_value ?? 0;

    if (!start) return labels.under(withUnit(end));
    if (!end) return labels.over(withUnit(start));
    return labels.between(formatNumberVN(start, { decimals: 0 }), withUnit(end));
};

export const getFundCompareWinner = (
    a: number | null | undefined,
    b: number | null | undefined,
): FundCompareWinner => {
    if (a == null || b == null || a === b) return 'none';
    return a > b ? 'left' : 'right';
};

export const getLatestNav = (item: FundCertificateItem) => {
    const latest = item.nav_histories?.[0];
    return {
        navpf: latest?.navpf ?? null,
        date: latest?.date ?? null,
    };
};

export const buildFundImageMap = (certificates: FundCertificateItem[]) => {
    const map = new Map<string, string>();
    certificates.forEach((item) => {
        if (item.name) map.set(item.name, item.image_url ?? '');
    });
    return map;
};

const sortFundPlanetsByValueDesc = (items: FundPlanetItem[]) =>
    [...items].sort(
        (a, b) => (b.value ?? Number.NEGATIVE_INFINITY) - (a.value ?? Number.NEGATIVE_INFINITY),
    );

const toValidFundPlanets = (items: FundPlanetItem[]) =>
    items.filter((item) => item.value != null && item.value !== 0);

export const buildFundUniversePlanets = (
    tab: FundUniverseTab,
    certificates: FundCertificateItem[],
    topInvestor: FundTopGrowthItem[],
    topAum: FundTopGrowthItem[],
    topFundFlow: FundTopFundFlowItem[],
    imageMap: Map<string, string>,
): FundPlanetItem[] => {
    if (tab === FUND_UNIVERSE_TAB.SHORT_TERM || tab === FUND_UNIVERSE_TAB.LONG_TERM) {
        const period =
            tab === FUND_UNIVERSE_TAB.SHORT_TERM
                ? PROFIT_PERIOD_ONE_YEAR
                : PROFIT_PERIOD_THREE_YEARS;
        const items: FundPlanetItem[] = certificates.map((item) => ({
            fundName: item.name,
            imageUrl: item.image_url ?? '',
            value: getProfitByPeriod(item, period),
            valueKind: 'percent',
        }));
        return sortFundPlanetsByValueDesc(toValidFundPlanets(items)).slice(0, 5);
    }
    if (tab === FUND_UNIVERSE_TAB.INVESTOR || tab === FUND_UNIVERSE_TAB.AUM) {
        const source = tab === FUND_UNIVERSE_TAB.INVESTOR ? topInvestor : topAum;
        const items: FundPlanetItem[] = source.map((item) => ({
            fundName: item.fund_name,
            imageUrl: imageMap.get(item.fund_name) ?? '',
            value: item.growth_percent,
            valueKind: 'percent',
        }));
        return sortFundPlanetsByValueDesc(toValidFundPlanets(items)).slice(0, 5);
    }
    const items: FundPlanetItem[] = topFundFlow.map((item) => ({
        fundName: item.fund_name,
        imageUrl: imageMap.get(item.fund_name) ?? '',
        value: item.fund_flow,
        valueKind: 'money',
    }));
    return sortFundPlanetsByValueDesc(toValidFundPlanets(items)).slice(0, 5);
};
