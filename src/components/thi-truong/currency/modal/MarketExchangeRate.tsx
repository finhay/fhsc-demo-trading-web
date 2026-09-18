'use client';

import { useMemo, useRef, useState } from 'react';

import { createChartExchangeRate } from '@/config/market/market-currency';
import {
    EXCHANGE_RATE_CURRENCIES,
    EXCHANGE_RATE_DEFAULT_PERIOD,
    EXCHANGE_RATE_DEFAULT_VALUE_TYPE,
    EXCHANGE_RATE_PERIODS,
    EXCHANGE_RATE_VALUE_TYPES,
    MACRO_LIQUIDITY_DEFAULT_CURRENCY,
} from '@/constants/market';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import { useEChartsOption } from '@/hooks/chart/useEChartsOption';
import { fetchExchangeRateChart } from '@/services/api/datafeed/finance';
import type {
    ExchangeRateChartData,
    ExchangeRatePeriod,
    ExchangeRateValueType,
} from '@/types/datafeed/finance';
import type { ExchangeRateCurrency } from '@/types/pages/market';
import { isSuccessApi } from '@/utils/common';
import { formatExchangeLegendValue } from '@/utils/market/market-currency';
import { getMarketPillClass, resolveChartAxisDateStyle } from '@/utils/market/market-shared';

type Props = {
    initialChart: ExchangeRateChartData | null;
};

const buildChartKey = (
    currency: ExchangeRateCurrency,
    valueType: ExchangeRateValueType,
    period: ExchangeRatePeriod,
) => `${currency}-${valueType}-${period}`;

export const MarketExchangeRate = ({ initialChart }: Props) => {
    const [currency, setCurrency] = useState<ExchangeRateCurrency>(
        MACRO_LIQUIDITY_DEFAULT_CURRENCY,
    );
    const [valueType, setValueType] = useState<ExchangeRateValueType>(
        EXCHANGE_RATE_DEFAULT_VALUE_TYPE,
    );
    const [period, setPeriod] = useState<ExchangeRatePeriod>(EXCHANGE_RATE_DEFAULT_PERIOD);
    const [chart, setChart] = useState<ExchangeRateChartData | null>(initialChart);
    const [chartPeriod, setChartPeriod] = useState<ExchangeRatePeriod>(
        EXCHANGE_RATE_DEFAULT_PERIOD,
    );
    const requestedChartKeyRef = useRef(
        buildChartKey(
            MACRO_LIQUIDITY_DEFAULT_CURRENCY,
            EXCHANGE_RATE_DEFAULT_VALUE_TYPE,
            EXCHANGE_RATE_DEFAULT_PERIOD,
        ),
    );
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useEChartsInstance(chartRef);

    const items = useMemo(() => chart?.chart_items ?? [], [chart]);
    const lastItem = items[items.length - 1];
    const valueTypeTabs = EXCHANGE_RATE_VALUE_TYPES.map((type) => ({
        type,
        label: type === 'NUMBER' ? 'Số' : '%',
    }));
    const periodLabels: Record<ExchangeRatePeriod, string> = {
        YTD: 'Từ đầu năm',
        '1M': '1 tháng',
        '1Y': '1 năm',
    };
    const legends = useMemo(
        () =>
            [
                {
                    key: 'VCB',
                    label: 'NH thương mại',
                    colorClass: 'base-blue',
                    value: lastItem?.VCB,
                },
                {
                    key: 'SBV',
                    label: 'NHNN',
                    colorClass: 'base-orange',
                    value: lastItem?.SBV,
                },
                {
                    key: 'BLACK_MARKET',
                    label: 'Tự do',
                    colorClass: 'bg-gray',
                    value: lastItem?.BLACK_MARKET,
                },
            ].filter((legend) => legend.value != null && Number.isFinite(legend.value)),
        [lastItem],
    );

    const loadChart = async (
        nextCurrency: ExchangeRateCurrency,
        nextValueType: ExchangeRateValueType,
        nextPeriod: ExchangeRatePeriod,
    ) => {
        const chartKey = buildChartKey(nextCurrency, nextValueType, nextPeriod);
        requestedChartKeyRef.current = chartKey;

        try {
            const { data, error_code } = await fetchExchangeRateChart(
                nextCurrency,
                nextPeriod,
                nextValueType,
            );
            if (requestedChartKeyRef.current !== chartKey) return;
            setChart(isSuccessApi(error_code) ? (data ?? null) : null);
            setChartPeriod(nextPeriod);
        } catch {
            if (requestedChartKeyRef.current !== chartKey) return;
            setChart(null);
            setChartPeriod(nextPeriod);
        }
    };

    const handleChangeCurrency = async (nextCurrency: ExchangeRateCurrency) => {
        if (nextCurrency === currency) return;
        setCurrency(nextCurrency);
        await loadChart(nextCurrency, valueType, period);
    };

    const handleChangeValueType = async (nextValueType: ExchangeRateValueType) => {
        if (nextValueType === valueType) return;
        setValueType(nextValueType);
        await loadChart(currency, nextValueType, period);
    };

    const handleChangePeriod = async (nextPeriod: ExchangeRatePeriod) => {
        if (nextPeriod === period) return;
        setPeriod(nextPeriod);
        await loadChart(currency, valueType, nextPeriod);
    };

    useEChartsOption(
        chartInstanceRef,
        () =>
            createChartExchangeRate(
                items,
                {
                    vcb: 'NH thương mại',
                    sbv: 'NHNN',
                    free: 'Tự do',
                },
                resolveChartAxisDateStyle(chartPeriod),
            ),
        { deps: [items, chartPeriod] },
    );

    return (
        <section className="base-secondary flex flex-col gap-5 rounded-2xl p-4">
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-5">
                        {EXCHANGE_RATE_CURRENCIES.map((item) => {
                            const isActive = currency === item;
                            return (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => handleChangeCurrency(item)}
                                    className={
                                        isActive
                                            ? 'body-4-highlight text-primary'
                                            : 'body-4 text-secondary'
                                    }
                                >
                                    {`${item}/VND`}
                                </button>
                            );
                        })}
                    </div>
                    <div className="border-tertiary flex items-center rounded-full border p-1">
                        {valueTypeTabs.map(({ type, label }) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => handleChangeValueType(type)}
                                className={`body-5-highlight flex h-7 min-w-7 items-center justify-center rounded-full px-3 ${
                                    valueType === type
                                        ? 'base-quaternary text-primary'
                                        : 'text-secondary'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {EXCHANGE_RATE_PERIODS.map((value) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => handleChangePeriod(value)}
                            className={getMarketPillClass(period === value)}
                        >
                            {periodLabels[value]}
                        </button>
                    ))}
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    {legends.map((legend) => (
                        <div
                            key={legend.key}
                            className="border-tertiary flex items-center gap-4 rounded-full border px-3 py-1"
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className={`h-2 w-2 shrink-0 rounded-full ${legend.colorClass}`}
                                    aria-hidden
                                />
                                <span className="body-4 text-secondary">{legend.label}</span>
                            </div>
                            <span className="body-4-highlight text-primary">
                                {formatExchangeLegendValue(legend.value, valueType)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="relative h-48 w-full">
                <div ref={chartRef} className="h-full w-full" />
            </div>
        </section>
    );
};
