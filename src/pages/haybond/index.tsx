'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/router';

import { Spinner } from '@/components/common/ui/Spinner';
import { HaybondOrdersHistories } from '@/components/haybond/home/HaybondOrdersHistories';
import { HaybondOwnershipHistories } from '@/components/haybond/home/HaybondOwnershipHistories';
import { HaybondPackages } from '@/components/haybond/home/HaybondPackages';
import { HaybondSellOrderConfirmationList } from '@/components/haybond/home/HaybondSellOrderConfirmationList';
import { HaybondFlexibleBuyFlow } from '@/components/haybond/shared/HaybondFlexibleBuyFlow';
import { HaybondFlexibleSellFlow } from '@/components/haybond/shared/HaybondFlexibleSellFlow';
import { HaybondTermBuyFlow } from '@/components/haybond/shared/HaybondTermBuyFlow';
import { HaybondTermSellFlow } from '@/components/haybond/shared/HaybondTermSellFlow';
import { ACCOUNT_TYPE } from '@/constants/common';
import { useTranslate } from '@/hooks/useTranslate';
import { DefaultLayout } from '@/layouts/DefaultLayout';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useHaybondFlexStore } from '@/stores/haybond/useHaybondFlexStore';
import { useHaybondStore } from '@/stores/haybond/useHaybondStore';

export default function HayBond() {
    const trans = useTranslate();
    const router = useRouter();
    const { profile } = useAuthStore();
    const { loadHome, resetStore, isOverlayLoading } = useHaybondStore();
    const { isOverlayLoading: isFlexOverlayLoading } = useHaybondFlexStore();

    useEffect(() => {
        if (profile?.user_type === ACCOUNT_TYPE.INDIVIDUAL) {
            router.push('/');
            return;
        }
        loadHome();
        return () => {
            resetStore();
        };
    }, [profile?.user_type]);

    const pageTitle = `${trans.nav_bar.haybond} — ${trans.haybond.packages_for_you}`;

    return (
        <DefaultLayout title={pageTitle} metaDescription={pageTitle}>
            <Spinner isLoading={isOverlayLoading || isFlexOverlayLoading} />
            <article className="flex h-full min-h-0 w-full gap-2 p-3">
                <aside className="flex w-80 shrink-0 flex-col gap-2 min-h-0">
                    <HaybondOwnershipHistories />
                    <HaybondOrdersHistories />
                </aside>
                <HaybondPackages />
            </article>
            <HaybondSellOrderConfirmationList />
            <HaybondTermBuyFlow />
            <HaybondTermSellFlow />
            <HaybondFlexibleBuyFlow />
            <HaybondFlexibleSellFlow />
        </DefaultLayout>
    );
}
