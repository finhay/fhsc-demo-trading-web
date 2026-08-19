export const BTN_ORDERS_HISTORIES = {
    KEY_ALL: '',
    KEY_SUCCESS: 'SUCCESS',
    KEY_CANCELED: 'CANCELED',
    KEY_PROCESSING: 'PROCESSING',
} as const;

export const BTN_OWNERSHIP_HISTORIES = {
    KEY_ALL: 'PROCESSING_CLOSE,HOLDING,CLOSED',
    KEY_HOLDING: 'PROCESSING_CLOSE,HOLDING',
    KEY_CLOSED: 'CLOSED',
} as const;

export const CASH_HISTORY_TYPES = {
    BUY: 'BUY',
    SELL: 'SELL',
} as const;

export const DEFAULT_ORDER_INFO = {
    estimated_quantity: 0,
    total_amount: 0,
    estimated_profit: 0,
    execute_at: '',
    fee: 0,
    buy_price: 0,
} as const;

export const HAYBOND_OTP_TYPE = 'TRADING_OTP';

export const TERM_BUY_FLOW_STEPS = {
    ORDER: 'order',
    CONFIRM: 'confirm',
    LIST_COMMAND: 'list-command',
    OTP: 'otp',
    SUCCESS: 'success',
    NOT_TRADE: 'not-trade',
} as const;

export const TERM_SELL_FLOW_STEPS = {
    WARNING: 'warning',
    CONFIRM: 'confirm',
    OTP: 'otp',
    SUCCESS: 'success',
} as const;

export const FLEXIBLE_BUY_FLOW_STEPS = {
    ORDER: 'order',
    CONFIRM: 'confirm',
    LIST_COMMAND: 'list-command',
    OTP: 'otp',
    SUCCESS: 'success',
} as const;

export const FLEXIBLE_SELL_FLOW_STEPS = {
    FORM: 'form',
    WARNING: 'warning',
    CONFIRM: 'confirm',
    LIST_COMMAND: 'list-command',
    OTP: 'otp',
    SUCCESS: 'success',
    PROCESS: 'process',
} as const;

export const SELL_ORDER_CONFIRM_STEPS = {
    SUMMARY: 'summary',
    OTP: 'otp',
    SUCCESS: 'success',
} as const;
