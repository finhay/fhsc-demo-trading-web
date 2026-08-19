'use client';

import { useMemo, useState } from 'react';

import Image from 'next/image';

import { Skeleton } from '@/components/common/ui/Skeleton';
import { HaypointEmptyState } from '@/components/haypoint/brand/HaypointEmptyState';
import { HaypointNameDisplay } from '@/components/haypoint/brand/HaypointNameDisplay';
import { TAB_VOUCHER } from '@/constants/haypoint';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { markOwnedVoucherAsUsed } from '@/services/api/reward';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { useMyVouchersStore } from '@/stores/haypoint/useMyVouchersStore';
import { useOfficeListStore } from '@/stores/haypoint/useOfficeListStore';
import { OwnedRewardItem } from '@/types/reward';
import { isSuccessApi } from '@/utils/common';

export const HaypointMyVouchers = () => {
    const trans = useTranslate();
    const { startLoading, stopLoading } = useLoadingStore();
    const [activeVoucherTab, setActiveVoucherTab] = useState<string>(TAB_VOUCHER[0].value);

    const { vouchers, isLoadingVouchers, openVoucherDetail } = useMyVouchersStore();
    const { fetchOwnedRewardOffices } = useOfficeListStore();

    const filteredVouchers = useMemo(() => {
        const filtered = (vouchers ?? []).filter((item) => item.status === activeVoucherTab);
        return [...filtered].sort((a, b) => {
            const aKey = a.expired_time === 0 ? 0 : 1;
            const bKey = b.expired_time === 0 ? 0 : 1;
            if (aKey !== bKey) return aKey - bKey;
            return a.expired_time - b.expired_time;
        });
    }, [vouchers, activeVoucherTab]);

    const handleVoucherClick = async (voucher: OwnedRewardItem) => {
        startLoading();
        try {
            if (activeVoucherTab === TAB_VOUCHER[0].value) {
                const { error_code, message } = await markOwnedVoucherAsUsed(voucher.id);
                if (!isSuccessApi(error_code)) {
                    toast.error(message);
                    return;
                }
            }
            await fetchOwnedRewardOffices(voucher.reward_id);
            openVoucherDetail(voucher);
        } catch {
        } finally {
            stopLoading();
        }
    };

    return (
        <section
            className="bg-secondary flex flex-1 min-h-0 flex-col gap-6 rounded-xl py-6 px-4"
            aria-labelledby="voucher-list-title"
        >
            <header>
                <h2 id="voucher-list-title" className="font-body-1-highlight text-primary">
                    {trans.haypoint.your_vouchers}
                </h2>
            </header>
            <nav aria-label={trans.haypoint.voucher_filter} className="flex items-center gap-3">
                <div className="flex items-center gap-3" role="tablist">
                    {TAB_VOUCHER.map((tab) => (
                        <button
                            key={`${tab.id}-${tab.name}`}
                            role="tab"
                            className={`rounded-full py-1 px-4 ${
                                activeVoucherTab === tab.value
                                    ? 'text-primary font-body-3-highlight bg-tertiary'
                                    : 'bg-transparent font-body-3 text-secondary'
                            }`}
                            onClick={() => setActiveVoucherTab(tab.value)}
                            aria-selected={activeVoucherTab === tab.value}
                        >
                            {trans.haypoint[tab.transKey as keyof typeof trans.haypoint] ||
                                tab.name}
                        </button>
                    ))}
                </div>
            </nav>
            <ul className="flex flex-col gap-6 list-none p-0 m-0 flex-1 min-h-0 overflow-y-auto">
                {isLoadingVouchers ? (
                    <Skeleton />
                ) : !filteredVouchers.length ? (
                    <HaypointEmptyState title={trans.haypoint.no_gifts_used} className="h-full" />
                ) : (
                    filteredVouchers.map((voucher) => (
                        <li
                            key={`${voucher.id}-${voucher.name}`}
                            className="cursor-pointer"
                            onClick={() => handleVoucherClick(voucher)}
                        >
                            <article className="flex items-stretch gap-3">
                                <figure className="bg-quinary rounded-xl w-1/3 relative flex-shrink-0 m-0">
                                    <Image
                                        src={voucher.image}
                                        alt={voucher.name}
                                        fill
                                        sizes="100vw"
                                        className="rounded-xl object-cover"
                                    />
                                </figure>
                                <div className="w-2/3 flex flex-col gap-1 justify-center">
                                    <div className="flex flex-col gap-2 text-primary">
                                        <HaypointNameDisplay name={voucher?.name || ''} />
                                        <span className="font-caption">
                                            {trans.haypoint.expired_prefix} {voucher.expired_date}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        </li>
                    ))
                )}
            </ul>
        </section>
    );
};
