export const PAPER_ACCOUNT_PREFIX = 'SIM';

export const PAPER_ACCOUNT_TYPE_NAME = 'Demo';

export const PAPER_ORDER_SIDE = {
    BUY: 'NB',
    SELL: 'NS',
} as const;

export const PAPER_ORDER_TYPE = {
    LO: 'LO',
} as const;

export const PAPER_ORDER_CHANNEL = 'ONLINE';

/** Simulator chỉ nhận lô chẵn */
export const PAPER_LOT_SIZE = 100;

export const PAPER_HISTORY_RANGE_DAYS = 30;

/**
 * Map `status_code` → tone màu. Không có trong map → xám (neutral).
 * Text nhãn lấy thẳng từ field `status` của BE.
 */
export const PAPER_ORDER_STATUS_TONE: Record<string, 'success' | 'error'> = {
    '2': 'success',
    '4': 'success',
    '12': 'success',
    '3': 'error',
    '5': 'error',
    '6': 'error',
    '100': 'error',
};

/** Trạng thái cuối — không cho sửa/huỷ nữa (fallback khi thiếu allowcancel/allowamend). */
export const PAPER_TERMINAL_STATUSES: ReadonlySet<string> = new Set(['3', '5', '6', '12', '100']);
