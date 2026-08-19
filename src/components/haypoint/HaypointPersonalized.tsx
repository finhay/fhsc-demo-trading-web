'use client';

import { Skeleton } from '@/components/common/ui/Skeleton';
import { HaypointCard } from '@/components/haypoint/brand/HaypointCard';
import { useTranslate } from '@/hooks/useTranslate';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { useBrandStore } from '@/stores/haypoint/useBrandStore';
import { useExchangeFlowStore } from '@/stores/haypoint/useExchangeFlowStore';

export const HaypointPersonalized = () => {
    const trans = useTranslate();
    const { startLoading, stopLoading } = useLoadingStore();
    const { recommendBrands, isLoadingRecommendBrands } = useBrandStore();
    const { openExchangeFlow } = useExchangeFlowStore();

    const handleOpenExchangeFlow = async (brandId: string) => {
        startLoading();
        try {
            await openExchangeFlow(brandId);
        } finally {
            stopLoading();
        }
    };

    return (
        <section
            className="bg-secondary flex flex-col gap-6 rounded-xl py-6 px-4"
            aria-labelledby="recommend-brand-title"
        >
            <h2 id="recommend-brand-title" className="font-body-1-highlight text-primary">
                {trans.haypoint.for_you}
            </h2>
            <ul
                className={`m-0 grid w-full list-none gap-6 p-0 ${isLoadingRecommendBrands ? 'grid-cols-1' : 'grid-cols-5'}`}
            >
                {isLoadingRecommendBrands ? (
                    <Skeleton />
                ) : (
                    (recommendBrands ?? []).map((brand) => (
                        <li key={`${brand.id}-${brand.name}`}>
                            <HaypointCard brand={brand} onClick={handleOpenExchangeFlow} />
                        </li>
                    ))
                )}
            </ul>
        </section>
    );
};
