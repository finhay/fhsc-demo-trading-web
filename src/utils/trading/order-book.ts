import { ORDER_SIDE, ORDER_STATUS, ORDER_TYPE } from '@/constants/trading';
import type { TradeOrderBookRow } from '@/types/pages/trading';
import type { OrderItem } from '@/types/trade/orders';
import { formatBoardPrice, formatNumberVN } from '@/utils/format';

const TRADING_ORDER_BOOK_STATUS = {
    pending_match: 'Chờ khớp',
    cancelled: 'Đã hủy',
    amending: 'Đang sửa',
    partially_filled: 'Khớp một phần',
    expired_validity: 'Hết hiệu lực',
    cancelling: 'Đang hủy',
    rejected: 'Bị từ chối',
    queued: 'Chờ gửi',
    amended: 'Đã sửa',
    sending: 'Đang gửi',
    filled: 'Khớp hết',
    expired: 'Hết hạn',
    waiting_activation: 'Chờ kích hoạt',
    activated: 'Đã kích hoạt',
    received: 'Đã nhận',
    failed: 'Thất bại',
    completed: 'Hoàn thành',
    done: 'Hoàn tất',
    waiting_execution: 'Chờ thực hiện',
    executing: 'Đang thực hiện',
    cancelled_system: 'Bị hủy',
    fully_filled: 'Khớp toàn bộ',
    on_exchange: 'Đã lên sàn',
};

type OrderStatusTone = 'success' | 'error' | 'pending' | 'neutral';

type OrderStatusView = { text: string; tone: OrderStatusTone };

type OrderStatusEntry = {
    labelKey: keyof typeof TRADING_ORDER_BOOK_STATUS;
    tone: OrderStatusTone;
};

const toPermissionFlag = (value: unknown): boolean => {
    if (typeof value === 'boolean') return value;
    if (value == null) return false;
    return String(value).toUpperCase() === 'Y';
};

const NORMAL_ORDER_STATUS_MAP: Record<string, OrderStatusEntry> = {
    '2': { labelKey: 'pending_match', tone: 'pending' },
    '3': { labelKey: 'cancelled', tone: 'error' },
    A: { labelKey: 'amending', tone: 'pending' },
    '4': { labelKey: 'partially_filled', tone: 'success' },
    '5': { labelKey: 'expired_validity', tone: 'error' },
    C: { labelKey: 'cancelling', tone: 'pending' },
    '6': { labelKey: 'rejected', tone: 'error' },
    '8': { labelKey: 'queued', tone: 'pending' },
    '10': { labelKey: 'amended', tone: 'pending' },
    '11': { labelKey: 'sending', tone: 'pending' },
    '12': { labelKey: 'filled', tone: 'success' },
    '100': { labelKey: 'expired', tone: 'error' },
};

const ORDER_247_STATUS_MAP: Record<string, OrderStatusEntry> = {
    WAITING_TO_ACTIVATE: { labelKey: 'waiting_activation', tone: 'pending' },
    SENT: { labelKey: 'activated', tone: 'success' },
    EXPIRED_ACTIVATION_TIME: { labelKey: 'expired', tone: 'error' },
    EXPIRED_AUTHORIZATION: { labelKey: 'expired', tone: 'error' },
    REJECTED: { labelKey: 'rejected', tone: 'error' },
    CANCELLED: { labelKey: 'cancelled', tone: 'error' },
};

const SHARED_ORDER_STATUS_MAP: Record<string, OrderStatusEntry> = {
    RECEIVED: { labelKey: 'received', tone: 'neutral' },
    WAITING_TO_SEND: { labelKey: 'queued', tone: 'pending' },
    SENDING: { labelKey: 'sending', tone: 'pending' },
    SENT: { labelKey: 'pending_match', tone: 'pending' },
    PENDING: { labelKey: 'queued', tone: 'pending' },
    PLACED: { labelKey: 'pending_match', tone: 'pending' },
    MATCHED: { labelKey: 'partially_filled', tone: 'success' },
    MATCHED_ALL: { labelKey: 'filled', tone: 'success' },
    CANCELLING: { labelKey: 'cancelling', tone: 'pending' },
    CANCELLED: { labelKey: 'cancelled', tone: 'error' },
    FAILED: { labelKey: 'failed', tone: 'error' },
    COMPLETED: { labelKey: 'completed', tone: 'success' },
    FIXED: { labelKey: 'amended', tone: 'pending' },
    FIXING: { labelKey: 'amending', tone: 'pending' },
};

const TWAP_LO_ORDER_STATUS_MAP: Record<string, OrderStatusEntry> = {
    RECEIVED: { labelKey: 'waiting_execution', tone: 'pending' },
    PENDING: { labelKey: 'waiting_execution', tone: 'pending' },
    ACTIVE: { labelKey: 'executing', tone: 'pending' },
    CANCELLING: { labelKey: 'cancelling', tone: 'pending' },
    COMPLETED: { labelKey: 'done', tone: 'success' },
    PARTIALLY_MATCHED: { labelKey: 'done', tone: 'success' },
    EXPIRED: { labelKey: 'cancelled_system', tone: 'error' },
    CANCELLED: { labelKey: 'cancelled', tone: 'error' },
};

const resolveOrderStatus = (entry: OrderStatusEntry | undefined): OrderStatusView =>
    entry
        ? { text: TRADING_ORDER_BOOK_STATUS[entry.labelKey], tone: entry.tone }
        : { text: '', tone: 'neutral' };

export const getNormalOrderStatus = (statusCode: string): OrderStatusView =>
    resolveOrderStatus(NORMAL_ORDER_STATUS_MAP[statusCode] ?? SHARED_ORDER_STATUS_MAP[statusCode]);

export const get247OrderStatus = (status: string): OrderStatusView =>
    resolveOrderStatus(ORDER_247_STATUS_MAP[status]);

export const getOrderStatus = (status: string): OrderStatusView =>
    resolveOrderStatus(SHARED_ORDER_STATUS_MAP[status]);

export const getIcebergSliceStatus = (
    status: string | undefined,
    matchedQty = 0,
    orderQty = 0,
): OrderStatusView => {
    if (!status || status === 'PENDING') return getOrderStatus('PENDING');
    if (status === 'MATCHED') {
        return getOrderStatus(matchedQty >= orderQty && orderQty > 0 ? 'MATCHED_ALL' : 'MATCHED');
    }
    return getOrderStatus(status);
};

export const getTwapLoOrderStatus = (status: string): OrderStatusView =>
    resolveOrderStatus(TWAP_LO_ORDER_STATUS_MAP[status]);

export const getTwapLoSliceStatus = (
    status: string | undefined,
    matchedQty = 0,
    orderQty = 0,
): OrderStatusView => {
    if (!status || status === 'PENDING' || status === 'DISPATCHING' || status === 'CARRIED_OVER') {
        return getTwapLoOrderStatus('PENDING');
    }
    if (status === 'COMPLETED') {
        return resolveOrderStatus({ labelKey: 'fully_filled', tone: 'success' });
    }
    if (status === 'MATCHED') {
        return resolveOrderStatus(
            matchedQty >= orderQty && orderQty > 0
                ? { labelKey: 'fully_filled', tone: 'success' }
                : { labelKey: 'partially_filled', tone: 'success' },
        );
    }
    if (status === 'PLACED') {
        return resolveOrderStatus({ labelKey: 'on_exchange', tone: 'success' });
    }
    if (status === 'FAILED') {
        return resolveOrderStatus({ labelKey: 'failed', tone: 'error' });
    }
    return getTwapLoOrderStatus(status);
};

export const getOrderStatusColor = (tone: OrderStatusTone): string => {
    if (tone === 'success') return 'text-green';
    if (tone === 'error') return 'text-red';
    if (tone === 'pending') return 'text-yellow';
    return 'text-secondary';
};

export const getOrderStatusBorder = (tone: OrderStatusTone): string => {
    if (tone === 'success') return 'border-green';
    if (tone === 'error') return 'border-red';
    if (tone === 'pending') return 'border-yellow';
    return 'border-secondary';
};

export const formatPlacedPriceCell = (
    placedPriceFormatted: string,
    priceType?: string | null,
): string => {
    const pt = (priceType ?? '').trim().toUpperCase();
    if (!pt || pt === 'LO') return placedPriceFormatted;
    return pt;
};

export const mapNormalOrderToOrder = (order: any) => ({
    orderId: order.odorderid ?? order.orderid ?? '',
    symbol: order.symbol,
    filledQty: formatNumberVN(order.execqtty ?? 0, { decimals: 0 }),
    totalQty: formatNumberVN(order.qtty ?? 0, { decimals: 0 }),
    filledPrice: (order.execprice ?? 0) > 0 ? formatBoardPrice(order.execprice ?? 0) : '',
    placedPrice: formatBoardPrice(order.limitprice ?? order.price ?? 0),
    marketPrice: order.market_price ?? null,
    rawPrice: order.limitprice ?? order.price ?? 0,
    rawQty: order.qtty ?? 0,
    type: order.side === ORDER_TYPE.BUY ? ORDER_TYPE.BUY : ORDER_TYPE.SELL,
    status: order.status_code ?? order.status ?? 'WAITING',
    allowCancel: toPermissionFlag(order.allowcancel),
    allowAmend: toPermissionFlag(order.allowamend),
    orderConditionType: null,
    priceType: order.pricetype ?? null,
});

export const mapPlacedOrderItemToRow = (item: OrderItem) => ({
    orderId: item.order_id ?? '',
    symbol: item.symbol,
    filledQty: formatNumberVN(item.execute_quantity ?? 0, { decimals: 0 }),
    totalQty: formatNumberVN(item.order_quantity ?? 0, { decimals: 0 }),
    filledPrice: (item.execute_price ?? 0) > 0 ? formatBoardPrice(item.execute_price ?? 0) : '',
    placedPrice: formatBoardPrice(item.limit_price ?? 0),
    marketPrice: item.market_price != null ? String(item.market_price) : null,
    rawPrice: item.limit_price ?? 0,
    rawQty: item.order_quantity ?? 0,
    type: item.order_side === ORDER_SIDE.BUY ? ORDER_TYPE.BUY : ORDER_TYPE.SELL,
    status: item.order_status ?? ORDER_STATUS.PENDING,
    allowCancel: true,
    allowAmend: true,
    orderConditionType: item.order_condition_type ?? null,
    priceType: item.order_type ?? null,
});

export const buildActiveOrderPriceMarkers = (
    orders: TradeOrderBookRow[],
    symbol: string,
): { buyPrices: Set<number>; sellPrices: Set<number> } => {
    const ACTIVE_MARKER_STATUSES = new Set(['2', '4', 'SENT', 'MATCHED', ORDER_STATUS.PENDING]);
    const buyPrices = new Set<number>();
    const sellPrices = new Set<number>();
    if (!symbol) return { buyPrices, sellPrices };

    for (const order of orders) {
        if (order.symbol !== symbol) continue;
        if (!ACTIVE_MARKER_STATUSES.has(order.status)) continue;
        if (order.rawPrice <= 0) continue;
        if (order.type === ORDER_TYPE.BUY) buyPrices.add(order.rawPrice);
        else if (order.type === ORDER_TYPE.SELL) sellPrices.add(order.rawPrice);
    }
    return { buyPrices, sellPrices };
};

export const mapConditionalOrderToOrder = (order: any) => ({
    orderId: order.odorderid ?? order.orderid ?? order.id ?? '',
    symbol: order.symbol,
    filledQty: 0,
    totalQty: formatNumberVN(order.quantity ?? 0, { decimals: 0 }),
    filledPrice: 0,
    placedPrice: (order.price ?? 0) > 0 ? formatBoardPrice(order.price ?? 0) : '',
    marketPrice: order.market_price ?? null,
    rawPrice: order.price ?? 0,
    rawQty: order.quantity ?? 0,
    type: order.side === 'BUY' || order.side === ORDER_TYPE.BUY ? ORDER_TYPE.BUY : ORDER_TYPE.SELL,
    status: order.status || ORDER_STATUS.PENDING,
    allowCancel: toPermissionFlag(order.allowcancel),
    allowAmend: toPermissionFlag(order.allowamend),
    orderConditionType: order.order_condition_type,
    priceType: order.order_condition_type ?? null,
    executionDate: order.execution_date,
    expiredDate: order.expired_date,
});

export const mapRealtimeTransactionToPatch = (data: {
    orderId: number | string;
    matchQuantity?: number;
    averagePrice?: number;
    quantity?: number;
    price?: number;
    status?: string;
}) => ({
    orderId: String(data.orderId),
    filledQty: formatNumberVN(data.matchQuantity ?? 0, { decimals: 0 }),
    filledPrice: (data.averagePrice ?? 0) > 0 ? formatBoardPrice(data.averagePrice ?? 0) : '',
    status: data.status ?? '',
    ...(data.quantity != null && {
        totalQty: formatNumberVN(data.quantity, { decimals: 0 }),
        rawQty: data.quantity,
    }),
    ...(data.price != null && {
        placedPrice: formatBoardPrice(data.price),
        rawPrice: data.price,
    }),
});
