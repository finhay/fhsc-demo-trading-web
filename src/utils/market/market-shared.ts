import { CHART_X_TICK_COUNT } from '@/constants/market';
import type { ChartAxisDateStyle, MacroTrend } from '@/types/pages/market';
import { isSuccessApi } from '@/utils/common';
import { formatDate } from '@/utils/format';

const VN_TIME_ZONE = 'Asia/Ho_Chi_Minh';

const getVietnamHour = (date: Date): number => {
    const hour = Number(
        date.toLocaleString('en-US', {
            timeZone: VN_TIME_ZONE,
            hour: '2-digit',
            hour12: false,
        }),
    );
    return hour % 24;
};

const isVietnamWeekday = (date: Date): boolean => {
    const weekday = date.toLocaleString('en-US', {
        timeZone: VN_TIME_ZONE,
        weekday: 'short',
    });
    return weekday !== 'Sat' && weekday !== 'Sun';
};

export const isWithinTradingHours = (date: Date): boolean => {
    if (!isVietnamWeekday(date)) return false;
    const hour = getVietnamHour(date);
    return hour >= 9 && hour < 15;
};

export const isPreSessionHours = (date: Date): boolean => {
    if (!isVietnamWeekday(date)) return false;
    const hour = getVietnamHour(date);
    return hour >= 8 && hour < 9;
};

export const unwrap = <TData>(
    result: PromiseSettledResult<{ error_code: string; data: TData }>,
): TData | null => {
    if (result.status !== 'fulfilled') return null;
    if (!isSuccessApi(result.value.error_code)) return null;
    return result.value.data ?? null;
};

export const getTrendBg = (direction: string | undefined): string => {
    if (direction === 'up') return 'bg-green';
    if (direction === 'down') return 'bg-red';
    if (direction === 'flat') return 'bg-orange';
    return '';
};

export const trendFromDelta = (delta: number): MacroTrend => {
    if (delta > 0) return 'up';
    if (delta < 0) return 'down';
    return 'flat';
};

export const getMarketPillClass = (isActive: boolean): string =>
    `font-body-3 rounded-full px-3 py-1 ${
        isActive ? 'bg-tertiary font-body-3-highlight text-primary' : 'text-secondary'
    }`;

export const buildCategoryTickIndices = (
    length: number,
    maxTicks: number = CHART_X_TICK_COUNT,
): number[] => {
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

export const formatChartAxisDate = (date: string, style: ChartAxisDateStyle = 'month'): string =>
    formatDate(date, style === 'day' ? 'DD/MM' : 'MM/YY');

export const resolveChartAxisDateStyle = (period: string | number): ChartAxisDateStyle => {
    if (typeof period === 'number') return period >= 365 ? 'month' : 'day';
    return period === '1Y' || period === '3Y' || period === '5Y' ? 'month' : 'day';
};

export const getBarChartAxisTooltipPoint = (params: unknown) =>
    (Array.isArray(params) ? params[0] : params) as {
        name?: string;
        axisValue?: string;
        value?: number;
    };
