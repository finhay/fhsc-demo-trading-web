'use client';

import { useMemo } from 'react';

import { useTranslate } from '@/hooks/useTranslate';
import type { BankInterestRatesData, LoanRateItem } from '@/types/datafeed/finance';
import { deriveDepositRate, deriveLoanRate } from '@/utils/market/market-currency';

type Props = {
    depositData: BankInterestRatesData | null;
    loanItems: LoanRateItem[];
};

export const MarketInterestCards = ({ depositData, loanItems }: Props) => {
    const trans = useTranslate();
    const currency = trans.market.currency;
    const deposit = useMemo(() => deriveDepositRate(depositData), [depositData]);
    const loan = useMemo(() => deriveLoanRate(loanItems), [loanItems]);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 lg:flex-row">
                <article className="bg-secondary flex flex-1 items-center justify-between gap-3 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                        <span className="bg-blue h-1.5 w-1.5 shrink-0 rounded-full" aria-hidden />
                        <div className="flex flex-col gap-1">
                            <p className="font-body-2-highlight text-primary">
                                {currency.row_deposit}
                            </p>
                            <p className="font-caption text-secondary">
                                {currency.row_deposit_sub}
                            </p>
                        </div>
                    </div>
                    <p className="font-body-1-highlight text-primary shrink-0">
                        {deposit ? `${deposit.value}%` : '--'}
                    </p>
                </article>

                <article className="bg-secondary flex flex-1 items-center justify-between gap-3 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                        <span className="bg-orange h-1.5 w-1.5 shrink-0 rounded-full" aria-hidden />
                        <div className="flex flex-col gap-1">
                            <p className="font-body-2-highlight text-primary">
                                {loan
                                    ? currency.row_loan_fn(loan.durationMonths)
                                    : currency.row_loan_fn('--')}
                            </p>
                            <p className="font-caption text-secondary">
                                {loan ? currency.row_loan_sub_fn(loan.bankName) : '--'}
                            </p>
                        </div>
                    </div>
                    <p className="font-body-1-highlight text-primary shrink-0">
                        {loan ? `${loan.value}%` : '--'}
                    </p>
                </article>
            </div>
            <p className="font-caption text-tertiary">{currency.disclaimer}</p>
        </div>
    );
};
