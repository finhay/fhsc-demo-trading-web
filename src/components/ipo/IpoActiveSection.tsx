'use client';

import { IpoOpportunityCarousel } from '@/components/ipo/opportunity/IpoOpportunityCarousel';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { useIpoStore } from '@/stores/ipo/useIpoStore';
import { useSubscriptionStore } from '@/stores/ipo/useSubscriptionStore';
import { OpportunityItem } from '@/types/ipo-hunt';

export const IpoActiveSection = () => {
    const trans = useTranslate();
    const { startLoading, stopLoading } = useLoadingStore();
    const { opportunities, isLoadingOpportunities, checkEkycStatus } = useIpoStore();
    const { openFlow } = useSubscriptionStore();

    const activeItems = opportunities.filter((item) => !item.expired);

    const handleSubscribe = async (item: OpportunityItem) => {
        startLoading();
        try {
            const canProceed = await checkEkycStatus(item);
            if (canProceed) {
                await openFlow(item);
            } else {
                toast.error(trans.ipo.messages.update_identity_required);
            }
        } finally {
            stopLoading();
        }
    };

    return (
        <IpoOpportunityCarousel
            title={trans.ipo.sections.active.title}
            items={activeItems}
            isLoading={isLoadingOpportunities}
            emptyTitle={trans.ipo.sections.active.empty_title}
            emptyDescription={trans.ipo.sections.active.empty_description}
            navigationId="active"
            onSubscribe={handleSubscribe}
        />
    );
};
