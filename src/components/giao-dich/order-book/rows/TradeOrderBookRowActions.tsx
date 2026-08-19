'use client';

import { RiDeleteBin5Fill, RiEdit2Fill } from 'react-icons/ri';

import { useTranslate } from '@/hooks/useTranslate';
import type { TradeOrderBookRow } from '@/types/pages/trading';

type Props = {
    order: TradeOrderBookRow;
    canEdit: boolean;
    canCancel: boolean;
    onEdit?: (order: TradeOrderBookRow) => void;
    onCancel: (order: TradeOrderBookRow) => void;
};

export const TradeOrderBookRowActions = ({
    order,
    canEdit,
    canCancel,
    onEdit,
    onCancel,
}: Props) => {
    const trans = useTranslate();

    return (
        <div className="flex gap-2 items-center justify-end">
            {canEdit && (
                <button
                    onClick={(event) => {
                        event.stopPropagation();
                        onEdit?.(order);
                    }}
                    className="text-primary hover:text-highlight transition-colors"
                    aria-label={trans.trading.order_book.edit_aria}
                >
                    <RiEdit2Fill size={18} />
                </button>
            )}
            {canCancel && (
                <button
                    onClick={(event) => {
                        event.stopPropagation();
                        onCancel(order);
                    }}
                    className="text-primary hover:text-red transition-colors"
                    aria-label={trans.trading.order_book.cancel_aria}
                >
                    <RiDeleteBin5Fill size={18} />
                </button>
            )}
        </div>
    );
};
