'use client';

import Image from 'next/image';

import { useTranslate } from '@/hooks/useTranslate';

type Props = {
    title: string;
    className?: string;
    imageSize?: number;
};

export const HaypointEmptyState = ({ title, className = '', imageSize = 115 }: Props) => {
    const trans = useTranslate();

    return (
        <div
            className={`flex flex-col items-center justify-center gap-6 py-6 bg-tertiary rounded-xl ${className}`}
        >
            <h3 className="font-body-1-highlight text-primary">{title}</h3>
            <Image
                src="https://cdn1.finhay.com.vn/vnsc-prod/1770007269493.3816-flaticon_3656900%201.png"
                alt={title}
                width={imageSize}
                height={imageSize}
                className="h-auto aspect-square object-cover"
            />
            <p
                className="text-center font-body-1 text-secondary"
                dangerouslySetInnerHTML={{
                    __html: trans.haypoint.pts_earn_tagline,
                }}
            />
        </div>
    );
};
