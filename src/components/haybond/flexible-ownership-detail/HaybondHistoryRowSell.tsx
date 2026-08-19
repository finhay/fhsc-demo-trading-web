'use client';

import type { HaybondInvestmentHistoryItem } from '@/types/bond-enterprise/packages';

type Props = {
    data: HaybondInvestmentHistoryItem;
};

export const HaybondHistoryRowSell = ({ data }: Props) => {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
                <span className="font-body-3 text-primary">{data.title}</span>
                <span className="font-body-3-highlight text-red">{data.displayAmount}</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="font-caption text-secondary">{data.date}</span>
                <span className="font-caption text-secondary">{data.description}</span>
            </div>
        </div>
    );
};
