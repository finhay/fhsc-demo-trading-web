'use client';

import { MARKET_INDEX_LIST } from '@/constants/market';

type Props = {
    selectedIndex: string;
    onSelect: (index: string) => void;
};

export const MarketIndexTab = ({ selectedIndex, onSelect }: Props) => {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {MARKET_INDEX_LIST.map((tab) => {
                const isActive = selectedIndex === tab;

                return (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => onSelect(tab)}
                        className={`flex items-center justify-center rounded-full px-3 py-1 whitespace-nowrap ${
                            isActive
                                ? 'bg-tertiary border border-quaternary font-body-3-highlight text-primary'
                                : 'font-body-3 text-secondary'
                        }`}
                    >
                        {tab}
                    </button>
                );
            })}
        </div>
    );
};
