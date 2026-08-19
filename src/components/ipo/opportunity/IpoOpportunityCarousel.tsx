'use client';

import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { FreeMode, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { Skeleton } from '@/components/common/ui/Skeleton';
import { IpoEmptyState } from '@/components/ipo/opportunity/IpoEmptyState';
import { IpoOpportunityCard } from '@/components/ipo/opportunity/IpoOpportunityCard';
import { OpportunityItem } from '@/types/ipo-hunt';

type Props = {
    title: string;
    items: OpportunityItem[];
    isLoading: boolean;
    emptyTitle: string;
    emptyDescription: string;
    navigationId: string;
    onSubscribe?: (item: OpportunityItem) => void;
};

export const IpoOpportunityCarousel = ({
    title,
    items,
    isLoading,
    emptyTitle,
    emptyDescription,
    navigationId,
    onSubscribe,
}: Props) => {
    return (
        <section className="bg-secondary rounded-xl p-3 flex flex-col gap-3 flex-1 min-h-0">
            <header>
                <h2 className="font-body-1-highlight text-primary">{title}</h2>
            </header>
            <div className="relative flex-1 min-h-0">
                {isLoading ? (
                    <Skeleton />
                ) : items.length > 0 ? (
                    <>
                        <Swiper
                            slidesPerView="auto"
                            spaceBetween={12}
                            freeMode={true}
                            navigation={{
                                prevEl: `.${navigationId}-prev-btn`,
                                nextEl: `.${navigationId}-next-btn`,
                                disabledClass: 'opacity-0 pointer-events-none',
                            }}
                            modules={[FreeMode, Navigation]}
                            className="w-full h-full"
                        >
                            {items.map((item) => (
                                <SwiperSlide key={item.symbol} className="!w-auto">
                                    <IpoOpportunityCard
                                        item={item}
                                        onSubscribe={
                                            onSubscribe ? () => onSubscribe(item) : undefined
                                        }
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                        <button
                            className={`${navigationId}-prev-btn absolute z-10 -left-3 top-1/2 -translate-y-1/2 p-1.5 bg-tertiary rounded-full flex items-center justify-center transition-opacity`}
                        >
                            <FaChevronLeft className="text-primary" size={16} />
                        </button>
                        <button
                            className={`${navigationId}-next-btn absolute z-10 -right-3 top-1/2 -translate-y-1/2 p-1.5 bg-tertiary rounded-full flex items-center justify-center transition-opacity`}
                        >
                            <FaChevronRight className="text-primary" size={16} />
                        </button>
                    </>
                ) : (
                    <IpoEmptyState title={emptyTitle} description={emptyDescription} />
                )}
            </div>
        </section>
    );
};
