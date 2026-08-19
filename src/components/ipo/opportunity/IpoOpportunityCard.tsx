'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';

import { FaClock } from 'react-icons/fa6';

import { useTranslate } from '@/hooks/useTranslate';
import { useAuthStore as useProfileStore } from '@/stores/auth/useAuthStore';
import { OpportunityItem } from '@/types/ipo-hunt';
import { formatDate, isNowBefore } from '@/utils/format';
import { pad2 } from '@/utils/format';
import { calculateTimeLeft } from '@/utils/ipo';

type Props = {
    item: OpportunityItem;
    onSubscribe?: () => void;
};

export const IpoOpportunityCard = ({ item, onSubscribe }: Props) => {
    const trans = useTranslate();
    const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(item.end));
    const [isBeforeStart, setIsBeforeStart] = useState(() => isNowBefore(item.start));

    const { profile } = useProfileStore();

    const isButtonDisabled = item.expired || isBeforeStart || profile?.status !== 'COMPLETED';

    useEffect(() => {
        if (item.expired) return;

        const timer = setInterval(() => {
            if (isNowBefore(item.start)) {
                setIsBeforeStart(true);
            } else {
                setIsBeforeStart(false);
                setTimeLeft(calculateTimeLeft(item.end));
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [item.start, item.end, item.expired]);

    return (
        <article className="flex flex-col rounded-xl shrink-0 w-80 bg-primary h-full overflow-hidden">
            <div className="relative w-full flex-1 min-h-0 overflow-hidden">
                <Image
                    src={item.banner_url}
                    alt={item.symbol}
                    fill
                    sizes="320px"
                    className="object-cover"
                />
            </div>
            <div className={`flex flex-col px-3 pt-3 pb-4 ${item.expired ? 'gap-2' : 'gap-4'}`}>
                <div className="flex flex-col gap-1">
                    <h3 className="font-body-1-highlight text-primary">{item.symbol}</h3>
                    <p className="font-caption text-secondary line-clamp-2 h-12">{item.name}</p>
                    {item.expired ? (
                        <p className="font-caption text-tertiary">
                            {trans.ipo.card.expired_on}
                            {formatDate(item.end)}
                        </p>
                    ) : isBeforeStart ? (
                        <p className="font-caption text-tertiary">{trans.ipo.card.not_started}</p>
                    ) : (
                        <div className="flex items-center gap-2">
                            <FaClock className="text-yellow shrink-0" size={16} />
                            <span className="font-caption text-secondary">
                                {trans.ipo.card.expires_in}
                            </span>
                            <span className="font-caption text-secondary">
                                {timeLeft.days}
                                {trans.ipo.card.days}
                                {pad2(timeLeft.hours)}:{pad2(timeLeft.minutes)}:
                                {pad2(timeLeft.seconds)}
                            </span>
                        </div>
                    )}
                </div>
                {!item.expired && (
                    <button
                        onClick={!isButtonDisabled ? onSubscribe : undefined}
                        disabled={isButtonDisabled}
                        className={`${isButtonDisabled ? 'bg-disabled label-disabled' : 'bg-highlight text-quaternary'} font-caption-highlight py-1.5 rounded-full w-full flex items-center justify-center disabled:cursor-not-allowed`}
                    >
                        {trans.ipo.card.hunt_now}
                    </button>
                )}
            </div>
        </article>
    );
};
