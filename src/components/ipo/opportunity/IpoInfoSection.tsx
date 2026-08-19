import type { IpoInfoSectionItem } from '@/types/pages/ipo';

type Props = {
    title: string;
    items: IpoInfoSectionItem[];
};

export const IpoInfoSection = ({ title, items }: Props) => {
    return (
        <>
            <h3 className="font-body-2-highlight text-primary">{title}</h3>
            <dl className="flex flex-col gap-4 w-full">
                {items.map(({ label, value }) => (
                    <div
                        key={label}
                        className="flex items-center justify-between w-full font-body-2"
                    >
                        <dt className="text-secondary">{label}</dt>
                        <dd className="text-primary">{value}</dd>
                    </div>
                ))}
            </dl>
        </>
    );
};
