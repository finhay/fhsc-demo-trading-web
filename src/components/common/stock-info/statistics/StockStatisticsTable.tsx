'use client';

import {
    type ColumnDef,
    type SortingState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';

import { useState } from 'react';

import { EmptyState } from '@/components/common/feature/EmptyState';

type Props<T> = {
    data: T[];
    columns: ColumnDef<T, any>[];
    getRowId: (row: T) => string;
};

export const StockStatisticsTable = <T,>({ data, columns, getRowId }: Props<T>) => {
    const [sorting, setSorting] = useState<SortingState>([]);

    const table = useReactTable({
        data,
        columns,
        getRowId: (row) => getRowId(row),
        state: { sorting },
        onSortingChange: setSorting,
        enableSortingRemoval: true,
        enableMultiSort: false,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return data.length === 0 ? (
        <div className="flex h-full min-h-0 items-center justify-center p-4">
            <EmptyState />
        </div>
    ) : (
        <table className="w-max min-w-full border-separate border-spacing-0 bg-secondary">
            <thead className="bg-secondary">
                {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="bg-secondary">
                        {headerGroup.headers.map((header, index) => {
                            const isFirst = index === 0;
                            const isLast = index === headerGroup.headers.length - 1;
                            const sorted = header.column.getIsSorted();
                            const ariaSort =
                                sorted === 'asc'
                                    ? 'ascending'
                                    : sorted === 'desc'
                                      ? 'descending'
                                      : 'none';

                            return (
                                <th
                                    key={header.id}
                                    scope="col"
                                    aria-sort={header.column.getCanSort() ? ariaSort : undefined}
                                    className={`sticky top-0 z-10 whitespace-nowrap bg-secondary py-3 text-left font-caption text-secondary ${
                                        isFirst ? 'px-4' : isLast ? 'px-4' : 'px-2'
                                    }`}
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
            <tbody className="bg-secondary">
                {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="bg-secondary">
                        {row.getVisibleCells().map((cell, index) => {
                            const isFirst = index === 0;
                            const isLast = index === row.getVisibleCells().length - 1;
                            return (
                                <td
                                    key={cell.id}
                                    className={`whitespace-nowrap py-2 text-left font-caption text-primary ${
                                        isFirst ? 'px-4' : isLast ? 'px-4' : 'px-2'
                                    }`}
                                >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
