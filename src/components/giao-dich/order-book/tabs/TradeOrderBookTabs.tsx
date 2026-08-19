'use client';

import { ORDER_MODES, ORDER_MODE_KEY } from '@/constants/trading';

type Props = {
    activeOrderTab: string;
    onTabChange: (key: string) => void;
};

export const TradeOrderBookTabs = ({ activeOrderTab, onTabChange }: Props) => {
    const getTabLabel = (key: string) => {
        if (key === ORDER_MODE_KEY.NORMAL) return 'Lệnh thường';
        if (key === ORDER_MODE_KEY.TAB_247) return 'Lệnh 24/7';
        if (key === ORDER_MODE_KEY.TWAP_LO) return 'Lệnh CD LO';
        return 'Lệnh Iceberg';
    };

    return (
        <nav
            className="flex flex-1 gap-2 items-center"
            role="tablist"
            aria-label={'Chọn loại lệnh'}
        >
            {ORDER_MODES.map(({ key }) => (
                <button
                    key={key}
                    role="tab"
                    aria-selected={activeOrderTab === key}
                    aria-controls={`orderbook-${key}-panel`}
                    onClick={() => onTabChange(key)}
                    className={`flex items-center justify-center px-4 py-1 rounded-full font-caption w-fit transition-colors ${
                        activeOrderTab === key ? 'bg-tertiary text-primary' : 'text-secondary'
                    }`}
                >
                    {getTabLabel(key)}
                </button>
            ))}
        </nav>
    );
};
