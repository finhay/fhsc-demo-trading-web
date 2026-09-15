import type { OrderStatusLabelKey } from '@/types/pages/assets';
import type { PaperRightEventType } from '@/types/paper-trading/rights';

export const GROWTH_TIME_PERIODS = [
    { id: 'd7', value: 7 },
    { id: 'd30', value: 30 },
    { id: 'd90', value: 90 },
    { id: 'd180', value: 180 },
    { id: 'd365', value: 365 },
] as const;

export const RIGHT_EVENT_TYPE_LABELS: Record<PaperRightEventType, string> = {
    CASH_DIVIDEND: 'Cổ tức bằng tiền',
    STOCK_DIVIDEND: 'Cổ tức bằng cổ phiếu',
    BONUS_SHARE: 'Cổ phiếu thưởng',
    RIGHTS_OFFERING: 'Quyền mua',
};

/** Màu status theo nhãn BE (contract §4 / Figma). */
export const RIGHT_STATUS_COLOR_BY_LABEL: Record<string, string> = {
    'Chờ về': 'text-orange',
    'Đã đăng ký': 'text-orange',
    'Đã nhận': 'text-highlight',
    'Không đủ tiền đăng ký': 'text-red',
    'Được hưởng quyền': 'text-secondary',
};

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
    [ASSET_ACTION_KEYS.DEPOSIT]: 'base-highlight text-quaternary',
    [ASSET_ACTION_KEYS.TRANSFER]: 'base-tertiary text-highlight',
    [ASSET_ACTION_KEYS.WITHDRAW]: 'base-tertiary text-highlight',
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

export const ASSETS_TRADE_HISTORY: Record<string, string> = {
    heading: 'Lịch sử giao dịch',
    nav_aria: 'Lịch sử giao dịch',
    no_data: 'Không có dữ liệu',
    tab_order: 'Mua/bán',
    tab_cash_advance: 'Ứng trước',
    tab_loans: 'Vay',
    col_symbol: 'Mã',
    col_order_id: 'Số hiệu lệnh',
    col_date: 'Ngày',
    col_trade_type: 'Loại giao dịch',
    col_order_type: 'Loại lệnh',
    col_match_price: 'Giá khớp',
    col_match_vol: 'KL khớp/đặt',
    col_tax: 'Thuế',
    col_fee: 'Phí',
    col_status: 'Trạng thái',
    col_sell_date: 'Ngày bán',
    col_advance_date: 'Ngày ứng',
    col_payment_date: 'Ngày thanh toán',
    col_advance_days: 'Số ngày ứng',
    col_sell_amount: 'Tiền bán',
    col_advance_amount: 'Tiền ứng',
    col_advance_fee: 'Phí ứng',
    col_advance_received: 'Tiền ứng thực nhận',
    col_disbursement_date: 'Ngày giải ngân',
    col_due_date: 'Ngày đáo hạn',
    col_principal: 'Nợ gốc',
    col_paid: 'Đã trả',
    col_remaining: 'Nợ gốc còn lại',
    col_interest_rate: 'Lãi suất',
    col_interest_debt: 'Nợ lãi',
    col_interest_paid: 'Lãi đã trả',
};

export const ASSETS_MODAL: Record<string, string> = {
    title: 'Giá vàng bạc',
    buy: 'Mua',
    sell: 'Bán',
    gold_global_label: 'Vàng thế giới',
    silver_global_label: 'Bạc thế giới',
    unit_usd_ounce: 'USD/ounce',
    gold_history: 'Lịch sử giá vàng',
    silver_history: 'Lịch sử giá bạc',
    period_1m: '1 tháng',
    period_3m: '3 tháng',
    period_6m: '6 tháng',
    period_1y: '1 năm',
    legend_gold_bar: 'Miếng',
    legend_gold_ring: 'Nhẫn',
    legend_gold_global: 'Thế giới',
    legend_silver_bar: 'Miếng',
    legend_silver_global: 'Thế giới',
    col_type: 'Loại vàng',
    col_buy: 'Giá mua',
    col_sell: 'Giá bán',
};
