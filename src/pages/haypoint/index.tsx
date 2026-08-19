'use client';

import { useEffect } from 'react';

import { HaypointBalance } from '@/components/haypoint/HaypointBalance';
import { HaypointCatalog } from '@/components/haypoint/HaypointCatalog';
import { HaypointExchangeFlow } from '@/components/haypoint/HaypointExchangeFlow';
import { HaypointMyVouchers } from '@/components/haypoint/HaypointMyVouchers';
import { HaypointPersonalized } from '@/components/haypoint/HaypointPersonalized';
import { HaypointDetailModal } from '@/components/haypoint/modal/HaypointDetailModal';
import { useTranslate } from '@/hooks/useTranslate';
import { DefaultLayout } from '@/layouts/DefaultLayout';
import { useBrandStore } from '@/stores/haypoint/useBrandStore';
import { useExchangeFlowStore } from '@/stores/haypoint/useExchangeFlowStore';
import { useMyVouchersStore } from '@/stores/haypoint/useMyVouchersStore';
import { useOfficeListStore } from '@/stores/haypoint/useOfficeListStore';
import { usePointStore } from '@/stores/haypoint/usePointStore';

export default function HayPoint() {
    const trans = useTranslate();

    const { fetchPointBalance, resetStore: resetPointStore } = usePointStore();
    const { resetStore: resetOfficeListStore } = useOfficeListStore();
    const { resetStore: resetExchangeFlowStore } = useExchangeFlowStore();
    const {
        fetchRecommendedBrands,
        fetchCategories,
        resetStore: resetBrandStore,
    } = useBrandStore();
    const { fetchOwnedRewards, resetStore: resetMyVouchersStore } = useMyVouchersStore();

    useEffect(() => {
        fetchPointBalance();
        fetchOwnedRewards();
        fetchRecommendedBrands();
        fetchCategories();

        return () => {
            resetPointStore();
            resetOfficeListStore();
            resetExchangeFlowStore();
            resetBrandStore();
            resetMyVouchersStore();
        };
    }, []);

    return (
        <DefaultLayout
            title={trans.haypoint.title}
            metaDescription={trans.haypoint.meta_description}
        >
            <article className="bg-primary flex h-full min-h-0 w-full gap-2">
                <section className="flex w-96 shrink-0 flex-col gap-2">
                    <HaypointBalance />
                    <HaypointMyVouchers />
                </section>
                <section className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
                    <HaypointPersonalized />
                    <HaypointCatalog />
                </section>
            </article>
            <HaypointExchangeFlow />
            <HaypointDetailModal />
        </DefaultLayout>
    );
}
