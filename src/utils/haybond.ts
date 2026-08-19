import { toast } from '@/hooks/lib/useToast';

export const setNamePackage = (
    name: string | null | undefined,
    trans: {
        haybond: {
            early_sell: string;
            sell: string;
            buy: string;
        };
    },
    orderSide: string,
    sellEarly = false,
    savingBookType?: string,
) => {
    const safeName = name ?? '';
    if (orderSide === 'SELL') {
        const label =
            sellEarly && savingBookType !== 'FLEXIBLE'
                ? trans.haybond.early_sell
                : trans.haybond.sell;
        return `${label} ${safeName.toLowerCase()}`;
    }
    return `${trans.haybond.buy} ${safeName.toLowerCase()}`;
};

type TransMessages = Record<string, string>;

export const getErrorMessageHaybondEstimate = (
    errorCode: string,
    trans: { haybond: { response_message: TransMessages } },
    messageResponse?: string,
) => {
    const map: Record<string, string> = {
        PackageNotFound: trans.haybond.response_message.package_not_found,
        AmountBuyInvalid: trans.haybond.response_message.amount_below_price,
        ActorNotFound: trans.haybond.response_message.invalid_account_type,
    };
    const message = map[errorCode] ?? messageResponse ?? '';
    if (message) toast.error(message);
};

export const getErrorMessageHaybondBuying = (
    errorCode: string,
    trans: { haybond: { buying_message: TransMessages } },
    messageApi: string,
) => {
    toast.error(trans.haybond.buying_message[errorCode] ?? messageApi);
};

export const getErrorMessageHaybondSellPreview = (
    _errorCode: string,
    _trans: unknown,
    messageParam: string,
) => {
    if (messageParam) toast.error(messageParam);
};

export const getErrorMessageHaybondPreview = (
    errorCode: string,
    trans: { haybond: { response_message: TransMessages } },
    messageResponse?: string,
) => {
    const keys = [
        'NotCompleteOpenAccount',
        'NotEnoughMoney',
        'PackageNotFound',
        'ActorNotFound',
        'PackageNotForUser',
        'QuantityBuyInvalid',
        'AmountBuyInvalid',
        'BondNotPublic',
        'BondExpired',
        'MinQuantityException',
        'BondAvailableQuantityInvalid',
        'PackageOutOfStockToday',
        'NotSignedContract',
        'BondVendorNotFound',
    ];
    const message = keys.includes(errorCode)
        ? trans.haybond.response_message[errorCode]
        : (messageResponse ?? '');
    if (message) toast.error(message);
};
