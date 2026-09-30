'use client';

type Props = {
    orderTypes: string[];
    selectedOrderType: string;
    onSelectOrderType: (orderType: string) => void;
};

export const TradePanelOrderTypes = ({
    orderTypes,
    selectedOrderType,
    onSelectOrderType,
}: Props) => {
    if (orderTypes.length === 0) {
        return (
            <p className="w-full shrink-0 py-1.5 text-center body-5 text-tertiary">
                {'Ngoài giờ giao dịch'}
            </p>
        );
    }

    return (
        <div className="flex w-full items-start gap-2" role="tablist" aria-label={'Loại lệnh'}>
            {orderTypes.map((orderType) => (
                <button
                    key={orderType}
                    type="button"
                    role="tab"
                    aria-selected={selectedOrderType === orderType}
                    onClick={() => onSelectOrderType(orderType)}
                    className={`flex w-20 items-center justify-center rounded-full py-0.5 body-5-highlight transition-colors ${
                        selectedOrderType === orderType
                            ? 'base-highlight text-quaternary'
                            : 'base-tertiary text-secondary'
                    }`}
                >
                    {orderType}
                </button>
            ))}
        </div>
    );
};
