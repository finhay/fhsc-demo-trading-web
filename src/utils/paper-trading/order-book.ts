import {
    PAPER_ORDER_SIDE,
    PAPER_ORDER_STATUS_TONE,
    PAPER_ORDER_TYPE,
    PAPER_TERMINAL_STATUSES,
} from '@/constants/paper-trading';
import { ORDER_SIDE, ORDER_TYPE } from '@/constants/trading';
import type {
    OrderStatusView,
    TradeMatchedHistoryTableRow,
    TradeOrderBookRow,
} from '@/types/pages/trading';
import type { PaperOrder, PaperOrderBookItem } from '@/types/paper-trading/orders';
import { formatBoardPrice, formatNumberVN } from '@/utils/format';

export const resolvePaperOrderId = (order: PaperOrder): string => String(order.id ?? '').trim();

export const resolvePaperOrderBookId = (order: PaperOrderBookItem): string =>
    String(order.odorderid ?? '').trim();

const normalizeStatusCode = (raw?: string | null): string => String(raw ?? '').trim();

const isYesFlag = (value?: string | null): boolean =>
    String(value ?? '')
        .trim()
        .toUpperCase() === 'Y';

/** Text từ `status`, màu từ `status_code`. */
export const getPaperStatusView = (
    status?: string | null,
    statusCode?: string | null,
): OrderStatusView => ({
    text: String(status?.trim() || '--'),
    tone: PAPER_ORDER_STATUS_TONE[normalizeStatusCode(statusCode)] ?? 'neutral',
});

export const isPaperOrderBookActive = (order: PaperOrderBookItem): boolean =>
    isYesFlag(order.allowcancel) ||
    isYesFlag(order.allowamend) ||
    !PAPER_TERMINAL_STATUSES.has(normalizeStatusCode(order.status_code));

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
        type:
            order.side ||
            (order.side_code === PAPER_ORDER_SIDE.BUY ? ORDER_TYPE.BUY : ORDER_TYPE.SELL),
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
