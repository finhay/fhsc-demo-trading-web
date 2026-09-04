'use client';

import { TradeOrderBookRowActions } from '@/components/giao-dich/order-book/rows/TradeOrderBookRowActions';
import { ORDER_TYPE } from '@/constants/trading';
import type { TradeOrderBookRow } from '@/types/pages/trading';
import { getPaperOrderBookStatus } from '@/utils/paper-trading/order-book';
import { formatPlacedPriceCell, getOrderStatusColor } from '@/utils/trading/order-book';

type Props = {
    order: TradeOrderBookRow;
    onOpenDetail: (orderId: string) => void;
    onEdit: (order: TradeOrderBookRow) => void;
    onCancel: (order: TradeOrderBookRow) => void;
};

export const TradeOrderBookRowNormal = ({ order, onOpenDetail, onEdit, onCancel }: Props) => {
    const status = order.paperOrder
        ? getPaperOrderBookStatus(order.paperOrder)
        : { text: order.status, tone: 'neutral' as const };
    const canEdit = Boolean(order.allowAmend);
    const canCancel = Boolean(order.allowCancel);

    return (
        <tr className="border-b border-tertiary">
            <td className="w-1/6 py-1 font-caption whitespace-nowrap px-1 text-left">
                <button
                    type="button"
                    onClick={() => onOpenDetail(order.orderId)}
                    className="text-primary transition-colors hover:text-highlight"
                    aria-label={'Xem lịch sử lệnh {symbol}'.replace('{symbol}', order.symbol)}
                >
                    {order.symbol}
                </button>
            </td>
            <td className="w-1/6 py-1 font-caption whitespace-nowrap px-1 text-right">
                <span className="text-primary">{order.filledQty} / </span>
                <span className="text-secondary">{order.totalQty}</span>
            </td>
            <td className="w-1/6 py-1 font-caption whitespace-nowrap px-1 text-right">
                <span className="text-primary">
                    {order.filledPrice ? `${order.filledPrice} / ` : ''}
                </span>
                <span className="text-secondary">
                    {formatPlacedPriceCell(order.placedPrice, order.priceType)}
                </span>
            </td>
            <td className="w-1/6 py-1 font-caption whitespace-nowrap px-1 text-right">
                <div className={order.type === ORDER_TYPE.BUY ? 'text-green' : 'text-red'}>
                    {order.type}
                </div>
            </td>
            <td className="w-1/6 py-1 font-caption whitespace-nowrap px-1 text-right">
                <div className={getOrderStatusColor(status.tone)}>{status.text}</div>
            </td>
            <td className="w-1/6 py-1 font-caption text-primary whitespace-nowrap px-1 text-right">
                <TradeOrderBookRowActions
                    order={order}
                    canEdit={canEdit}
                    canCancel={canCancel}
                    onEdit={onEdit}
                    onCancel={onCancel}
                />
            </td>
        </tr>
    );
};
