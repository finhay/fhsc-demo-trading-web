'use client';

import { useState } from 'react';

import { FaChevronDown, FaChevronUp, FaCircle } from 'react-icons/fa6';

import type { HaybondInvestmentHistoryItem } from '@/types/bond-enterprise/packages';

type Props = {
    data: HaybondInvestmentHistoryItem;
};

export const HaybondHistoryRowCoupon = ({ data }: Props) => {
    const [showBody, setShowBody] = useState(false);
    const hasSubOrders = data.subOrders && data.subOrders.length > 0;

    return (
        <div className="flex flex-col gap-1">
            <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-between"
                onClick={() => hasSubOrders && setShowBody(!showBody)}
            >
                <div className="flex items-center gap-2">
                    <span className="font-body-3 text-primary">{data.title}</span>
                    {hasSubOrders &&
                        (showBody ? (
                            <FaChevronUp className="text-secondary" size={12} />
                        ) : (
                            <FaChevronDown className="text-secondary" size={12} />
                        ))}
                </div>
                <span className="font-body-3-highlight text-highlight">{data.displayAmount}</span>
            </button>
            {showBody &&
                hasSubOrders &&
                data.subOrders.map((item, index) => (
                    <div key={index} className="flex items-center justify-between pl-1">
                        <div className="text-secondary flex items-center gap-2">
                            <FaCircle size={6} />
                            <span className="font-body-3">{item.title}</span>
                        </div>
                        <span className="font-body-3 text-secondary">{item.displayAmount}</span>
                    </div>
                ))}
            <div className="flex items-center justify-between">
                <span className="font-caption text-secondary">{data.date}</span>
                <span className="font-caption text-secondary">{data.description}</span>
            </div>
        </div>
    );
};
