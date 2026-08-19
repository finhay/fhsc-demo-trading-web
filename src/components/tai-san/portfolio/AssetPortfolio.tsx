'use client';

import {
    type SortingState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';

import { useMemo, useState } from 'react';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { TradeQuickPanel } from '@/components/giao-dich/panel/TradeQuickPanel';
import { getAssetPortfolioColumns } from '@/components/tai-san/portfolio/AssetPortfolioColumns';
import { AUTH_MODE } from '@/constants/auth';
import { useTranslate } from '@/hooks/useTranslate';
import { useAssetStore } from '@/stores/assets/useAssetStore';
import { useAuthFlowStore } from '@/stores/auth/useAuthFlowStore';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';
import type { PortfolioTradeAnchor } from '@/types/pages/assets';
import type { SortableColMeta } from '@/types/pages/common';
import type { PortfolioItem } from '@/types/trade/portfolio';

export const AssetPortfolio = () => {
    const trans = useTranslate();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [tradeAnchor, setTradeAnchor] = useState<PortfolioTradeAnchor | null>(null);

    const { portfolio, isPortfolioLoading } = useAssetStore();
    const { openStockDetail, fetchStockInfo } = useStockInfoStore();
    const { profile } = useAuthStore();
    const { openAuthDialog } = useAuthFlowStore();

    const handleSymbolClick = (symbol: string) => {
        openStockDetail(symbol);
    };

    const handleTradeClick = async (side: string, item: PortfolioItem, rect: DOMRect) => {
        if (!profile) {
            openAuthDialog(AUTH_MODE.LOGIN);
            return;
        }
        await fetchStockInfo(item.symbol);
        setTradeAnchor({ symbol: item.symbol, side, price: item.basic_price, rect });
    };

    const columns = useMemo(
        () =>
            getAssetPortfolioColumns(trans, {
                onSymbolClick: handleSymbolClick,
                onTradeClick: handleTradeClick,
            }),
        [trans, profile],
    );

    const table = useReactTable({
        data: portfolio,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getRowId: (row) => row.symbol,
    });

    return (
        <section className="flex w-full flex-col gap-3 rounded-xl bg-secondary p-3">
            <h2 className="shrink-0 font-body-2-highlight text-primary">
                {trans.assets.portfolio.list_heading}
            </h2>
            {isPortfolioLoading ? (
                <div className="h-64 w-full">
                    <Skeleton />
                </div>
            ) : portfolio.length === 0 ? (
                <div className="flex h-64 w-full items-center justify-center">
                    <EmptyState />
                </div>
            ) : (
                <div className="scrollbar w-full overflow-x-auto">
                    <table className="w-full min-w-max border-collapse">
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        const meta = header.column.columnDef.meta as
                                            | SortableColMeta
                                            | undefined;
                                        const isLeft = meta?.align === 'left';
                                        const dir = header.column.getIsSorted();

                                        return (
                                            <th
                                                key={header.id}
                                                scope="col"
                                                {...(header.column.getCanSort() && {
                                                    'aria-sort':
                                                        dir === 'asc'
                                                            ? 'ascending'
                                                            : dir === 'desc'
                                                              ? 'descending'
                                                              : 'none',
                                                })}
                                                className={`whitespace-nowrap px-2 py-2.5 font-body-3 text-secondary ${isLeft ? 'text-left' : 'text-right'}`}
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column.columnDef.header,
                                                          header.getContext(),
                                                      )}
                                            </th>
                                        );
                                    })}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className="border-b border-tertiary last:border-b-0"
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        const meta = cell.column.columnDef.meta as
                                            | SortableColMeta
                                            | undefined;
                                        const isLeft = meta?.align === 'left';
                                        return (
                                            <td
                                                key={cell.id}
                                                className={`whitespace-nowrap px-2 py-2.5 font-body-3 text-primary ${isLeft ? 'text-left' : 'text-right'}`}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {tradeAnchor && (
                <TradeQuickPanel
                    key={`${tradeAnchor.symbol}-${tradeAnchor.side}-${tradeAnchor.price}`}
                    anchorRect={tradeAnchor.rect}
                    side={tradeAnchor.side}
                    price={tradeAnchor.price}
                    onClose={() => setTradeAnchor(null)}
                />
            )}
        </section>
    );
};
