'use client';

import { useState } from 'react';

import { FaEye, FaEyeSlash } from 'react-icons/fa6';

import { Skeleton } from '@/components/common/ui/Skeleton';
import type { AssetSummaryProps } from '@/types/pages/assets';
import { formatNumberVN } from '@/utils/format';

type Props = AssetSummaryProps;

export const AssetOverview = ({ data, isLoading }: Props) => {
    const [isAmountHidden, setIsAmountHidden] = useState(false);

    const displayValue = data?.net_asset_value;
    const formattedNetAssetValue = displayValue
        ? `${formatNumberVN(displayValue, { trimTrailingZeros: true })}đ`
        : '0đ';

    return (
        <section className="flex flex-col gap-4 base-secondary rounded-xl p-3 w-full shrink-0">
            <h2 className="body-3-highlight text-primary">{'Tổng quan tài sản'}</h2>
            <div className="flex items-end justify-between gap-4 w-full">
                <div className="flex flex-col gap-2 shrink-0">
                    <span className="body-4 text-secondary">{'Tài sản ròng (NAV)'}</span>
                    <div className="flex items-center gap-2">
                        {isLoading ? (
                            <div className="h-8 w-40">
                                <Skeleton height="full" />
                            </div>
                        ) : (
                            <p className="heading-3 text-primary whitespace-nowrap">
                                {isAmountHidden ? '******' : formattedNetAssetValue}
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
        </section>
    );
};
