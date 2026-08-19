import {
    type ColumnDef,
    type SortingState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';

import { useState } from 'react';

import { FaArrowDown, FaArrowUp } from 'react-icons/fa6';

import { EmptyState } from '@/components/common/feature/EmptyState';

export type FundColMeta = {
    align?: 'left' | 'right';
    width?: string;
    thClass?: string;
    tdClass?: string;
    nowrap?: boolean;
};

type FundTableProps<T> = {
    data: T[];
    columns: ColumnDef<T, any>[];
    defaultSorting?: SortingState;
    onRowClick?: (row: T) => void;
    rowClassName?: (row: T) => string;
    getRowKey: (row: T) => string;
    caption?: string;
};

export function FundTable<T>({
    data,
    columns,
    defaultSorting = [],
    onRowClick,
    rowClassName,
    getRowKey,
    caption,
}: FundTableProps<T>) {
    const [sorting, setSorting] = useState<SortingState>(defaultSorting);

    const hasColGroup = columns.some((col) => (col.meta as FundColMeta | undefined)?.width);

    const table = useReactTable({
        data,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        enableSortingRemoval: false,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    if (data.length === 0) {
        return (
            <div className="flex min-h-48 flex-1 flex-col items-center justify-center px-4 py-8">
                <EmptyState />
            </div>
        );
    }

    return (
        <table className="w-full table-fixed border-collapse" aria-label={caption}>
            {caption && <caption className="sr-only">{caption}</caption>}
            {hasColGroup && (
                <colgroup>
                    {table.getAllLeafColumns().map((col) => {
                        const meta = col.columnDef.meta as FundColMeta | undefined;
                        return <col key={col.id} style={{ width: meta?.width }} />;
                    })}
                </colgroup>
            )}
            <thead className="sticky top-0 z-10 bg-secondary">
                {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id} className="border-b border-tertiary">
                        {hg.headers.map((header) => {
                            const meta = header.column.columnDef.meta as FundColMeta | undefined;
                            const align = meta?.align ?? 'left';
                            const alignCls = align === 'right' ? 'text-right' : 'text-left';
                            const thCls = meta?.thClass ?? 'py-3 px-3';
                            const nowrapCls = meta?.nowrap ? 'whitespace-nowrap' : '';

                            if (header.column.getCanSort()) {
                                const dir = header.column.getIsSorted();
                                const ariaSort =
                                    dir === 'asc'
                                        ? 'ascending'
                                        : dir === 'desc'
                                          ? 'descending'
                                          : 'none';
                                return (
                                    <th
                                        key={header.id}
                                        scope="col"
                                        aria-sort={ariaSort}
                                        className={`font-caption-highlight text-tertiary ${alignCls} ${thCls} ${nowrapCls}`.trim()}
                                    >
                                        <button
                                            type="button"
                                            className={`inline-flex select-none items-center gap-1 font-caption-highlight text-tertiary ${align === 'right' ? 'w-full justify-end' : ''}`}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )}
                                            <span
                                                className="inline-flex items-center leading-none"
                                                aria-hidden="true"
                                            >
                                                {dir === 'asc' ? (
                                                    <FaArrowUp size={10} />
                                                ) : dir === 'desc' ? (
                                                    <FaArrowDown size={10} />
                                                ) : null}
                                            </span>
                                        </button>
                                    </th>
                                );
                            }
                            return (
                                <th
                                    key={header.id}
                                    scope="col"
                                    className={`font-caption-highlight text-tertiary ${alignCls} ${thCls} ${nowrapCls}`.trim()}
                                >
                                    {flexRender(
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
                        key={getRowKey(row.original)}
                        className={`border-b border-tertiary last:border-0 transition-colors ${onRowClick ? 'cursor-pointer hover:bg-tertiary/40' : ''} ${rowClassName?.(row.original) ?? ''}`.trim()}
                        onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                        onKeyDown={
                            onRowClick
                                ? (e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                          e.preventDefault();
                                          onRowClick(row.original);
                                      }
                                  }
                                : undefined
                        }
                        tabIndex={onRowClick ? 0 : undefined}
                        role={onRowClick ? 'link' : undefined}
                    >
                        {row.getVisibleCells().map((cell) => {
                            const meta = cell.column.columnDef.meta as FundColMeta | undefined;
                            const alignCls = meta?.align === 'right' ? 'text-right' : 'text-left';
                            const tdCls = meta?.tdClass ?? 'py-3 px-3';
                            const nowrapCls = meta?.nowrap ? 'whitespace-nowrap' : '';
                            return (
                                <td
                                    key={cell.id}
                                    className={`align-middle ${tdCls} ${alignCls} ${nowrapCls}`.trim()}
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
}
