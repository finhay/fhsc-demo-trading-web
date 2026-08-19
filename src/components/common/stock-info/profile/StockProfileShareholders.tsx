'use client';

import {
    type Column,
    type ColumnDef,
    type SortingState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';

import { useMemo, useState } from 'react';

import dayjs from 'dayjs';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa6';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Spinner } from '@/components/common/ui/Spinner';
import { Tooltip } from '@/components/common/ui/Tooltip';
import { useTranslate } from '@/hooks/useTranslate';
import type {
    StockMajorShareholder,
    StockOwnershipShareholderType,
} from '@/types/datafeed/stock-info';
import { formatDateOrDash, formatNumberVN, formatPercentVN } from '@/utils/format';

type Props = {
    isLoading: boolean;
    shareholders: StockMajorShareholder[];
};

type Trans = ReturnType<typeof useTranslate>;

const renderSortIcon = (sorted: false | 'asc' | 'desc') => {
    if (sorted === 'asc') return <FaArrowUp size={10} />;
    if (sorted === 'desc') return <FaArrowDown size={10} />;
    return null;
};

const SortableHeader = ({
    label,
    column,
}: {
    label: string;
    column: Column<StockMajorShareholder, unknown>;
}) => (
    <button
        type="button"
        className="inline-flex items-center gap-1 whitespace-nowrap font-caption text-secondary"
        onClick={column.getToggleSortingHandler()}
    >
        <span>{label}</span>
        <span className="inline-flex items-center leading-none" aria-hidden>
            {renderSortIcon(column.getIsSorted())}
        </span>
    </button>
);

const getColumns = (trans: Trans): ColumnDef<StockMajorShareholder>[] => {
    const t = trans.stockInfo.profile;

    const getShareholderTypeLabel = (type: StockOwnershipShareholderType) =>
        t.shareholder_type[type] ?? type;

    return [
        {
            id: 'name',
            accessorKey: 'name',
            header: ({ column }) => <SortableHeader label={t.col_name} column={column} />,
            cell: ({ row }) => {
                const name = row.original.name || '—';
                return (
                    <div className="flex min-w-0 flex-col gap-1">
                        <Tooltip
                            content={name}
                            placement="top"
                            align="start"
                            className="block min-w-0 max-w-full"
                        >
                            <p className="truncate font-body-3-highlight text-primary">{name}</p>
                        </Tooltip>
                        <p className="font-caption text-secondary">
                            {getShareholderTypeLabel(row.original.type)}
                        </p>
                    </div>
                );
            },
        },
        {
            id: 'volume',
            accessorKey: 'volume',
            header: ({ column }) => <SortableHeader label={t.col_shares} column={column} />,
            cell: ({ row }) => (
                <span className="font-body-3-highlight text-primary">
                    {formatNumberVN(row.original.volume, { decimals: 0 })}
                </span>
            ),
        },
        {
            id: 'pct',
            accessorKey: 'pct',
            header: ({ column }) => <SortableHeader label={t.col_pct} column={column} />,
            cell: ({ row }) => (
                <span className="font-body-3-highlight text-primary">
                    {formatPercentVN(row.original.pct)}
                </span>
            ),
        },
        {
            id: 'updated_at',
            accessorKey: 'updated_at',
            header: ({ column }) => <SortableHeader label={t.col_updated} column={column} />,
            cell: ({ row }) => (
                <span className="font-body-3-highlight text-primary">
                    {formatDateOrDash(row.original.updated_at)}
                </span>
            ),
            sortingFn: (a, b) =>
                dayjs(a.original.updated_at).valueOf() - dayjs(b.original.updated_at).valueOf(),
        },
    ];
};

export const StockProfileShareholders = ({ isLoading, shareholders }: Props) => {
    const trans = useTranslate();
    const t = trans.stockInfo.profile;
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns = useMemo(() => getColumns(trans), [trans]);

    const table = useReactTable({
        data: shareholders,
        columns,
        getRowId: (row, index) => `${row.name}-${row.updated_at}-${index}`,
        state: { sorting },
        onSortingChange: setSorting,
        enableSortingRemoval: true,
        enableMultiSort: false,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <aside
            className="flex h-full min-h-0 min-w-0 basis-3/5 flex-col overflow-hidden rounded-2xl border border-quaternary"
            aria-label={t.shareholders_aria}
        >
            {isLoading ? (
                <div className="flex h-full min-h-0 items-center justify-center" role="status">
                    <Spinner isLoading isOverlay={false} />
                </div>
            ) : (
                <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4">
                    <h3 className="shrink-0 font-body-2-highlight text-primary">
                        {t.shareholders_title}
                    </h3>
                    {shareholders.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="scrollbar min-h-0 flex-1 overflow-y-auto">
                            <table className="w-full min-w-full table-fixed border-separate border-spacing-0">
                                <colgroup>
                                    <col />
                                    <col className="w-[102px]" />
                                    <col className="w-16" />
                                    <col className="w-[94px]" />
                                </colgroup>
                                <thead className="sticky top-0 z-10 bg-secondary">
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map((header, index) => {
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
                                                        aria-sort={
                                                            header.column.getCanSort()
                                                                ? ariaSort
                                                                : undefined
                                                        }
                                                        className={`bg-secondary pb-3 text-left font-caption text-secondary ${
                                                            index === 0 ? 'pr-3' : 'pl-3'
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
                                <tbody>
                                    {table.getRowModel().rows.map((row, rowIndex) => (
                                        <tr key={row.id}>
                                            {row.getVisibleCells().map((cell, index) => (
                                                <td
                                                    key={cell.id}
                                                    className={`py-3 align-top text-left ${
                                                        index === 0 ? 'pr-3' : 'pl-3'
                                                    } ${
                                                        rowIndex > 0
                                                            ? 'border-t border-tertiary'
                                                            : ''
                                                    }`}
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext(),
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </aside>
    );
};
