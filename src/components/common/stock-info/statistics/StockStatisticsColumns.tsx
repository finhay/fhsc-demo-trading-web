'use client';

import { type Column, type ColumnDef } from '@tanstack/react-table';

import dayjs from 'dayjs';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa6';

import type { TradingHistoryItem } from '@/types/datafeed/stock-info';
import type { StockStatisticsPriceHistoryRow } from '@/types/pages/stock-info';
import { getNetColor } from '@/utils/common';
import { formatDate, formatNumberVN, formatNumberVNWithUnit } from '@/utils/format';

const renderSortIcon = (sorted: false | 'asc' | 'desc') => {
    if (sorted === 'asc') return <FaArrowUp size={10} />;
    if (sorted === 'desc') return <FaArrowDown size={10} />;
    return null;
};

const SortableHeader = <T,>({ label, column }: { label: string; column: Column<T, unknown> }) => (
    <button
        type="button"
        className="inline-flex items-center gap-1 whitespace-nowrap body-5 text-secondary"
        onClick={column.getToggleSortingHandler()}
    >
        <span>{label}</span>
        <span className="inline-flex items-center leading-none" aria-hidden>
            {renderSortIcon(column.getIsSorted())}
        </span>
    </button>
);

const changeColor = (value: number) => {
    if (value > 0) return 'text-green';
    if (value < 0) return 'text-red';
    return 'text-orange';
};

const priceColor = (value: number, reference: number | null) => {
    if (reference == null) return 'text-green';
    return value < reference ? 'text-red' : 'text-green';
};

export const getStockStatisticsPriceColumns = (): ColumnDef<StockStatisticsPriceHistoryRow>[] => [
    {
        id: 'date',
        accessorKey: 'time',
        header: ({ column }) => <SortableHeader label={'Ngày'} column={column} />,
        cell: ({ row }) => dayjs.unix(row.original.time).format('DD/MM/YYYY'),
    },
    {
        id: 'change',
        accessorKey: 'change',
        header: ({ column }) => <SortableHeader label={'Thay đổi'} column={column} />,
        cell: ({ row }) => (
            <span className={`body-5-highlight ${changeColor(row.original.change)}`}>
                {formatNumberVN(row.original.change)}
            </span>
        ),
    },
    {
        id: 'changePercent',
        accessorKey: 'changePercent',
        header: ({ column }) => <SortableHeader label={'%'} column={column} />,
        cell: ({ row }) => (
            <span className={`body-5-highlight ${changeColor(row.original.change)}`}>
                {`${formatNumberVN(row.original.changePercent)}%`}
            </span>
        ),
    },
    {
        id: 'close',
        accessorKey: 'close',
        header: ({ column }) => <SortableHeader label={'Đóng ĐC'} column={column} />,
        cell: ({ row }) => (
            <span
                className={`body-5-highlight ${priceColor(row.original.close, row.original.open)}`}
            >
                {formatNumberVN(row.original.close)}
            </span>
        ),
    },
    {
        id: 'open',
        accessorKey: 'open',
        header: ({ column }) => <SortableHeader label={'Mở'} column={column} />,
        cell: ({ row }) => (
            <span
                className={`body-5-highlight ${priceColor(row.original.open, row.original.prevClose)}`}
            >
                {formatNumberVN(row.original.open)}
            </span>
        ),
    },
    {
        id: 'high',
        accessorKey: 'high',
        header: ({ column }) => <SortableHeader label={'Cao'} column={column} />,
        cell: ({ row }) => (
            <span
                className={`body-5-highlight ${priceColor(row.original.high, row.original.open)}`}
            >
                {formatNumberVN(row.original.high)}
            </span>
        ),
    },
    {
        id: 'low',
        accessorKey: 'low',
        header: ({ column }) => <SortableHeader label={'Thấp'} column={column} />,
        cell: ({ row }) => (
            <span
                className={`body-5-highlight ${priceColor(row.original.low, row.original.open)}`}
            >
                {formatNumberVN(row.original.low)}
            </span>
        ),
    },
    {
        id: 'volume',
        accessorKey: 'volume',
        header: ({ column }) => <SortableHeader label={'KLGD'} column={column} />,
        cell: ({ row }) => formatNumberVNWithUnit(row.original.volume),
    },
];

export const getStockStatisticsTradingColumns = (): ColumnDef<TradingHistoryItem>[] => [
    {
        id: 'date',
        accessorKey: 'date',
        header: ({ column }) => <SortableHeader label={'Ngày'} column={column} />,
        cell: ({ row }) => formatDate(row.original.date),
        sortingFn: (a, b) =>
            new Date(a.original.date).getTime() - new Date(b.original.date).getTime(),
    },
    {
        id: 'netVolume',
        accessorFn: (row) => row.net.total.volume,
        header: ({ column }) => <SortableHeader label={'KL ròng'} column={column} />,
        cell: ({ row }) => {
            const value = row.original.net.total.volume;
            return (
                <span className={`body-5-highlight ${getNetColor(value)}`}>
                    {formatNumberVN(value, { decimals: 0 })}
                </span>
            );
        },
    },
    {
        id: 'netValue',
        accessorFn: (row) => row.net.total.value,
        header: ({ column }) => <SortableHeader label={'GT ròng'} column={column} />,
        cell: ({ row }) => {
            const value = row.original.net.total.value;
            return (
                <span className={`body-5-highlight ${getNetColor(value)}`}>
                    {formatNumberVN(value, { decimals: 0 })}
                </span>
            );
        },
    },
    {
        id: 'buyVolume',
        accessorFn: (row) => row.buy.total.volume,
        header: ({ column }) => <SortableHeader label={'KL mua'} column={column} />,
        cell: ({ row }) => formatNumberVN(row.original.buy.total.volume, { decimals: 0 }),
    },
    {
        id: 'buyValue',
        accessorFn: (row) => row.buy.total.value,
        header: ({ column }) => <SortableHeader label={'GT mua'} column={column} />,
        cell: ({ row }) => formatNumberVN(row.original.buy.total.value, { decimals: 0 }),
    },
    {
        id: 'sellVolume',
        accessorFn: (row) => row.sell.total.volume,
        header: ({ column }) => <SortableHeader label={'KL bán'} column={column} />,
        cell: ({ row }) => formatNumberVN(row.original.sell.total.volume, { decimals: 0 }),
    },
    {
        id: 'sellValue',
        accessorFn: (row) => row.sell.total.value,
        header: ({ column }) => <SortableHeader label={'GT bán'} column={column} />,
        cell: ({ row }) => formatNumberVN(row.original.sell.total.value, { decimals: 0 }),
    },
];
