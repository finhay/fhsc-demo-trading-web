'use client';

import { useEffect, useState } from 'react';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { fetchSubAccountSellOrdersPnl } from '@/services/api/trade/portfolio';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import type { SellOrderPnlItem } from '@/types/trade/portfolio';
import { isSuccessApi } from '@/utils/common';
import { formatDateOrDash, formatNumberVN, formatPercentVN } from '@/utils/format';

export const AssetPnl = () => {
    const { activeSubAccount } = useAuthStore();
    const [items, setItems] = useState<SellOrderPnlItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = async () => {
        if (!activeSubAccount?.sub_account_id) {
            setItems([]);
            return;
        }
        setIsLoading(true);
        try {
            const { data, error_code } = await fetchSubAccountSellOrdersPnl(
                activeSubAccount.sub_account_id,
                1,
            );
            if (isSuccessApi(error_code)) {
                setItems(data?.data || []);
            }
        } catch {
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeSubAccount?.sub_account_id]);

    return (
        <section className="flex h-full w-full min-h-0 shrink-0 flex-col gap-3 overflow-hidden rounded-xl bg-secondary p-3">
            <h2 className="shrink-0 font-body-2-highlight text-primary">{'Lãi/lỗ đã chốt'}</h2>
            <div className="min-h-0 flex-1">
                {isLoading ? (
                    <div className="h-full w-full">
                        <Skeleton />
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex h-full w-full items-center justify-center">
                        <EmptyState />
                    </div>
                ) : (
                    <div className="scrollbar h-full overflow-y-auto">
                        <ul className="m-0 flex list-none flex-col gap-3 p-0">
                            {items.map((item) => {
                                const isProfit = item.percentPNL >= 0;
                                const sign = isProfit ? '+' : '-';
                                const pnlColor = isProfit ? 'text-green' : 'text-red';
                                const typeLabel = isProfit ? 'Chốt lời' : 'Cắt lỗ';

                                return (
                                    <li
                                        key={`${item.orderId}-${item.sellingDate}`}
                                        className="flex flex-col gap-3 rounded-xl border border-quaternary p-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="shrink-0 font-body-3 text-primary">
                                                {typeLabel}
                                            </span>
                                            <span className="min-w-0 flex-1 truncate font-body-3-highlight text-primary">
                                                {item.symbol}
                                            </span>
                                            <span className="shrink-0 font-body-3 text-secondary">
                                                {formatDateOrDash(item.sellingDate)}
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`flex min-w-0 flex-1 flex-col gap-1 ${pnlColor}`}
                                            >
                                                <p className="truncate font-body-3">
                                                    {sign}{' '}
                                                    {formatPercentVN(Math.abs(item.percentPNL))}
                                                </p>
                                                <p className="truncate font-body-3">
                                                    {sign}{' '}
                                                    {formatNumberVN(Math.abs(item.value), {
                                                        trimTrailingZeros: true,
                                                    })}{' '}
                                                    {'đ'}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 flex-col items-end gap-1 font-body-3 text-secondary">
                                                <p>
                                                    {'Giá bán'}:{' '}
                                                    {formatNumberVN(item.matchedPrice / 1000, {
                                                        decimals: 2,
                                                        trimTrailingZeros: true,
                                                    })}
                                                </p>
                                                <p>
                                                    {'Giá mua'}:{' '}
                                                    {formatNumberVN(item.costPrice / 1000, {
                                                        decimals: 2,
                                                        trimTrailingZeros: true,
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
        </section>
    );
};
