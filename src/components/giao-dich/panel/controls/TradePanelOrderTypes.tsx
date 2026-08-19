'use client';

import { ORDER_MODE_KEY, ORDER_TYPE_KEY } from '@/constants/trading';

type Props = {
    orderMode: string;
    isIceberg: boolean;
    isTwapLo: boolean;
    orderTypes: string[];
    selectedOrderType: string;
    onSelectOrderType: (orderType: string) => void;
};

export const TradePanelOrderTypes = ({
    orderMode,
    isIceberg,
    isTwapLo,
    orderTypes,
    selectedOrderType,
    onSelectOrderType,
}: Props) => {
    const isLoOnlyMode = isIceberg || isTwapLo;

    if (orderMode !== ORDER_MODE_KEY.NORMAL && !isLoOnlyMode) {
        return null;
    }

    return (
        <div className="flex gap-2 items-start w-full" role="tablist" aria-label={'Chọn loại lệnh'}>
            {(isLoOnlyMode ? [ORDER_TYPE_KEY.LO] : orderTypes).map((orderType) => (
                <button
                    key={orderType}
                    role="tab"
                    aria-selected={selectedOrderType === orderType}
                    onClick={() => {
                        if (isLoOnlyMode) return;
                        onSelectOrderType(orderType);
                    }}
                    className={`w-20 flex items-center justify-center py-0.5 rounded-full font-caption-highlight transition-colors ${
                        selectedOrderType === orderType
                            ? 'bg-highlight text-quaternary'
                            : 'bg-tertiary text-secondary'
                    }`}
                >
                    {orderType}
                </button>
            ))}
        </div>
    );
};
