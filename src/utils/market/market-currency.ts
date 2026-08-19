import {
    DEPOSIT_RATE_BANKS,
    DEPOSIT_RATE_DURATION_KEYWORD,
    LOAN_RATE_FIXED_TYPE,
    LOAN_RATE_FLOAT_TYPE,
    LOAN_RATE_PREFERRED_BANK,
} from '@/constants/market';
import type {
    BankInterestRatesData,
    ExchangeRateChartData,
    ExchangeRateValueType,
    LoanRateItem,
    MacroPoint,
    OmoHistoryItem,
} from '@/types/datafeed/finance';
import type {
    MacroLiquidityDepositRateView,
    MacroLiquidityExchangeRateView,
    MacroLiquidityInterbankRateView,
    MacroLiquidityLoanRateView,
    MacroLiquidityOmoView,
    MacroLiquidityStatRow,
    MacroLiquidityState,
} from '@/types/pages/market';
import { formatNumberVN } from '@/utils/format';
import { trendFromDelta } from '@/utils/market/market-shared';

export const deriveExchangeRate = (
    chart: ExchangeRateChartData | null,
): MacroLiquidityExchangeRateView | null => {
    const items = chart?.chart_items ?? [];
    if (items.length === 0) return null;
    const first = items[0].VCB;
    const last = items[items.length - 1].VCB;
    if (first == null || first === 0) return null;
    const changePercent = Math.abs(((last - first) / first) * 100);
    return {
        value: formatNumberVN(last, { decimals: 0 }),
        changePercent: formatNumberVN(changePercent, { trimTrailingZeros: true }),
        trend: trendFromDelta(last - first),
    };
};

export const deriveInterbankRate = (
    points: MacroPoint[],
): MacroLiquidityInterbankRateView | null => {
    if (points.length === 0) return null;
    const last = points[points.length - 1].value;
    const prev = points.length > 1 ? points[points.length - 2].value : last;
    const bps = Math.round((last - prev) * 100);
    return {
        value: formatNumberVN(last, { trimTrailingZeros: true }),
        bps,
        trend: trendFromDelta(bps),
    };
};

export const deriveOmo = (items: OmoHistoryItem[]): MacroLiquidityOmoView | null => {
    if (items.length === 0) return null;
    const outstanding = items[items.length - 1].outstanding_volume;
    return { value: formatNumberVN(outstanding / 1000, { decimals: 1 }) };
};

export const formatExchangeLegendValue = (
    value: number | undefined,
    valueType: ExchangeRateValueType,
): string => {
    if (value == null) return '--';
    if (valueType === 'PERCENT') {
        return `${formatNumberVN(value, { trimTrailingZeros: true })}%`;
    }
    return formatNumberVN(value, { decimals: 0 });
};

export const deriveDepositRate = (
    data: BankInterestRatesData | null,
): MacroLiquidityDepositRateView | null => {
    const banks = data?.bank_interest_rates ?? [];
    const rates: number[] = [];
    for (const { apiName } of DEPOSIT_RATE_BANKS) {
        const bank = banks.find((item) => item.bank_name.toLowerCase() === apiName.toLowerCase());
        const rate12m = bank?.rates.find((rate) =>
            rate.duration_name.includes(DEPOSIT_RATE_DURATION_KEYWORD),
        );
        if (rate12m) rates.push(rate12m.value * 100);
    }
    if (rates.length === 0) return null;
    const average = rates.reduce((total, rate) => total + rate, 0) / rates.length;
    return { value: formatNumberVN(average, { trimTrailingZeros: true }) };
};

const isValidLoanRateType = (rateType: string | null): boolean =>
    rateType === null || rateType === LOAN_RATE_FIXED_TYPE || rateType === LOAN_RATE_FLOAT_TYPE;

export const deriveLoanRate = (items: LoanRateItem[]): MacroLiquidityLoanRateView | null => {
    if (items.length === 0) return null;

    const deriveForBank = (bankName: string): MacroLiquidityLoanRateView | null => {
        const bankItems = items.filter((item) => item.bank_name === bankName);
        const packages: Record<string, LoanRateItem[]> = {};
        for (const item of bankItems) {
            (packages[item.package_code] ??= []).push(item);
        }
        for (const phases of Object.values(packages)) {
            const allValid = phases.every((phase) => isValidLoanRateType(phase.rate_type));
            const hasFixed = phases.some((phase) => phase.rate_type === LOAN_RATE_FIXED_TYPE);
            if (!allValid || !hasFixed) continue;
            const firstPhase = phases.find((phase) => phase.phase_order === 1);
            if (!firstPhase || firstPhase.fixed_rate_percent === null) continue;
            return {
                value: formatNumberVN(firstPhase.fixed_rate_percent, { trimTrailingZeros: true }),
                durationMonths: firstPhase.phase_duration_months,
                bankName,
            };
        }
        return null;
    };

    const preferredBank = items.find((item) =>
        item.bank_name.toLowerCase().includes(LOAN_RATE_PREFERRED_BANK.toLowerCase()),
    );
    if (preferredBank) {
        const preferred = deriveForBank(preferredBank.bank_name);
        if (preferred) return preferred;
    }

    const seenBanks = new Set<string>();
    for (const item of items) {
        if (seenBanks.has(item.bank_name)) continue;
        seenBanks.add(item.bank_name);
        const result = deriveForBank(item.bank_name);
        if (result) return result;
    }
    return null;
};

export const buildMacroLiquidityRows = (state: MacroLiquidityState): MacroLiquidityStatRow[] => {
    const rows: MacroLiquidityStatRow[] = [];
    if (state.exchangeRate) {
        rows.push({
            key: 'exchange',
            icon: 'coins',
            iconClassName: 'text-green',
            title: 'Tỷ giá',
            subtitle: 'USD/VND',
            value: state.exchangeRate.value,
            change: {
                text: `${state.exchangeRate.changePercent}%`,
                trend: state.exchangeRate.trend,
            },
        });
    }
    if (state.interbank) {
        rows.push({
            key: 'interbank',
            icon: 'building',
            iconClassName: 'text-blue',
            title: 'Lãi suất qua đêm',
            subtitle: 'Liên ngân hàng',
            value: `${state.interbank.value}%`,
            change: {
                text: `${Math.abs(state.interbank.bps)} bps`,
                trend: state.interbank.trend,
            },
        });
    }
    if (state.omo) {
        rows.push({
            key: 'omo',
            icon: 'omo',
            iconClassName: 'text-purple',
            title: 'Thị trường mở',
            subtitle: 'OMO lưu hành',
            value: state.omo.value,
            valueSuffix: 'nghìn tỷ đồng',
        });
    }
    if (state.deposit) {
        rows.push({
            key: 'deposit',
            title: 'Lãi suất huy động 12T',
            subtitle: 'Bình quân của VPB, MB, TCB, ACB',
            value: `${state.deposit.value}%`,
        });
    }
    if (state.loan) {
        rows.push({
            key: 'loan',
            title: `Lãi suất cho vay ${state.loan.durationMonths} tháng đầu`,
            subtitle: `${state.loan.bankName} (Cố định trong thời gian trên)`,
            value: `${state.loan.value}%`,
        });
    }
    return rows;
};
