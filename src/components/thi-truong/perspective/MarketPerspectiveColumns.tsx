import { type ColumnDef } from '@tanstack/react-table';

import { FaArrowDown, FaArrowUp } from 'react-icons/fa6';

import { MarketPerspectiveWatchlistCell } from '@/components/thi-truong/perspective/MarketPerspectiveWatchlistCell';
import type { TopStockPriceChangeItem } from '@/types/datafeed/trading-data';
import type { PerspectiveColMeta } from '@/types/pages/market';
import { getMarketPriceColor } from '@/utils/common';
import { getChangeColor } from '@/utils/common';
import { formatNumberVN } from '@/utils/format';

const renderSortIcon = (sorted: false | 'asc' | 'desc') => {
    if (sorted === 'asc') return <FaArrowUp size={12} />;
    if (sorted === 'desc') return <FaArrowDown size={12} />;
    return null;
};

export const getMarketPerspectiveColumns = (
    onSelectSymbol: (symbol: string) => void,
): ColumnDef<TopStockPriceChangeItem>[] => [
    {
        id: 'symbol',
        accessorKey: 'symbol',
        header: ({ column }) => (
            <button
                type="button"
                className="inline-flex w-full items-center justify-start gap-1 font-caption text-secondary"
                onClick={column.getToggleSortingHandler()}
            >
                {'Mã'}
                <span className="inline-flex items-center">
                    {renderSortIcon(column.getIsSorted())}
                </span>
            </button>
        ),
        meta: {
            align: 'left',
            thClass: 'px-1',
            tdClass: 'px-1',
        } satisfies PerspectiveColMeta,
        cell: ({ row }) => {
            const stock = row.original;
            return (
                <button
                    type="button"
                    onClick={() => onSelectSymbol(stock.symbol)}
                    className="flex items-center gap-2 cursor-pointer text-left"
                >
                    <span className="font-caption-highlight text-primary">{stock.symbol}</span>
                </button>
            );
        },
    },
    {
        id: 'price',
        accessorKey: 'price',
        header: ({ column }) => (
            <button
                type="button"
                className="inline-flex w-full items-center justify-end gap-1 font-caption text-secondary"
                onClick={column.getToggleSortingHandler()}
            >
                {'Giá'}
                <span className="inline-flex items-center">
                    {renderSortIcon(column.getIsSorted())}
                </span>
            </button>
        ),
        meta: {
            align: 'right',
            thClass: 'px-1',
            tdClass: 'px-1',
        } satisfies PerspectiveColMeta,
        cell: ({ row }) => {
            const stock = row.original;
            const priceColor = getMarketPriceColor(
                stock.price,
                stock.reference,
                stock.floor,
                stock.ceiling,
            );
            return (
                <div className={`font-caption-highlight ${priceColor}`}>
                    {formatNumberVN(stock.price / 1000)}
                </div>
            );
        },
    },
    {
        id: 'change',
        accessorKey: 'changePercent',
        sortDescFirst: true,
        header: ({ column }) => (
            <button
                type="button"
                className="inline-flex w-full items-center justify-end gap-1 font-caption text-secondary"
                aria-label={'Sắp xếp theo thay đổi'}
                onClick={column.getToggleSortingHandler()}
            >
                {'Thay đổi'}
                <span className="inline-flex items-center">
                    {renderSortIcon(column.getIsSorted())}
                </span>
            </button>
        ),
        meta: {
            align: 'right',
            thClass: 'px-1',
            tdClass: 'px-1',
        } satisfies PerspectiveColMeta,
        cell: ({ row }) => {
            const stock = row.original;
            const changeColorClass = getChangeColor(stock.changePercent);

            const changeArrow =
                stock.change > 0 ? (
                    <FaArrowUp size={12} aria-hidden />
                ) : stock.change < 0 ? (
                    <FaArrowDown size={12} aria-hidden />
                ) : null;

            return (
                <div
                    className={`flex w-full justify-end font-caption items-center gap-1 px-1 ${changeColorClass}`}
                >
                    {changeArrow}
                    <span>{formatNumberVN(stock.change / 1000)}</span>
                    <span>
                        ({stock.changePercent > 0 ? '+' : ''}
                        {formatNumberVN(stock.changePercent)}%)
                    </span>
                </div>
            );
        },
    },
    {
        id: 'watchlist',
        header: () => null,
        enableSorting: false,
        meta: {
            align: 'right',
            thClass: 'px-1 w-8',
            tdClass: 'px-1 w-8',
        } satisfies PerspectiveColMeta,
        cell: ({ row }) => <MarketPerspectiveWatchlistCell stock={row.original} />,
    },
];
