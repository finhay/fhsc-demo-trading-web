'use client';

import { IpoOpportunityCarousel } from '@/components/ipo/opportunity/IpoOpportunityCarousel';
import { useTranslate } from '@/hooks/useTranslate';
import { useIpoStore } from '@/stores/ipo/useIpoStore';

export const IpoExpiredSection = () => {
    const trans = useTranslate();
    const { opportunities, isLoadingOpportunities } = useIpoStore();

    const expiredItems = opportunities.filter((item) => item.expired);

    return (
        <IpoOpportunityCarousel
            title={trans.ipo.sections.expired.title}
            items={expiredItems}
            isLoading={isLoadingOpportunities}
            emptyTitle={trans.ipo.sections.expired.empty_title}
            emptyDescription={trans.ipo.sections.expired.empty_description}
            navigationId="expired"
        />
    );
};
