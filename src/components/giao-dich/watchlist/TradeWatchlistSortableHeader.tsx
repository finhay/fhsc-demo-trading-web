'use client';

import { type Column } from '@tanstack/react-table';

import { FaArrowDown, FaArrowUp } from 'react-icons/fa6';

import type { StocksInfoItem } from '@/types/datafeed/stock-info';

type Props = {
    label: string;
    align: string;
    column: Column<StocksInfoItem, unknown>;
};

export const TradeWatchlistSortableHeader = ({ label, align, column }: Props) => {
    const sorted = column.getIsSorted();
    const alignClass = align === 'left' ? 'justify-start' : 'justify-end';
    return (
        <button
            type="button"
            className={`inline-flex w-full items-center gap-1 ${alignClass} font-body-3 text-secondary`}
            onClick={column.getToggleSortingHandler()}
        >
            <span>{label}</span>
            <span className="inline-flex items-center text-caption leading-none">
                {sorted === 'asc' ? (
                    <FaArrowUp size={10} />
                ) : sorted === 'desc' ? (
                    <FaArrowDown size={10} />
                ) : null}
            </span>
        </button>
    );
};
