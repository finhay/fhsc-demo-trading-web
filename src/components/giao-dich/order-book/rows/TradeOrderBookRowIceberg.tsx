'use client';

import { TradeOrderBookRowActions } from '@/components/giao-dich/order-book/rows/TradeOrderBookRowActions';
import { ORDER_TYPE } from '@/constants/trading';
import { useTranslate } from '@/hooks/useTranslate';
import type { TradeOrderBookRow } from '@/types/pages/trading';
import { getOrderStatus, getOrderStatusColor } from '@/utils/trading/order-book';

type Props = {
    order: TradeOrderBookRow;
    onOpenDetail: (orderId: string) => void;
    onCancel: (order: TradeOrderBookRow) => void;
};

export const TradeOrderBookRowIceberg = ({ order, onOpenDetail, onCancel }: Props) => {
    const trans = useTranslate();
    const status = getOrderStatus(trans, order.status);
    const canCancel = Boolean(order.allowCancel);

    return (
        <tr
            key={order.orderId}
            onClick={() => onOpenDetail(order.orderId)}
            className="cursor-pointer border-b border-tertiary"
        >
            <td className="w-1/6 py-1 font-caption whitespace-nowrap px-1 text-left">
                <span className="text-primary">{order.symbol}</span>
            </td>
            <td className="w-1/6 py-1 font-caption whitespace-nowrap px-1 text-right">
                <span className="text-primary">{order.filledQty} / </span>
                <span className="text-secondary">{order.totalQty}</span>
            </td>
            <td className="w-1/6 py-1 font-caption whitespace-nowrap px-1 text-right">
                <span className="text-primary">
                    {order.filledPrice ? `${order.filledPrice} / ` : ''}
                </span>
                <span className="text-secondary">{order.placedPrice}</span>
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
                    canEdit={false}
                    canCancel={canCancel}
                    onCancel={onCancel}
                />
            </td>
        </tr>
    );
};
