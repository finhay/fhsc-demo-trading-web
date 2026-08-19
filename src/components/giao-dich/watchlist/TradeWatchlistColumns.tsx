'use client';

import { type ColumnDef, type SortingFn } from '@tanstack/react-table';

import { FaArrowDown, FaArrowLeft, FaArrowRight, FaArrowUp } from 'react-icons/fa6';

import { TradeWatchlistSortableHeader } from '@/components/giao-dich/watchlist/TradeWatchlistSortableHeader';
import type { StocksInfoItem } from '@/types/datafeed/stock-info';
import type { MarketPortfolioColumnMeta, WatchlistTableMeta } from '@/types/pages/trading';
import { getPriceColor, getPriceFlashBg } from '@/utils/common';
import { formatNumberVN } from '@/utils/format';

type WatchlistColumnLabels = {
    col_symbol: string;
    col_market_price_ref: string;
    col_change: string;
};

type CreateWatchlistColumnsParams = {
    labels: WatchlistColumnLabels;
    numericSortFn: SortingFn<StocksInfoItem>;
    alphanumericSortFn: SortingFn<StocksInfoItem>;
    onSelectSymbol: (symbol: string) => void;
};

export const createWatchlistColumns = ({
    labels,
    numericSortFn,
    alphanumericSortFn,
    onSelectSymbol,
}: CreateWatchlistColumnsParams): ColumnDef<StocksInfoItem>[] => [
    {
        id: 'symbol',
        accessorKey: 'symbol',
        size: 90,
        sortingFn: alphanumericSortFn,
        meta: { align: 'left' } satisfies MarketPortfolioColumnMeta,
        header: ({ column }) => (
            <TradeWatchlistSortableHeader label={labels.col_symbol} align="left" column={column} />
        ),
        cell: ({ row }) => (
            <div className="flex min-w-0 items-start py-1">
                <button
                    type="button"
                    onClick={() => onSelectSymbol(row.original.symbol)}
                    className="cursor-pointer text-left font-body-3-highlight text-primary hover:underline"
                >
                    {row.original.symbol}
                </button>
            </div>
        ),
    },
    {
        id: 'price',
        accessorKey: 'price',
        size: 110,
        sortingFn: numericSortFn,
        meta: { align: 'left' } satisfies MarketPortfolioColumnMeta,
        header: ({ column }) => (
            <TradeWatchlistSortableHeader
                label={labels.col_market_price_ref}
                align="left"
                column={column}
            />
        ),
        cell: ({ row, table }) => {
            const { symbol, price, reference, floor, ceiling } = row.original;
            const { updatedSymbols } = table.options.meta as WatchlistTableMeta;
            const isSymbolRecentlyUpdated = updatedSymbols.has(symbol);
            const highlightColor = getPriceFlashBg(price, reference, floor, ceiling);
            const priceColorClass = isSymbolRecentlyUpdated
                ? 'text-primary'
                : getPriceColor(price, reference, floor, ceiling);
            return (
                <div
                    className={`flex flex-col w-fit p-1 font-body-3 rounded transition-colors duration-1000 ${
                        isSymbolRecentlyUpdated && highlightColor ? highlightColor : ''
                    }`}
                >
                    <data value={price || 0} className={`font-body-3 ${priceColorClass}`}>
                        {formatNumberVN(Number(price) / 1000)}
                    </data>
                    <data value={reference || 0} className="font-body-3 text-primary">
                        {formatNumberVN(Number(reference) / 1000)}
                    </data>
                </div>
            );
        },
    },
    {
        id: 'change',
        accessorFn: (row) => row.price_change_percent,
        size: 90,
        sortingFn: numericSortFn,
        meta: { align: 'right' } satisfies MarketPortfolioColumnMeta,
        header: ({ column }) => (
            <TradeWatchlistSortableHeader label={labels.col_change} align="right" column={column} />
        ),
        cell: ({ row, table }) => {
            const { symbol, price, reference, price_change, price_change_percent, floor, ceiling } =
                row.original;
            const { updatedSymbols } = table.options.meta as WatchlistTableMeta;
            const isSymbolRecentlyUpdated = updatedSymbols.has(symbol);
            const highlightColor = getPriceFlashBg(price, reference, floor, ceiling);
            const changeColorClass = getPriceColor(price, reference, floor, ceiling);
            return (
                <div className="flex items-center justify-end">
                    <div
                        className={`flex items-center gap-2 p-1 font-body-3 rounded transition-colors duration-1000 ${isSymbolRecentlyUpdated && highlightColor ? highlightColor : changeColorClass}`}
                    >
                        {price_change > 0 ? (
                            <FaArrowUp size={14} />
                        ) : price_change < 0 ? (
                            <FaArrowDown size={14} />
                        ) : (
                            <div className="flex flex-col">
                                <FaArrowRight size={12} />
                                <FaArrowLeft size={12} />
                            </div>
                        )}
                        <div className="flex flex-col items-end whitespace-nowrap">
                            <data value={price_change || 0}>
                                {formatNumberVN(Math.abs(price_change) / 1000)}
                            </data>
                            <data value={price_change_percent || 0}>
                                {formatNumberVN(Math.abs(price_change_percent))}%
                            </data>
                        </div>
                    </div>
                </div>
            );
        },
    },
];
