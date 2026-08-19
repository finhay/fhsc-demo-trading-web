'use client';

import { TradeOrderBookRowActions } from '@/components/giao-dich/order-book/rows/TradeOrderBookRowActions';
import { ORDER_TYPE } from '@/constants/trading';
import type { TradeOrderBookRow } from '@/types/pages/trading';
import { get247OrderStatus, getOrderStatusColor } from '@/utils/trading/order-book';

type Props = {
    order: TradeOrderBookRow;
    onEdit: (order: TradeOrderBookRow) => void;
    onCancel: (order: TradeOrderBookRow) => void;
};

export const TradeOrderBookRow247 = ({ order, onEdit, onCancel }: Props) => {
    const status = get247OrderStatus(order.status);
    const canEdit = order.status === 'WAITING_TO_ACTIVATE';
    const canCancel = order.status === 'WAITING_TO_ACTIVATE';

    return (
        <tr key={order.orderId} className="border-b border-tertiary">
            <td className="w-1/6 py-1 font-caption text-primary whitespace-nowrap px-1 text-left">
                {order.symbol}
            </td>
            <td className="w-1/6 py-1 font-caption text-primary whitespace-nowrap px-1 text-right">
                {order.totalQty}
            </td>
            <td className="w-1/6 py-1 font-caption text-secondary whitespace-nowrap px-1 text-right">
                {order.placedPrice}
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
