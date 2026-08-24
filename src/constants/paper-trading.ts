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

export const PAPER_ORDER_BOOK_POLL_MS = 5000;

export const PAPER_HISTORY_RANGE_DAYS = 30;

/**
 * BE chưa chốt danh sách `order_status`, nên map phủ cả 3 bộ từ vựng có thể gặp:
 * FIX-style, bộ chữ của VNSC, và bộ mã số của order-book cũ.
 * Khoá đã chuẩn hoá bằng `normalizePaperStatus` (UPPER + gạch dưới).
 */
export const PAPER_ORDER_STATUS_LABEL: Record<string, { text: string; tone: string }> = {
    NEW: { text: 'Chờ khớp', tone: 'pending' },
    PENDING: { text: 'Chờ khớp', tone: 'pending' },
    PENDING_NEW: { text: 'Chờ gửi', tone: 'pending' },
    PLACED: { text: 'Chờ khớp', tone: 'pending' },
    RECEIVED: { text: 'Đã nhận', tone: 'neutral' },
    SENDING: { text: 'Đang gửi', tone: 'pending' },
    SENT: { text: 'Chờ khớp', tone: 'pending' },
    WAITING_TO_SEND: { text: 'Chờ gửi', tone: 'pending' },
    PARTIALLY_FILLED: { text: 'Khớp một phần', tone: 'success' },
    MATCHED: { text: 'Khớp một phần', tone: 'success' },
    FILLED: { text: 'Khớp hết', tone: 'success' },
    MATCHED_ALL: { text: 'Khớp hết', tone: 'success' },
    COMPLETED: { text: 'Hoàn thành', tone: 'success' },
    PENDING_CANCEL: { text: 'Đang hủy', tone: 'pending' },
    CANCELLING: { text: 'Đang hủy', tone: 'pending' },
    CANCELED: { text: 'Đã hủy', tone: 'error' },
    CANCELLED: { text: 'Đã hủy', tone: 'error' },
    PENDING_REPLACE: { text: 'Đang sửa', tone: 'pending' },
    FIXING: { text: 'Đang sửa', tone: 'pending' },
    REPLACED: { text: 'Đã sửa', tone: 'pending' },
    FIXED: { text: 'Đã sửa', tone: 'pending' },
    REJECTED: { text: 'Bị từ chối', tone: 'error' },
    FAILED: { text: 'Thất bại', tone: 'error' },
    EXPIRED: { text: 'Hết hiệu lực', tone: 'error' },
    DONE_FOR_DAY: { text: 'Hết hiệu lực', tone: 'error' },
    '2': { text: 'Chờ khớp', tone: 'pending' },
    '3': { text: 'Đã hủy', tone: 'error' },
    '4': { text: 'Khớp một phần', tone: 'success' },
    '5': { text: 'Hết hiệu lực', tone: 'error' },
    '6': { text: 'Bị từ chối', tone: 'error' },
    '8': { text: 'Chờ gửi', tone: 'pending' },
    '12': { text: 'Khớp hết', tone: 'success' },
    '100': { text: 'Hết hạn', tone: 'error' },
    A: { text: 'Đang sửa', tone: 'pending' },
    C: { text: 'Đang hủy', tone: 'pending' },
};

/** Trạng thái cuối — không cho sửa/huỷ nữa */
export const PAPER_TERMINAL_STATUSES: ReadonlySet<string> = new Set([
    'FILLED',
    'MATCHED_ALL',
    'COMPLETED',
    'CANCELED',
    'CANCELLED',
    'REJECTED',
    'FAILED',
    'EXPIRED',
    'DONE_FOR_DAY',
    '3',
    '5',
    '6',
    '12',
    '100',
]);
