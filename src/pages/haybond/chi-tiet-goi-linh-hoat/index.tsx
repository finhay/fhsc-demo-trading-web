'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/router';

import { HaybondFlexibleOwnershipDetail } from '@/components/haybond/flexible-ownership-detail/HaybondFlexibleOwnershipDetail';
import { HaybondFlexibleBuyFlow } from '@/components/haybond/shared/HaybondFlexibleBuyFlow';
import { HaybondFlexibleSellFlow } from '@/components/haybond/shared/HaybondFlexibleSellFlow';
import { ACCOUNT_TYPE } from '@/constants/common';
import { useTranslate } from '@/hooks/useTranslate';
import { DefaultLayout } from '@/layouts/DefaultLayout';
import { useAuthStore } from '@/stores/auth/useAuthStore';

export default function HayBondDynamicOwnedHistoryDetail() {
    const trans = useTranslate();
    const router = useRouter();
    const { profile } = useAuthStore();
    const pageTitle = `${trans.nav_bar.haybond} — ${trans.haybond.owning_detail}`;

    useEffect(() => {
        if (profile && profile.user_type !== ACCOUNT_TYPE.ENTERPRISE) {
            router.push('/');
        }
    }, [profile?.user_type]);

    return (
        <DefaultLayout title={pageTitle} metaDescription={pageTitle}>
            <article className="flex h-full min-h-0 w-full flex-col gap-2 p-3">
                <HaybondFlexibleOwnershipDetail />
            </article>
            <HaybondFlexibleBuyFlow />
            <HaybondFlexibleSellFlow />
        </DefaultLayout>
    );
}
