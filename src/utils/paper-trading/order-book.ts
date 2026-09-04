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
import type { PaperOrder, PaperOrderBookItem } from '@/types/paper-trading/orders';
import { formatBoardPrice, formatNumberVN } from '@/utils/format';

const warnedStatuses = new Set<string>();

export const resolvePaperOrderId = (order: PaperOrder): string =>
    String(order.id || order.order_id || order.cl_ord_id || '').trim();

export const resolvePaperOrderBookId = (order: PaperOrderBookItem): string =>
    String(order.odorderid ?? '').trim();

export const normalizePaperStatus = (raw?: string | null): string =>
    String(raw ?? '')
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, '_');

const isYesFlag = (value?: string | null): boolean => String(value ?? '').trim().toUpperCase() === 'Y';

/**
 * Lịch sử lệnh (shape cũ): tra bảng nhãn theo `order_status`.
 * Không khớp thì trả nguyên chuỗi server.
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

/** Sổ lệnh: text lấy `status`, tone suy từ `status_code`. */
export const getPaperOrderBookStatus = (order: PaperOrderBookItem): OrderStatusView => {
    const key = normalizePaperStatus(order.status_code);
    const mapped = PAPER_ORDER_STATUS_LABEL[key];
    return {
        text: String(order.status || mapped?.text || '--'),
        tone: (mapped?.tone as OrderStatusTone) || 'neutral',
    };
};

export const isPaperOrderBookActive = (order: PaperOrderBookItem): boolean =>
    isYesFlag(order.allowcancel) ||
    isYesFlag(order.allowamend) ||
    !PAPER_TERMINAL_STATUSES.has(normalizePaperStatus(order.status_code));

export const mapPaperOrderToRow = (order: PaperOrderBookItem): TradeOrderBookRow => {
    const allowCancel = isYesFlag(order.allowcancel);
    const allowAmend = isYesFlag(order.allowamend);
    const isActive = allowCancel || allowAmend;
    const execPrice = order.execprice;

    return {
        orderId: resolvePaperOrderBookId(order),
        symbol: order.symbol,
        filledQty: formatNumberVN(order.execqtty ?? 0, { decimals: 0 }),
        totalQty: formatNumberVN(order.qtty ?? 0, { decimals: 0 }),
        filledPrice: execPrice != null && execPrice > 0 ? formatBoardPrice(execPrice) : '',
        placedPrice: formatBoardPrice(order.price ?? 0),
        marketPrice: null,
        rawPrice: order.price ?? 0,
        rawQty: order.qtty ?? 0,
        // Loại lệnh — lấy thẳng nhãn `side` từ BE ("Mua" / "Bán")
        type: order.side || (order.side_code === PAPER_ORDER_SIDE.BUY ? ORDER_TYPE.BUY : ORDER_TYPE.SELL),
        // Trạng thái — lấy thẳng `status` từ BE
        status: order.status ?? '',
        isActive,
        allowCancel,
        allowAmend,
        priceType: order.pricetype ?? PAPER_ORDER_TYPE.LO,
        paperOrder: order,
    };
};

/**
 * API paper không có endpoint "lệnh đã khớp theo mã", nên dựng lại từ chính sổ lệnh:
 * lọc lệnh có KL khớp > 0, gom theo mã và chèn một dòng "Tổng" cho mỗi mã.
 */
export const groupPaperOrdersBySymbol = (
    orders: PaperOrderBookItem[],
    side: string,
): TradeMatchedHistoryTableRow[] => {
    const wantedSide = side === ORDER_SIDE.BUY ? PAPER_ORDER_SIDE.BUY : PAPER_ORDER_SIDE.SELL;
    const bySymbol = new Map<string, PaperOrderBookItem[]>();

    for (const order of orders) {
        if (order.side_code !== wantedSide) continue;
        if ((order.execqtty ?? 0) <= 0) continue;
        if (!bySymbol.has(order.symbol)) bySymbol.set(order.symbol, []);
        bySymbol.get(order.symbol)!.push(order);
    }

    return Array.from(bySymbol.entries()).flatMap(([symbol, items]) => {
        const rows = items.map((order) => ({
            symbol,
            order_id: resolvePaperOrderBookId(order),
            isTotal: false,
            quantity: order.execqtty ?? 0,
            price: order.execprice ?? order.price ?? 0,
            volume: (order.execqtty ?? 0) * (order.execprice ?? order.price ?? 0),
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
