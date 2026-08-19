'use client';

import { useState } from 'react';

import Image from 'next/image';

import { FaChevronRight } from 'react-icons/fa6';

import { Skeleton } from '@/components/common/ui/Skeleton';
import { HaypointHistoryModal } from '@/components/haypoint/modal/HaypointHistoryModal';
import { HAYPOINT_ASSETS } from '@/constants/haypoint';
import { useTranslate } from '@/hooks/useTranslate';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { usePointStore } from '@/stores/haypoint/usePointStore';
import { formatNumberVN } from '@/utils/format';

export const HaypointBalance = () => {
    const trans = useTranslate();

    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    const { startLoading, stopLoading } = useLoadingStore();
    const { points, isLoadingPoints, fetchPointHistories } = usePointStore();

    const handleOpenHistoryModal = async () => {
        startLoading();
        try {
            await fetchPointHistories();
            setIsHistoryModalOpen(true);
        } finally {
            stopLoading();
        }
    };

    return (
        <section
            className="bg-secondary flex flex-col gap-6 rounded-xl py-6 px-4"
            aria-labelledby="user-points-title"
        >
            <header className="flex items-center justify-between">
                <h2 id="user-points-title" className="font-body-2 text-secondary">
                    {trans.haypoint.you_have}
                </h2>
                <button
                    onClick={handleOpenHistoryModal}
                    className="flex items-center gap-2 cursor-pointer"
                    aria-label={trans.haypoint.view_pts_history}
                >
                    <span className="font-body-3 text-primary">{trans.haypoint.pts_history}</span>
                    <FaChevronRight size={18} className="text-primary" aria-hidden="true" />
                </button>
            </header>
            <article className="flex items-center gap-2">
                {isLoadingPoints ? (
                    <Skeleton height={9} />
                ) : (
                    <>
                        <p className="font-heading-3 text-primary">
                            {formatNumberVN(points, { decimals: 0 })}
                        </p>
                        <Image
                            src={HAYPOINT_ASSETS.POINT_ICON}
                            alt={trans.haypoint.pts_reward_icon}
                            width={24}
                            height={24}
                        />
                    </>
                )}
            </article>
            {isHistoryModalOpen && (
                <HaypointHistoryModal onClose={() => setIsHistoryModalOpen(false)} />
            )}
        </section>
    );
};
