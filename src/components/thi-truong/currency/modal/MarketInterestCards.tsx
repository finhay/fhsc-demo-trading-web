'use client';

import { useMemo } from 'react';

import type { BankInterestRatesData, LoanRateItem } from '@/types/datafeed/finance';
import { deriveDepositRate, deriveLoanRate } from '@/utils/market/market-currency';

type Props = {
    depositData: BankInterestRatesData | null;
    loanItems: LoanRateItem[];
};

export const MarketInterestCards = ({ depositData, loanItems }: Props) => {
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
                                {'Lãi suất huy động 12T'}
                            </p>
                            <p className="font-caption text-secondary">
                                {'Bình quân của VPB, MB, TCB, ACB'}
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
                                    ? `Lãi suất cho vay ${loan.durationMonths} tháng đầu`
                                    : 'Lãi suất cho vay -- tháng đầu'}
                            </p>
                            <p className="font-caption text-secondary">
                                {loan ? `${loan.bankName} (Cố định trong thời gian trên)` : '--'}
                            </p>
                        </div>
                    </div>
                    <p className="font-body-1-highlight text-primary shrink-0">
                        {loan ? `${loan.value}%` : '--'}
                    </p>
                </article>
            </div>
            <p className="font-caption text-tertiary">
                {
                    'Lưu ý: Thông tin lãi suất chỉ mang tính chất tham khảo, và có thể thay đổi dựa trên chính sách ngân hàng. Vui lòng liên hệ trực tiếp ngân hàng để được tư vấn về lãi suất và các gói vay.'
                }
            </p>
        </div>
    );
};
