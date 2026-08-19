'use client';

import { type Table, flexRender } from '@tanstack/react-table';
import type { Virtualizer } from '@tanstack/react-virtual';

import { IBOARD_TERTIARY_BG_COLUMN_KEYS } from '@/constants/iboard';
import type { ColumnKey, IboardDisplayRow, IboardRealtimeCellBgMap } from '@/types/pages/iboard';
import { getIboardCellBg } from '@/utils/iboard';

type Props = {
    table: Table<IboardDisplayRow>;
    rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
    realtimeCellBgMap: IboardRealtimeCellBgMap;
};

export const IBoardTableBody = ({ table, rowVirtualizer, realtimeCellBgMap }: Props) => {
    const rows = table.getSortedRowModel().rows;
    const leafColumnCount = table.getVisibleLeafColumns().length;
    const virtualRows = rowVirtualizer.getVirtualItems();
    const totalVirtualHeight = rows.length > 0 ? rowVirtualizer.getTotalSize() : 0;
    const padTop = virtualRows.length > 0 ? Math.max(0, virtualRows[0].start) : 0;
    const padBottom =
        virtualRows.length > 0
            ? Math.max(0, totalVirtualHeight - virtualRows[virtualRows.length - 1].end)
            : 0;

    return (
        <tbody>
            {rows.length > 0 && padTop > 0 && (
                <tr aria-hidden className="pointer-events-none">
                    <td
                        colSpan={leafColumnCount}
                        className="p-0 border-0 bg-transparent pointer-events-none"
                        style={{ height: padTop }}
                    />
                </tr>
            )}
            {rows.length > 0 &&
                virtualRows.map((virtualRow) => {
                    const row = rows[virtualRow.index];
                    return (
                        <tr
                            key={row.id}
                            className="group box-border overflow-hidden transition-colors"
                            style={{
                                height: 35,
                                maxHeight: 35,
                            }}
                        >
                            {row.getVisibleCells().map((cell) => {
                                const isLeft = cell.column.id === 'symbol';
                                const colId = cell.column.id as ColumnKey;
                                const tertiaryBg = IBOARD_TERTIARY_BG_COLUMN_KEYS.has(colId);
                                const realtimeBgClass = getIboardCellBg(
                                    colId,
                                    row.original._raw,
                                    realtimeCellBgMap,
                                );
                                const baseBg = tertiaryBg ? 'bg-tertiary' : 'bg-secondary';
                                const cellBgClasses = realtimeBgClass
                                    ? `${realtimeBgClass} [&_*]:!text-primary`
                                    : `${baseBg} group-hover:bg-tertiary`;
                                return (
                                    <td
                                        key={cell.id}
                                        className={`min-w-0 overflow-hidden border-r border-b border-l border-quaternary align-middle transition-colors ${cellBgClasses} ${
                                            isLeft ? 'px-1 py-0 text-left' : 'px-1 py-0 text-right'
                                        }`}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                );
                            })}
                        </tr>
                    );
                })}
            {rows.length > 0 && padBottom > 0 && (
                <tr aria-hidden className="pointer-events-none">
                    <td
                        colSpan={leafColumnCount}
                        className="p-0 border-0 bg-transparent pointer-events-none"
                        style={{ height: padBottom }}
                    />
                </tr>
            )}
        </tbody>
    );
};
