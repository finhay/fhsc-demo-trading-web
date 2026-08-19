'use client';

import { useTranslate } from '@/hooks/useTranslate';

type InfoItem = {
    label: string;
    value: string;
};

type Props = {
    infoItems: InfoItem[];
};

export const TradePanelInfoBar = ({ infoItems }: Props) => {
    const trans = useTranslate();

    return (
        <dl className="flex w-full flex-col" aria-label={trans.trading.panel.margin_aria}>
            {infoItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-2">
                    <dt className="font-caption text-tertiary">{item.label}</dt>
                    <dd className="font-caption-highlight text-primary">{item.value}</dd>
                </div>
            ))}
        </dl>
    );
};
