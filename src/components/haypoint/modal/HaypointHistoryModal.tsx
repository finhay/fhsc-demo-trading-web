'use client';

import { UIEvent } from 'react';

import Image from 'next/image';

import { FaMinus, FaPlus } from 'react-icons/fa6';

import { Dialog } from '@/components/common/ui/Dialog';
import { Spinner } from '@/components/common/ui/Spinner';
import { HaypointEmptyState } from '@/components/haypoint/brand/HaypointEmptyState';
import { HAYPOINT_ASSETS, TRANSFER_TYPE } from '@/constants/haypoint';
import { useTranslate } from '@/hooks/useTranslate';
import { usePointStore } from '@/stores/haypoint/usePointStore';
import { formatNumberVN } from '@/utils/format';
import { isNearScrollBottom } from '@/utils/haypoint';

type Props = {
    onClose: () => void;
};

export const HaypointHistoryModal = ({ onClose }: Props) => {
    const trans = useTranslate();
    const {
        historyPointIn,
        historyPointOut,
        nextOffsetIn,
        nextOffsetOut,
        isLoadingMoreIn,
        isLoadingMoreOut,
        loadMorePointInHistories,
        loadMorePointOutHistories,
    } = usePointStore();

    const hasMoreIn = nextOffsetIn !== null;
    const hasMoreOut = nextOffsetOut !== null;

    const historyData = [
        {
            title: trans.haypoint.pts_in,
            items: historyPointIn,
            type: TRANSFER_TYPE.IN,
            isLoadingMore: isLoadingMoreIn,
            hasMore: hasMoreIn,
        },
        {
            title: trans.haypoint.pts_out,
            items: historyPointOut,
            type: TRANSFER_TYPE.OUT,
            isLoadingMore: isLoadingMoreOut,
            hasMore: hasMoreOut,
        },
    ];

    const handleScroll = (e: UIEvent<HTMLUListElement>, type: string) => {
        if (isNearScrollBottom(e)) {
            if (type === TRANSFER_TYPE.IN && hasMoreIn && !isLoadingMoreIn) {
                loadMorePointInHistories();
            } else if (type === TRANSFER_TYPE.OUT && hasMoreOut && !isLoadingMoreOut) {
                loadMorePointOutHistories();
            }
        }
    };

    return (
        <Dialog
            title={trans.haypoint.pts_history}
            maxWidth="max-w-5xl"
            maxHeight="h-[70vh]"
            onClose={onClose}
        >
            {!historyData[0].items?.length && !historyData[1].items?.length ? (
                <HaypointEmptyState title={trans.haypoint.empty_history} className="flex-1" />
            ) : (
                <div className="flex items-stretch gap-3 flex-1 min-h-0">
                    {historyData.map((historyPoint, index) => (
                        <section
                            key={`${historyPoint.title}-${index}`}
                            className="flex flex-col gap-6 flex-1 min-h-0 bg-secondary rounded-xl p-4"
                            aria-labelledby={`history-section-${index}`}
                        >
                            <h3
                                id={`history-section-${index}`}
                                className="font-body-3-highlight text-primary"
                            >
                                {historyPoint.title}
                            </h3>
                            <ul
                                className="flex flex-col gap-6 flex-1 min-h-0 overflow-y-auto list-none p-0 m-0"
                                onScroll={(e) => handleScroll(e, historyPoint.type)}
                            >
                                {(historyPoint.items ?? []).map((item) => (
                                    <li
                                        className="flex items-start justify-between"
                                        key={`${item.source}-${item.created_at}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="bg-tertiary rounded-full p-1"
                                                aria-label={
                                                    item.point > 0
                                                        ? trans.haypoint.pts_up
                                                        : trans.haypoint.pts_down
                                                }
                                            >
                                                {item.point > 0 ? (
                                                    <FaPlus
                                                        size={18}
                                                        className="text-green"
                                                        aria-hidden="true"
                                                    />
                                                ) : (
                                                    <FaMinus
                                                        size={18}
                                                        className="text-red"
                                                        aria-hidden="true"
                                                    />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-body-3-highlight text-primary">
                                                        {formatNumberVN(item.point, {
                                                            decimals: 0,
                                                        })}
                                                    </p>
                                                    <Image
                                                        src={HAYPOINT_ASSETS.POINT_ICON}
                                                        alt={trans.haypoint.pts_icon}
                                                        width={16}
                                                        height={16}
                                                        className="w-4 h-4 aspect-square rounded-xl object-cover"
                                                    />
                                                </div>
                                                <p className="font-body-3 text-secondary">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                        <time className="text-secondary font-body-3">
                                            {item.created_at}
                                        </time>
                                    </li>
                                ))}
                                {historyPoint.isLoadingMore && (
                                    <li>
                                        <Spinner
                                            isLoading={historyPoint.isLoadingMore}
                                            isOverlay={false}
                                        />
                                    </li>
                                )}
                            </ul>
                        </section>
                    ))}
                </div>
            )}
        </Dialog>
    );
};
