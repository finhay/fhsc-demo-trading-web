import Image from 'next/image';

import { useTranslate } from '@/hooks/useTranslate';

export const MarketOutOfSession = () => {
    const trans = useTranslate();

    return (
        <figure className="flex flex-col items-center justify-center h-full m-0 p-0">
            <div className="flex flex-col items-center justify-center gap-4">
                <Image
                    src="https://cdn1.finhay.com.vn/vnsc-prod/1765770346118.3132-Data.png"
                    alt="empty"
                    width={120}
                    height={120}
                    loading="eager"
                    className="w-30 h-30 object-contain"
                />
                <figcaption className="font-body-3 text-secondary text-center">
                    {trans.market.out_of_session.empty}
                </figcaption>
            </div>
        </figure>
    );
};
