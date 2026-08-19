'use client';

import { useEffect, useRef, useState } from 'react';

import { FaChevronRight } from 'react-icons/fa';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { MarketCurrencyRow } from '@/components/thi-truong/currency/MarketCurrencyRow';
import { MarketCurrencyModal } from '@/components/thi-truong/currency/modal/MarketCurrencyModal';
import {
    EMPTY_MACRO_LIQUIDITY_RAW,
    EMPTY_MACRO_LIQUIDITY_STATE,
    EXCHANGE_RATE_DEFAULT_PERIOD,
    MACRO_LIQUIDITY_DEFAULT_CURRENCY,
} from '@/constants/market';
import { useTranslate } from '@/hooks/useTranslate';
import {
    fetchBankInterestRates,
    fetchExchangeRateChart,
    fetchLoanRates,
    fetchMacroIndicator,
    fetchOmoHistory,
} from '@/services/api/datafeed/finance';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import type { MacroLiquidityRawState, MacroLiquidityState } from '@/types/pages/market';
import {
    buildMacroLiquidityRows,
    deriveDepositRate,
    deriveExchangeRate,
    deriveInterbankRate,
    deriveLoanRate,
    deriveOmo,
} from '@/utils/market/market-currency';
import { unwrap } from '@/utils/market/market-shared';

export const MarketCurrency = () => {
    const trans = useTranslate();
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [raw, setRaw] = useState<MacroLiquidityRawState>(EMPTY_MACRO_LIQUIDITY_RAW);
    const [state, setState] = useState<MacroLiquidityState>(EMPTY_MACRO_LIQUIDITY_STATE);
    const { startLoading, stopLoading } = useLoadingStore();

    const fetchPromiseRef = useRef<Promise<void> | null>(null);

    const rows = buildMacroLiquidityRows(state, trans);
    const iconRows = rows.filter((row) => row.icon);
    const rateRows = rows.filter((row) => !row.icon);

    const fetchData = async () => {
        setIsLoading(true);
        const [chartRes, interbankRes, omoRes, depositRes, loanRes] = await Promise.allSettled([
            fetchExchangeRateChart(MACRO_LIQUIDITY_DEFAULT_CURRENCY, EXCHANGE_RATE_DEFAULT_PERIOD),
            fetchMacroIndicator('INTERBANK_RATE', 'VN'),
            fetchOmoHistory(),
            fetchBankInterestRates(),
            fetchLoanRates(),
        ]);

        const exchangeChart = unwrap(chartRes);
        const interbank = unwrap(interbankRes) ?? [];
        const omo = unwrap(omoRes) ?? [];
        const deposit = unwrap(depositRes);
        const loan = unwrap(loanRes) ?? [];

        setRaw({ exchangeChart, interbank, omo, deposit, loan });
        setState({
            exchangeRate: deriveExchangeRate(exchangeChart),
            interbank: deriveInterbankRate(interbank),
            omo: deriveOmo(omo),
            deposit: deriveDepositRate(deposit),
            loan: deriveLoanRate(loan),
        });
        setIsLoading(false);
    };

    useEffect(() => {
        fetchPromiseRef.current = fetchData();
    }, []);

    const handleOpenModal = async () => {
        startLoading();
        try {
            await fetchPromiseRef.current;
        } finally {
            setIsModalOpen(true);
            stopLoading();
        }
    };

    return (
        <section className="bg-secondary flex min-h-0 flex-1 flex-col gap-3 rounded-xl p-4">
            <div className="flex items-center justify-between gap-2">
                <h2 className="font-body-2-highlight text-primary flex items-center gap-2">
                    {trans.market.currency.heading}
                </h2>
                <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    className="text-primary"
                    aria-label={trans.market.currency.heading}
                >
                    <FaChevronRight size={14} />
                </button>
            </div>
            {isLoading ? (
                <div className="flex h-80 w-full">
                    <Skeleton />
                </div>
            ) : rows.length === 0 ? (
                <div className="flex min-h-0 flex-1 items-center justify-center">
                    <EmptyState />
                </div>
            ) : (
                <div className="flex min-h-0 flex-1 flex-col gap-3">
                    <ul className="contents">
                        {iconRows.map((row) => (
                            <li
                                key={row.key}
                                className="border-tertiary flex min-h-0 flex-1 items-center gap-3 rounded-xl border p-3"
                            >
                                <MarketCurrencyRow row={row} />
                            </li>
                        ))}
                    </ul>
                    {rateRows.length > 0 && (
                        <ul className="border-tertiary flex min-h-0 flex-1 flex-col rounded-xl border">
                            {rateRows.map((row, index) => (
                                <li
                                    key={row.key}
                                    className={`flex flex-1 items-center gap-3 p-3 ${index === rateRows.length - 1 ? '' : 'border-tertiary border-b'}`}
                                >
                                    <MarketCurrencyRow row={row} />
                                </li>
                            ))}
                        </ul>
                    )}
                    <p className="font-caption text-tertiary">{trans.market.currency.disclaimer}</p>
                </div>
            )}
            {isModalOpen && <MarketCurrencyModal onClose={() => setIsModalOpen(false)} raw={raw} />}
        </section>
    );
};
