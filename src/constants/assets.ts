import type { OrderStatusLabelKey } from '@/types/pages/assets';
import { UserRightEventType, UserRightRegisterStatus } from '@/types/trade/user-rights';

export const GROWTH_TIME_PERIODS = [
    { id: 'd7', value: 7 },
    { id: 'd30', value: 30 },
    { id: 'd90', value: 90 },
    { id: 'd180', value: 180 },
    { id: 'd365', value: 365 },
] as const;

export const ALLOCATION_COLORS = {
    stock: '#b354e3',
    fund: '#2994ff',
    bond: '#e98e00',
    childSavings: '#eb4337',
    money: '#3ac45c',
    hay0: '#e9cb36',
} as const;

export const PORTFOLIO_TREEMAP_COLORS = {
    up: '#3ac45c',
    down: '#eb4337',
    border: '#171719',
} as const;

export const TRADE_HISTORY_RANGE_DAYS = 30;

export const RIGHT_EVENT_TYPES = {
    STOCK_RIGHT: 'STOCK_RIGHT',
    STOCK_DIVIDEND: 'STOCK_DIVIDEND',
    CASH_DIVIDEND: 'CASH_DIVIDEND',
} as const satisfies Record<string, UserRightEventType>;

export const ORDER_STATUS_MAP: Record<
    string,
    { labelKey: OrderStatusLabelKey; type: 'success' | 'error' | 'warning' }
> = {
    SENT: { labelKey: 'sent', type: 'success' },
    MATCHED_ALL: { labelKey: 'matched_all', type: 'success' },
    COMPLETED: { labelKey: 'completed', type: 'success' },
    MATCHED: { labelKey: 'matched', type: 'success' },
    WAITING_TO_SEND: { labelKey: 'waiting_to_send', type: 'success' },
    SENDING: { labelKey: 'sending', type: 'success' },
    FIXED: { labelKey: 'fixed', type: 'success' },
    FIXING: { labelKey: 'fixing', type: 'warning' },
    CANCELLED: { labelKey: 'cancelled', type: 'error' },
    EXPIRED: { labelKey: 'expired', type: 'error' },
    REJECTING: { labelKey: 'rejecting', type: 'error' },
};

export const TRADE_HISTORY_TABS: { key: string; labelKey: string }[] = [
    { key: 'order', labelKey: 'tab_order' },
    { key: 'cash_advance', labelKey: 'tab_cash_advance' },
    { key: 'loans', labelKey: 'tab_loans' },
];

export const ASSET_ACTION_KEYS = {
    DEPOSIT: 'deposit',
    TRANSFER: 'transfer',
    WITHDRAW: 'withdraw',
} as const;

export const ASSET_ACTION_STYLES = {
    [ASSET_ACTION_KEYS.DEPOSIT]: 'bg-highlight text-quaternary',
    [ASSET_ACTION_KEYS.TRANSFER]: 'bg-tertiary text-highlight',
    [ASSET_ACTION_KEYS.WITHDRAW]: 'bg-tertiary text-highlight',
} as const;

export const TRADE_HISTORY_TAB_KEYS = {
    ORDER: 'order',
    CASH_ADVANCE: 'cash_advance',
    LOANS: 'loans',
} as const;

export const MIN_WITHDRAW_AMOUNT = 50_000;

export const ASSET_WITHDRAW_MODAL_STEPS = {
    amount: 1,
    confirm: 2,
    otp: 3,
} as const;

export const ASSET_TRANSFER_MODAL_STEPS = {
    amount: 1,
    confirm: 2,
} as const;

export const RIGHT_STATUS_COLORS: Record<UserRightRegisterStatus, string> = {
    UNREGISTER: 'text-yellow',
    REGISTERED: 'text-blue',
    EXPIRED: 'text-secondary',
    RECEIVED: 'text-green',
};
