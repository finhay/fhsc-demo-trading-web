'use client';

import { useState } from 'react';

import { FaEye, FaEyeSlash } from 'react-icons/fa6';

import { Skeleton } from '@/components/common/ui/Skeleton';
import { usePaperAccountStore } from '@/stores/paper-trading/usePaperAccountStore';
import type { AssetSummaryProps } from '@/types/pages/assets';
import { formatNumberVN } from '@/utils/format';

type Props = AssetSummaryProps;

const formatMoney = (value?: number) =>
    value ? `${formatNumberVN(value, { trimTrailingZeros: true })}đ` : '0đ';

export const AssetOverview = ({ data, isLoading }: Props) => {
    const { asset } = usePaperAccountStore();
    const [isAmountHidden, setIsAmountHidden] = useState(false);

    const cashRows = [
        { label: 'Tiền khả dụng', value: formatMoney(asset?.available_cash) },
        { label: 'Tiền chờ khớp', value: formatMoney(asset?.reserved_cash) },
    ];

    return (
        <section className="flex flex-col gap-4 bg-secondary rounded-xl p-3 w-full shrink-0">
            <h2 className="font-body-2-highlight text-primary">{'Tổng quan tài sản'}</h2>
            <div className="flex items-end justify-between gap-4 w-full">
                <div className="flex flex-col gap-2 shrink-0">
                    <span className="font-body-3 text-secondary">{'Tài sản ròng (NAV)'}</span>
                    <div className="flex items-center gap-2">
                        {isLoading ? (
                            <div className="h-8 w-40">
                                <Skeleton height="full" />
                            </div>
                        ) : (
                            <p className="font-heading-3 text-primary whitespace-nowrap">
                                {isAmountHidden ? '******' : formatMoney(data?.net_asset_value)}
                            </p>
                        )}
                        <button
                            type="button"
                            onClick={() => setIsAmountHidden(!isAmountHidden)}
                            className="text-secondary hover:text-primary transition-colors shrink-0"
                            aria-label={isAmountHidden ? 'Hiển thị số tiền' : 'Ẩn số tiền'}
                        >
                            {isAmountHidden ? (
                                <FaEyeSlash size={24} className="text-primary" />
                            ) : (
                                <FaEye size={24} className="text-primary" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
            <dl className="flex w-full flex-col gap-2">
                {cashRows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-2">
                        <dt className="font-body-3 text-secondary">{row.label}</dt>
                        <dd className="font-body-3-highlight text-primary">
                            {isAmountHidden ? '******' : row.value}
                        </dd>
                    </div>
                ))}
            </dl>
        </section>
    );
};
