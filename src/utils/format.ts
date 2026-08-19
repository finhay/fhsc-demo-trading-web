import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

import { FinancialStatementRow } from '@/types/datafeed/finance';

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export const formatDate = (date: string | Date, format: string = 'DD/MM/YYYY') => {
    if (!date) return '';

    let parsed = dayjs(null);
    if (date instanceof Date) {
        parsed = dayjs(date);
    } else {
        const dateStr = String(date).trim();
        if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
            parsed = dayjs(dateStr.slice(0, 10), 'YYYY-MM-DD', true);
        } else if (/^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
            parsed = dayjs(dateStr.slice(0, 10), 'DD/MM/YYYY', true);
        } else if (/^\d{2}-\d{2}-\d{4}/.test(dateStr)) {
            parsed = dayjs(dateStr.slice(0, 10), 'DD-MM-YYYY', true);
        } else if (/^\d{1,2}\/\d{4}$/.test(dateStr)) {
            parsed = dayjs(dateStr, ['M/YYYY', 'MM/YYYY'], true);
        } else if (/^\d{1,2}-\d{4}$/.test(dateStr)) {
            parsed = dayjs(dateStr, ['M-YYYY', 'MM-YYYY'], true);
        } else {
            parsed = dayjs(dateStr);
        }
    }

    if (!parsed.isValid()) {
        return '';
    }

    return parsed.format(format);
};

export const formatDateOrDash = (date: string | Date | null | undefined, format?: string): string =>
    formatDate(date ?? '', format) || '--';

export const formatDateOrRaw = (raw: string): string =>
    /^\d{4}-\d{2}-\d{2}/.test(raw) ? formatDate(raw) : raw;

export const formatShortDate = (dateString: string): string => {
    const dateStr = String(dateString).trim();
    if (/^\d{1,2}[/-]\d{4}$/.test(dateStr)) {
        return formatDate(dateStr, 'MM/YY');
    }
    return formatDate(dateStr, 'DD/MM/YY');
};

export const formatPeriodMMYYYY = (period: {
    year?: number | string;
    quarter?: number;
    month?: number;
}): string => {
    const year = period?.year;
    if (!year) return '';
    const month = period?.month
        ? Number(period.month)
        : period?.quarter
          ? Number(period.quarter) * 3
          : 12;
    return dayjs()
        .year(Number(year))
        .month(month - 1)
        .format('MM/YYYY');
};

export const formatApiDate = (date?: string | Date): string => {
    if (!date) return dayjs().format('YYYY-MM-DD');
    const parsed = dayjs(date);
    if (!parsed.isValid()) return '';
    return parsed.format('YYYY-MM-DD');
};

export const formatDateTime = (dateString: string, separator: string = '/'): string => {
    if (!dateString) return '';
    const parsed = dayjs(dateString);
    if (!parsed.isValid()) return '';
    return parsed.format(`HH:mm DD${separator}MM${separator}YYYY`);
};

export const formatTimeString = (timeString: string, separator: string = '/'): string => {
    if (!timeString) return '';

    const parsed = dayjs(timeString);
    if (!parsed.isValid()) {
        return '';
    }

    return parsed.format(`DD${separator}MM${separator}YYYY`);
};

export const formatTimeHm = (time?: string | null): string => (time ? time.substring(0, 5) : '');

export const formatPeriod = ({ quarter, year }: FinancialStatementRow) => `Q${quarter}/${year}`;

export const formatQuarterlyMonthHeader = (month: string): string =>
    `T${dayjs(month).format('M/YY')}`;

export const formatStockTimeRange = (baseDate?: number | string | Date): number[] => {
    const today = baseDate ? dayjs(baseDate) : dayjs();
    const tzoffset = today.toDate().getTimezoneOffset() * 60000;
    return [9, 10, 11, 12, 13, 14, 15].map(
        (h) => today.hour(h).minute(0).second(0).valueOf() - tzoffset,
    );
};

export const formatDateToTimestamp = (date: string | Date): number => dayjs(date).valueOf();

export const addMonths = (n: number, from?: Date | string): Date =>
    dayjs(from).add(n, 'month').toDate();

export const subtractDays = (n: number, from?: Date | string): Date =>
    dayjs(from).subtract(n, 'day').toDate();

export const getYearRange = (
    years: number,
    baseDate?: string | Date,
): { fromDate: string; toDate: string } => {
    const to = dayjs(baseDate);
    return {
        toDate: to.format('YYYY-MM-DD'),
        fromDate: to.subtract(years, 'year').format('YYYY-MM-DD'),
    };
};

export const getDateRange = (days: number): { fromDate: string; toDate: string } => ({
    toDate: formatApiDate(),
    fromDate: formatApiDate(subtractDays(days)),
});

export const pad2 = (n: number): string => String(n).padStart(2, '0');

export const isDateAfterDay = (date1: string, date2: string): boolean =>
    dayjs(date1).isAfter(dayjs(date2), 'day');

export const isNowBefore = (date: string | Date): boolean => dayjs().isBefore(dayjs(date));

export const isDateInRange = (
    startDate: string | null | undefined,
    finishDate: string | null | undefined,
): boolean => {
    if (!startDate || !finishDate) return false;
    const d = dayjs();
    return d.isSameOrAfter(startDate, 'date') && d.isSameOrBefore(finishDate, 'date');
};

type NumberInput = number | string | null | undefined;

type FormatNumberVNOptions = {
    decimals?: number;
    trimTrailingZeros?: boolean;
};

type FormatNumberVNInputOptions = {
    mode?: 'integer' | 'decimal';
    decimalSeparator?: ',' | '.';
    maxFractionDigits?: number;
    allowEmpty?: boolean;
    normalizeLeadingZero?: boolean;
};

const parseNumberInput = (value: NumberInput): number => {
    if (value === null || value === undefined || value === '') return NaN;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return Number.isFinite(num) ? num : NaN;
};

export const formatNumberVN = (value: NumberInput, options: FormatNumberVNOptions = {}): string => {
    const { decimals = 2, trimTrailingZeros = false } = options;

    const parsed = parseNumberInput(value);
    const safeNum = Number.isFinite(parsed) ? parsed : 0;

    const formatted = safeNum.toLocaleString('vi-VN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

    if (!trimTrailingZeros || decimals === 0) return formatted;

    if (decimals === 3) return formatted.replace(/(,\d{2})0$/, '$1');

    return stripTrailingDecimalZeros(formatted);
};

export const formatBoardPrice = (rawPrice: NumberInput): string =>
    formatNumberVN(parseNumberInput(rawPrice) / 1000, { decimals: 3, trimTrailingZeros: true });

export const formatPercentVN = (value: NumberInput, decimals: number = 2): string =>
    `${formatNumberVN(value, { decimals, trimTrailingZeros: false })}%`;

export const formatNumberVNInput = (
    raw: string,
    options: FormatNumberVNInputOptions = {},
): string => {
    const {
        mode = 'integer',
        decimalSeparator = ',',
        maxFractionDigits = 3,
        allowEmpty = true,
        normalizeLeadingZero = true,
    } = options;

    if (!raw) return allowEmpty ? '' : '0';

    if (mode === 'integer') {
        const digits = raw.replace(/\D/g, '');
        const num = parseInt(digits, 10);
        if (isNaN(num) || num <= 0) return allowEmpty ? '' : '0';
        return formatNumberVN(num, { decimals: 0 });
    }

    const normalized = raw.replace(/[.,]/g, decimalSeparator);
    const separatorIdx = normalized.indexOf(decimalSeparator);
    if (separatorIdx === -1) {
        const digitsOnly = normalized.replace(/[^\d]/g, '');
        if (!digitsOnly) return allowEmpty ? '' : '0';
        return digitsOnly;
    }

    const intPart = normalized.slice(0, separatorIdx).replace(/[^\d]/g, '');
    const fractionPart = normalized
        .slice(separatorIdx + 1)
        .replace(new RegExp(`\\${decimalSeparator}`, 'g'), '')
        .replace(/[^\d]/g, '')
        .slice(0, maxFractionDigits);

    if (!intPart && !fractionPart) return allowEmpty ? '' : '0';
    const normalizedInt = normalizeLeadingZero ? intPart || '0' : intPart;
    if (fractionPart.length > 0) {
        return `${normalizedInt}${decimalSeparator}${fractionPart}`;
    }
    return intPart ? `${intPart}${decimalSeparator}` : '';
};

const stripTrailingDecimalZeros = (formatted: string): string => {
    const idx = formatted.indexOf(',');
    if (idx === -1) return formatted;
    const intPart = formatted.slice(0, idx);
    const fracPart = formatted.slice(idx + 1).replace(/0+$/, '');
    return fracPart ? `${intPart},${fracPart}` : intPart;
};

const NUMBER_UNITS = [
    { threshold: 1_000_000_000, suffix: 'tỷ', divisor: 1_000_000_000 },
    { threshold: 1_000_000, suffix: 'triệu', divisor: 1_000_000 },
    { threshold: 1_000, suffix: 'nghìn', divisor: 1_000 },
    { threshold: 0, suffix: 'vnđ', divisor: 1 },
];

export const formatNumberVNWithUnit = (value: NumberInput): string => {
    const parsed = parseNumberInput(value);
    const absNum = Math.abs(parsed);
    for (const unit of NUMBER_UNITS) {
        if (absNum >= unit.threshold) {
            const formatted = formatNumberVN(parsed / unit.divisor, { decimals: 2 });
            return `${stripTrailingDecimalZeros(formatted)} ${unit.suffix}`;
        }
    }
    return stripTrailingDecimalZeros(formatNumberVN(parsed, { decimals: 2 }));
};
