import {
    PAPER_ORDER_SIDE,
    PAPER_ORDER_STATUS_LABEL,
    PAPER_ORDER_TYPE,
    PAPER_TERMINAL_STATUSES,
} from '@/constants/paper-trading';
import { ORDER_SIDE, ORDER_TYPE } from '@/constants/trading';
import type {
    OrderStatusTone,
    OrderStatusView,
    TradeMatchedHistoryTableRow,
    TradeOrderBookRow,
} from '@/types/pages/trading';
import type { PaperOrder } from '@/types/paper-trading/orders';
import { formatBoardPrice, formatNumberVN } from '@/utils/format';

const warnedStatuses = new Set<string>();

export const normalizePaperStatus = (raw?: string | null): string =>
    String(raw ?? '')
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, '_');

/**
 * BE chưa chốt bộ `order_status`. Tra bảng nhãn, không khớp thì trả nguyên chuỗi của server —
 * không tự suy diễn trạng thái, và cũng không bao giờ trả ô trống.
 */
export const getPaperOrderStatus = (order: PaperOrder): OrderStatusView => {
    const key = normalizePaperStatus(order.order_status);
    const mapped = PAPER_ORDER_STATUS_LABEL[key];
    if (mapped) return { text: mapped.text, tone: mapped.tone as OrderStatusTone };

    if (process.env.NODE_ENV !== 'production' && key && !warnedStatuses.has(key)) {
        warnedStatuses.add(key);
        console.warn('[paper-trading] order_status chưa có trong bảng nhãn:', order.order_status);
    }

    return { text: String(order.order_status || '--'), tone: 'neutral' };
};

/**
 * API paper không trả `allowcancel` / `allowamend` nên FE tự suy. Cố tình nới tay: thà hiện
 * nút rồi để server từ chối, còn hơn ẩn nút khiến người dùng kẹt lệnh không huỷ được.
 */
export const isPaperOrderActive = (order: PaperOrder): boolean =>
    !PAPER_TERMINAL_STATUSES.has(normalizePaperStatus(order.order_status));

export const mapPaperOrderToRow = (order: PaperOrder): TradeOrderBookRow => {
    const isActive = isPaperOrderActive(order);

    return {
        orderId: String(order.id ?? ''),
        symbol: order.symbol,
        filledQty: formatNumberVN(order.fill_quantity ?? 0, { decimals: 0 }),
        totalQty: formatNumberVN(order.quantity ?? 0, { decimals: 0 }),
        // API paper không trả giá khớp trung bình — để trống, ô sẽ chỉ hiện giá đặt.
        filledPrice: '',
        placedPrice: formatBoardPrice(order.price ?? 0),
        marketPrice: null,
        rawPrice: order.price ?? 0,
        rawQty: order.quantity ?? 0,
        type: order.side === PAPER_ORDER_SIDE.BUY ? ORDER_TYPE.BUY : ORDER_TYPE.SELL,
        status: order.order_status ?? '',
        isActive,
        allowCancel: isActive,
        allowAmend: isActive,
        priceType: order.type ?? PAPER_ORDER_TYPE.LO,
        paperOrder: order,
    };
};

/**
 * API paper không có endpoint "lệnh đã khớp theo mã", nên dựng lại từ chính sổ lệnh:
 * lọc lệnh có KL khớp > 0, gom theo mã và chèn một dòng "Tổng" cho mỗi mã.
 */
export const groupPaperOrdersBySymbol = (
    orders: PaperOrder[],
    side: string,
): TradeMatchedHistoryTableRow[] => {
    const wantedSide = side === ORDER_SIDE.BUY ? PAPER_ORDER_SIDE.BUY : PAPER_ORDER_SIDE.SELL;
    const bySymbol = new Map<string, PaperOrder[]>();

    for (const order of orders) {
        if (order.side !== wantedSide) continue;
        if ((order.fill_quantity ?? 0) <= 0) continue;
        if (!bySymbol.has(order.symbol)) bySymbol.set(order.symbol, []);
        bySymbol.get(order.symbol)!.push(order);
    }

    return Array.from(bySymbol.entries()).flatMap(([symbol, items]) => {
        const rows = items.map((order) => ({
            symbol,
            order_id: String(order.id ?? ''),
            isTotal: false,
            quantity: order.fill_quantity ?? 0,
            price: order.price ?? 0,
            volume: (order.fill_quantity ?? 0) * (order.price ?? 0),
        }));

        const totalQuantity = rows.reduce((sum, row) => sum + row.quantity, 0);
        const totalVolume = rows.reduce((sum, row) => sum + row.volume, 0);

        return [
            ...rows,
            {
                symbol,
                isTotal: true,
                quantity: totalQuantity,
                price: totalQuantity > 0 ? totalVolume / totalQuantity : 0,
                volume: totalVolume,
            },
        ];
    });
};
