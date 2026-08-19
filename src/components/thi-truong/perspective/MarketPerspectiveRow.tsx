'use client';

import { type Row, flexRender } from '@tanstack/react-table';

import { memo } from 'react';

import type { TopStockPriceChangeItem } from '@/types/datafeed/trading-data';
import type { PerspectiveColMeta } from '@/types/pages/market';

export const MarketPerspectiveRow = memo(
    ({ row }: { row: Row<TopStockPriceChangeItem> }) => (
        <tr>
            {row.getVisibleCells().map((cell) => {
                const meta = cell.column.columnDef.meta as PerspectiveColMeta | undefined;
                const align = meta?.align ?? 'left';
                const alignClass = align === 'right' ? 'text-right' : 'text-left';
                const tdClass = meta?.tdClass ?? 'px-1';

                return (
                    <td key={cell.id} className={`align-middle ${alignClass} ${tdClass}`.trim()}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                );
            })}
        </tr>
    ),
    (prev, next) => prev.row.original === next.row.original,
);
MarketPerspectiveRow.displayName = 'MarketPerspectiveRow';
