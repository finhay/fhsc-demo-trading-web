'use client';

import { type Table } from '@tanstack/react-table';

import { useCallback } from 'react';

import { FaArrowDown, FaArrowUp } from 'react-icons/fa6';
import { IoMdArrowDropleft, IoMdArrowDropright } from 'react-icons/io';

import { useTranslate } from '@/hooks/useTranslate';
import type { ColumnKey, IboardDisplayRow } from '@/types/pages/iboard';
import { getVisibleLeafColumns } from '@/utils/iboard';

type Props = {
    table: Table<IboardDisplayRow>;
    totalMetric: string;
    onToggleTotalMetric: () => void;
};

export const IBoardTableHeader = ({ table, totalMetric, onToggleTotalMetric }: Props) => {
    const trans = useTranslate();

    const getSortState = useCallback(
        (key: ColumnKey): string => {
            const column = table.getColumn(key);
            const s = column?.getIsSorted() ?? false;
            return s === false ? '' : s;
        },
        [table],
    );

    const onToggleSort = useCallback(
        (key: ColumnKey) => {
            table.getColumn(key)?.toggleSorting();
        },
        [table],
    );

    const renderSortIcon = (sorted: string) => {
        if (sorted === 'asc') return <FaArrowUp size={12} />;
        if (sorted === 'desc') return <FaArrowDown size={12} />;
        return null;
    };

    const renderSortableLeafHeader = (key: ColumnKey, label: string) => {
        const sorted = getSortState(key);
        return (
            <button
                type="button"
                onClick={() => onToggleSort(key)}
                className="inline-flex w-full items-center justify-end gap-1 font-tiny-highlight text-primary"
            >
                <span>{label}</span>
                <span className="inline-flex items-center">{renderSortIcon(sorted)}</span>
            </button>
        );
    };

    return (
        <thead className="sticky top-0 z-30 bg-secondary">
            <tr>
                <th
                    rowSpan={2}
                    className="pl-1 whitespace-nowrap border-r border-b border-t border-l border-quaternary bg-secondary text-left"
                >
                    {(() => {
                        const sorted = getSortState('symbol');
                        return (
                            <button
                                type="button"
                                onClick={() => onToggleSort('symbol')}
                                className="inline-flex w-full items-center justify-start gap-1 font-tiny-highlight text-primary"
                            >
                                <span>{trans.iboard.leaf_symbol}</span>
                                <span className="inline-flex items-center">
                                    {renderSortIcon(sorted)}
                                </span>
                            </button>
                        );
                    })()}
                </th>
                <th
                    rowSpan={2}
                    className="pr-1 whitespace-nowrap border-r border-b border-t border-l border-quaternary bg-secondary text-right"
                >
                    {renderSortableLeafHeader('reference', trans.iboard.leaf_reference)}
                </th>
                <th
                    rowSpan={2}
                    className="pr-1 whitespace-nowrap border-r border-b border-t border-l border-quaternary bg-secondary text-right"
                >
                    {renderSortableLeafHeader('ceiling', trans.iboard.leaf_ceiling)}
                </th>
                <th
                    rowSpan={2}
                    className="pr-1 whitespace-nowrap border-r border-b border-t border-l border-quaternary bg-secondary text-right"
                >
                    {renderSortableLeafHeader('floor', trans.iboard.leaf_floor)}
                </th>
                <th
                    rowSpan={2}
                    className="pr-1 whitespace-nowrap border-r border-b border-t border-l border-quaternary bg-secondary text-right"
                >
                    {(() => {
                        const activeKey: ColumnKey =
                            totalMetric === 'vol' ? 'totalVol' : 'totalVal';
                        const label =
                            totalMetric === 'vol'
                                ? trans.iboard.leaf_totalVol
                                : trans.iboard.leaf_totalVal;
                        const sorted = getSortState(activeKey);
                        return (
                            <div className="inline-flex w-full items-center justify-end gap-0.5">
                                <button
                                    type="button"
                                    onClick={onToggleTotalMetric}
                                    className="inline-flex shrink-0 items-center justify-center rounded-xl p-0.5 text-primary hover:bg-tertiary/50"
                                    aria-label="Chuyển giữa Tổng KL và Tổng GT"
                                >
                                    <IoMdArrowDropleft size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onToggleSort(activeKey)}
                                    className="inline-flex min-w-0 flex-1 items-center justify-end gap-1 font-tiny-highlight text-primary"
                                >
                                    <span className="truncate">{label}</span>
                                    <span className="inline-flex shrink-0 items-center">
                                        {renderSortIcon(sorted)}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={onToggleTotalMetric}
                                    className="inline-flex shrink-0 items-center justify-center rounded-xl p-0.5 text-primary hover:bg-tertiary/50"
                                    aria-label="Chuyển giữa Tổng KL và Tổng GT"
                                >
                                    <IoMdArrowDropright size={16} />
                                </button>
                            </div>
                        );
                    })()}
                </th>
                <th
                    colSpan={6}
                    className="pr-1 whitespace-nowrap border-r border-b border-t border-l border-quaternary bg-secondary text-center"
                >
                    <span className="font-tiny-highlight text-primary">
                        {trans.iboard.group_bid}
                    </span>
                </th>
                <th
                    colSpan={4}
                    className="pr-1 whitespace-nowrap border-r border-b border-t border-l border-quaternary bg-secondary text-center"
                >
                    <span className="font-tiny-highlight text-primary">
                        {trans.iboard.group_match}
                    </span>
                </th>
                <th
                    colSpan={6}
                    className="pr-1 whitespace-nowrap border-r border-b border-t border-l border-quaternary bg-secondary text-center"
                >
                    <span className="font-tiny-highlight text-primary">
                        {trans.iboard.group_ask}
                    </span>
                </th>
                <th
                    colSpan={3}
                    className="pr-1 whitespace-nowrap border-r border-b border-t border-l border-quaternary bg-secondary text-center"
                >
                    <span className="font-tiny-highlight text-primary">
                        {trans.iboard.group_price}
                    </span>
                </th>
                <th
                    colSpan={3}
                    className="pr-1 whitespace-nowrap border-r border-b border-t border-l border-quaternary bg-secondary text-center"
                >
                    <span className="font-tiny-highlight text-primary">
                        {trans.iboard.group_foreign}
                    </span>
                </th>
            </tr>
            <tr>
                {getVisibleLeafColumns(totalMetric)
                    .slice(5)
                    .map((column) => {
                        const leafKey = `leaf_${column.key}` as keyof typeof trans.iboard;
                        const label = (trans.iboard[leafKey] as string | undefined) ?? column.label;
                        return (
                            <th
                                key={`sub-${column.key}`}
                                scope="col"
                                className="pr-1 whitespace-nowrap border-r border-b border-l border-quaternary bg-secondary text-right"
                            >
                                {renderSortableLeafHeader(column.key, label)}
                            </th>
                        );
                    })}
            </tr>
        </thead>
    );
};
