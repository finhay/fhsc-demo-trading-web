'use client';

import { RiDeleteBin5Fill, RiEdit2Fill } from 'react-icons/ri';

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
    return (
        <div className="flex gap-2 items-center justify-end">
            {canEdit && (
                <button
                    onClick={(event) => {
                        event.stopPropagation();
                        onEdit?.(order);
                    }}
                    className="text-primary hover:text-highlight transition-colors"
                    aria-label={'Sửa lệnh'}
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
                    aria-label={'Huỷ lệnh'}
                >
                    <RiDeleteBin5Fill size={18} />
                </button>
            )}
        </div>
    );
};
