'use client';

import {
    type SortingState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';

import { useEffect, useMemo, useState } from 'react';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { getPaperOrderHistoryColumns } from '@/components/tai-san/trade-history/AssetTradeHistoryColumns';
import { PAPER_HISTORY_RANGE_DAYS } from '@/constants/paper-trading';
import { fetchPaperOrderHistory } from '@/services/api/paper-trading/orders';
import { usePaperAccountStore } from '@/stores/paper-trading/usePaperAccountStore';
import type { SortableColMeta } from '@/types/pages/common';
import type { PaperOrder } from '@/types/paper-trading/orders';
import { isSuccessApi } from '@/utils/common';
import { getDateRange } from '@/utils/format';

export const AssetTradeHistory = () => {
    const [data, setData] = useState<PaperOrder[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sorting, setSorting] = useState<SortingState>([]);

    const { accountId } = usePaperAccountStore();
    const { fromDate, toDate } = useMemo(() => getDateRange(PAPER_HISTORY_RANGE_DAYS), []);
    const columns = useMemo(() => getPaperOrderHistoryColumns(), []);

    const table = useReactTable({
        data,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const fetchData = async () => {
        if (!accountId) return;

        setIsLoading(true);
        try {
            const { data: result, error_code } = await fetchPaperOrderHistory(accountId, {
                from_date: fromDate,
                to_date: toDate,
                page: 1,
            });
            if (isSuccessApi(error_code)) setData(result?.data ?? []);
        } catch {
            setData([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [accountId, fromDate, toDate]);

    return (
        <section className="flex h-96 w-full shrink-0 flex-col gap-3 overflow-hidden rounded-xl bg-secondary p-3">
            <h2 className="shrink-0 font-body-2-highlight text-primary">{'Lịch sử giao dịch'}</h2>
            <div className="min-h-0 w-full flex-1">
                {isLoading ? (
                    <div className="h-full w-full">
                        <Skeleton />
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex h-full w-full items-center justify-center">
                        <EmptyState />
                    </div>
                ) : (
                    <div className="scrollbar h-full overflow-auto">
                        <table className="w-full min-w-max border-collapse">
                            <thead className="sticky top-0 z-10 bg-secondary">
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
            </div>
        </section>
    );
};
