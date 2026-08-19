'use client';

import Image from 'next/image';

import { HaypointStore } from '@/components/haypoint/HaypointStore';
import { HaypointNameDisplay } from '@/components/haypoint/brand/HaypointNameDisplay';
import { VOUCHER_GRADIENT } from '@/constants/haypoint';
import { useTranslate } from '@/hooks/useTranslate';
import { markOwnedVoucherAsUsed } from '@/services/api/reward';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { useExchangeFlowStore } from '@/stores/haypoint/useExchangeFlowStore';
import { useMyVouchersStore } from '@/stores/haypoint/useMyVouchersStore';
import { useOfficeListStore } from '@/stores/haypoint/useOfficeListStore';
import { usePointStore } from '@/stores/haypoint/usePointStore';

export const HaypointSuccessModal = () => {
    const trans = useTranslate();
    const { startLoading, stopLoading } = useLoadingStore();
    const { claimedReward, selectedReward, resetStore } = useExchangeFlowStore();
    const { offices, isLoadingMore, hasMore, searchOffices, loadMoreOffices } =
        useOfficeListStore();
    const { openVoucherDetail, fetchOwnedRewards } = useMyVouchersStore();
    const { fetchPointBalance } = usePointStore();

    const handleSearchOffices = async (keyword: string) => {
        startLoading();
        try {
            await searchOffices(keyword);
        } finally {
            stopLoading();
        }
    };

    const handleRefreshData = () => {
        fetchPointBalance();
        fetchOwnedRewards();
    };

    const handleClose = () => {
        resetStore();
        handleRefreshData();
    };

    const handleUseNow = async () => {
        if (!claimedReward) return;
        await markOwnedVoucherAsUsed(claimedReward.id);
        resetStore();
        openVoucherDetail(claimedReward);
        handleRefreshData();
    };

    if (!claimedReward || !selectedReward) return null;

    return (
        <div className="flex gap-3 items-stretch w-full flex-1 min-h-0">
            <section
                className="bg-secondary flex flex-col gap-8 rounded-xl p-3 flex-1 overflow-hidden min-h-0"
                aria-labelledby="stores-title"
            >
                <HaypointStore
                    offices={offices}
                    onSearchOffice={handleSearchOffices}
                    onLoadMore={loadMoreOffices}
                    isLoadingMore={isLoadingMore}
                    hasMore={hasMore}
                    inputId="store-search-success"
                />
            </section>
            <aside
                className="bg-secondary flex flex-col gap-6 rounded-xl p-3 flex-1"
                aria-labelledby="voucher-info-title"
            >
                <article
                    className="rounded-xl p-6 flex flex-col gap-6"
                    style={{
                        background: VOUCHER_GRADIENT.SOLID,
                    }}
                >
                    <header className="flex items-start gap-4">
                        <div className="bg-white rounded-full w-16 h-16 flex-shrink-0 overflow-hidden flex items-center justify-center">
                            <Image
                                src={claimedReward.brand.image}
                                alt={`Logo ${claimedReward.name}`}
                                width={48}
                                height={48}
                                className="object-contain rounded-full"
                            />
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                            <div className="text-primary flex flex-col gap-1">
                                <HaypointNameDisplay name={claimedReward?.name || ''} />
                            </div>
                        </div>
                    </header>
                    <dl className="flex items-center justify-between">
                        <dt className="font-body-3 text-white">{trans.haypoint.expires_label}</dt>
                        <dd className="font-body-3-highlight text-white">
                            {claimedReward.expired_date}
                        </dd>
                    </dl>
                </article>
                <section className="flex flex-col gap-3 flex-1 min-h-0">
                    <h3 className="font-body-3-highlight text-primary">
                        {trans.haypoint.terms_apply}
                    </h3>
                    <div
                        className="font-body-3 text-secondary leading-relaxed overflow-y-auto max-h-64"
                        dangerouslySetInnerHTML={{ __html: selectedReward.note || '' }}
                    />
                </section>
                <nav className="flex gap-3 mt-auto" aria-label={trans.haypoint.voucher_actions}>
                    <button
                        onClick={handleClose}
                        className="flex-1 py-3 rounded-full font-body-3-highlight bg-secondary text-highlight hover:opacity-90 transition-all"
                        type="button"
                    >
                        {trans.haypoint.home_btn}
                    </button>
                    <button
                        onClick={handleUseNow}
                        className="flex-1 py-3 rounded-full font-body-3-highlight bg-highlight text-quaternary hover:opacity-90 transition-all"
                        type="button"
                    >
                        {trans.haypoint.use_now}
                    </button>
                </nav>
            </aside>
        </div>
    );
};
