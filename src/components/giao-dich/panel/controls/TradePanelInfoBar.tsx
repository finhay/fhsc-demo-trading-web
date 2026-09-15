'use client';

type InfoItem = {
    label: string;
    value: string;
};

type Props = {
    infoItems: InfoItem[];
};

export const TradePanelInfoBar = ({ infoItems }: Props) => {
    return (
        <dl className="flex w-full flex-col" aria-label={'Thông tin sức mua bán'}>
            {infoItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-2">
                    <dt className="body-5 text-tertiary">{item.label}</dt>
                    <dd className="body-5-highlight text-primary">{item.value}</dd>
                </div>
            ))}
        </dl>
    );
};
