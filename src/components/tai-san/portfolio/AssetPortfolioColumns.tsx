import { type ColumnDef } from '@tanstack/react-table';

import { FaArrowDown, FaArrowUp } from 'react-icons/fa6';

import { SortableHeader } from '@/components/common/table/SortableHeader';
import { TRADE_LITERAL } from '@/constants/trading';
import type { SortableColMeta } from '@/types/pages/common';
import type { PortfolioItem } from '@/types/trade/portfolio';
import { calcPortfolioMarketValue, formatPortfolioPrice } from '@/utils/assets';
import { formatNumberVN, formatPercentVN } from '@/utils/format';

type ColumnHandlers = {
    onSymbolClick: (symbol: string) => void;
    onTradeClick: (side: string, item: PortfolioItem, rect: DOMRect) => void;
};

export const getAssetPortfolioColumns = ({
    onSymbolClick,
    onTradeClick,
}: ColumnHandlers): ColumnDef<PortfolioItem, unknown>[] => {
    return [
        {
            id: 'symbol',
            accessorKey: 'symbol',
            header: ({ column }) => <SortableHeader label={'Mã'} column={column} align="left" />,
            meta: { align: 'left' } satisfies SortableColMeta,
            cell: ({ row }) => (
                <button
                    type="button"
                    onClick={() => onSymbolClick(row.original.symbol)}
                    className="cursor-pointer body-4-highlight text-primary hover:underline"
                >
                    {row.original.symbol}
                </button>
            ),
        },
        {
            id: 'total',
            accessorKey: 'total',
            header: ({ column }) => <SortableHeader label={'Tổng'} column={column} align="right" />,
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatNumberVN(getValue<number>(), { decimals: 0 }),
        },
        {
            id: 'trade',
            accessorKey: 'trade',
            header: ({ column }) => (
                <SortableHeader label={'Có thể GD'} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatNumberVN(getValue<number>(), { decimals: 0 }),
        },
        {
            id: 'cost_price',
            accessorKey: 'cost_price',
            header: ({ column }) => (
                <SortableHeader label={'Giá vốn'} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatPortfolioPrice(getValue<number>()),
        },
        {
            id: 'basic_price',
            accessorKey: 'basic_price',
            header: ({ column }) => (
                <SortableHeader label={'Giá TT'} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatPortfolioPrice(getValue<number>()),
        },
        {
            id: 'cost_price_amount',
            accessorKey: 'cost_price_amount',
            header: ({ column }) => (
                <SortableHeader label={'Giá trị vốn'} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatNumberVN(getValue<number>(), { trimTrailingZeros: true }),
        },
        {
            id: 'market_value',
            accessorFn: (row) => calcPortfolioMarketValue(row),
            header: ({ column }) => (
                <SortableHeader label={'Giá trị thị trường'} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatNumberVN(getValue<number>(), { trimTrailingZeros: true }),
        },
        {
            id: 'pnl_amount',
            accessorKey: 'pnl_amount',
            header: ({ column }) => (
                <SortableHeader label={'Lãi/lỗ'} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ row }) => {
                const value = row.original.pnl_amount;
                const rate = row.original.pnl_rate;
                const colorClass =
                    value > 0 ? 'text-green' : value < 0 ? 'text-red' : 'text-primary';
                return (
                    <span
                        className={`inline-flex items-center justify-end gap-1 whitespace-nowrap ${colorClass}`}
                    >
                        {value > 0 && <FaArrowUp className="body-5 shrink-0" />}
                        {value < 0 && <FaArrowDown className="body-5 shrink-0" />}
                        <span>
                            {formatNumberVN(Math.abs(value), { trimTrailingZeros: true })}
                            {' / '}
                            {value < 0 ? '-' : ''}
                            {formatPercentVN(Math.abs(rate))}
                        </span>
                    </span>
                );
            },
        },
        {
            id: 'actions',
            enableSorting: false,
            header: () => null,
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-1">
                    <button
                        type="button"
                        onClick={(event) =>
                            onTradeClick(
                                TRADE_LITERAL.BUY,
                                row.original,
                                event.currentTarget.getBoundingClientRect(),
                            )
                        }
                        className="flex h-8 w-20 shrink-0 items-center justify-center rounded-full bg-success px-4 body-4 text-green"
                    >
                        {'Mua'}
                    </button>
                    <button
                        type="button"
                        onClick={(event) =>
                            onTradeClick(
                                TRADE_LITERAL.SELL,
                                row.original,
                                event.currentTarget.getBoundingClientRect(),
                            )
                        }
                        className="flex h-8 w-20 shrink-0 items-center justify-center rounded-full bg-error px-4 body-4 text-red"
                    >
                        {'Bán'}
                    </button>
                </div>
            ),
        },
    ];
};
