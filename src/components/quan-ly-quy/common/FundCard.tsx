import type { ReactNode } from 'react';

type Props = {
    label: string;
    value: ReactNode;
    sub?: ReactNode;
    valueClassName?: string;
};

export const FundCard = ({ label, value, sub, valueClassName }: Props) => (
    <article className="flex flex-col gap-1 rounded-xl bg-secondary p-3">
        <dl className="contents">
            <dt className="font-caption-highlight uppercase text-secondary">{label}</dt>
            <dd className={`font-heading-4 ${valueClassName ?? 'text-primary'}`}>{value}</dd>
            {sub && <dd className="font-caption text-secondary">{sub}</dd>}
        </dl>
    </article>
);
