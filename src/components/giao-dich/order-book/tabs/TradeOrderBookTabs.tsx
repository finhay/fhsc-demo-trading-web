'use client';

import { ORDER_MODES, ORDER_MODE_KEY } from '@/constants/trading';
import { useTranslate } from '@/hooks/useTranslate';

type Props = {
    activeOrderTab: string;
    onTabChange: (key: string) => void;
};

export const TradeOrderBookTabs = ({ activeOrderTab, onTabChange }: Props) => {
    const trans = useTranslate();

    const getTabLabel = (key: string) => {
        if (key === ORDER_MODE_KEY.NORMAL) return trans.trading.order_book.tab_normal;
        if (key === ORDER_MODE_KEY.TAB_247) return trans.trading.order_book.tab_247;
        if (key === ORDER_MODE_KEY.TWAP_LO) return trans.trading.order_book.tab_twap_lo;
        return trans.trading.order_book.tab_iceberg;
    };

    return (
        <nav
            className="flex flex-1 gap-2 items-center"
            role="tablist"
            aria-label={trans.trading.order_book.tab_aria}
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
