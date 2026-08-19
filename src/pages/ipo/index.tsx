'use client';

import { useEffect } from 'react';

import { IpoActiveSection } from '@/components/ipo/IpoActiveSection';
import { IpoExpiredSection } from '@/components/ipo/IpoExpiredSection';
import { IpoRegisteredList } from '@/components/ipo/IpoRegisteredList';
import { IpoSubscriptionFlow } from '@/components/ipo/IpoSubscriptionFlow';
import { IpoOnboarding } from '@/components/ipo/modal/IpoOnboarding';
import { useTranslate } from '@/hooks/useTranslate';
import { DefaultLayout } from '@/layouts/DefaultLayout';
import { useIpoStore } from '@/stores/ipo/useIpoStore';
import { useSubscriptionStore } from '@/stores/ipo/useSubscriptionStore';

export default function Ipo() {
    const trans = useTranslate();
    const { loadPageData, resetStore } = useIpoStore();
    const { resetStore: resetSubscriptionStore } = useSubscriptionStore();

    useEffect(() => {
        loadPageData();

        return () => {
            resetStore();
            resetSubscriptionStore();
        };
    }, []);

    return (
        <DefaultLayout title={trans.ipo.title} metaDescription={trans.ipo.meta_description}>
            <article className="bg-primary flex flex-col gap-2 w-full h-full">
                <h1 className="font-heading-4 text-primary shrink-0">{trans.ipo.title}</h1>
                <div className="flex gap-2 flex-1 min-h-0">
                    <IpoRegisteredList />
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                        <IpoActiveSection />
                        <IpoExpiredSection />
                    </div>
                </div>
            </article>
            <IpoSubscriptionFlow />
            <IpoOnboarding />
        </DefaultLayout>
    );
}
