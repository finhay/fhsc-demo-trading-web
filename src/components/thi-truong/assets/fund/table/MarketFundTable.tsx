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
import { getMarketFundTableColumns } from '@/components/thi-truong/assets/fund/table/MarketFundTableColumns';
import { FUND_LIST_TABS, FUND_MODAL_LIST_TABS, FUND_TYPE_STOCK_FUND } from '@/constants/market';
import type { FundCertificateItem, FundListTab, FundTableColMeta } from '@/types/pages/fund';
import { filterFundCertificatesByType } from '@/utils/market/market-fund';

type Props = {
    certificates: FundCertificateItem[];
    onSelectFund: (fundName: string) => void;
};

export const MarketFundTable = ({ certificates, onSelectFund }: Props) => {
    const t = FUND_MODAL_LIST_TABS;
    const [tab, setTab] = useState<FundListTab>(FUND_TYPE_STOCK_FUND);
    const [sorting, setSorting] = useState<SortingState>([{ id: 'profit_ytd', desc: true }]);
    const columns = useMemo(() => getMarketFundTableColumns(), []);
    const data = useMemo(
        () => filterFundCertificatesByType(certificates, tab),
        [certificates, tab],
    );

    const table = useReactTable({
        data,
        columns,
        getRowId: (row) => row.name,
        state: { sorting },
        onSortingChange: setSorting,
        enableSortingRemoval: false,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <section className="base-secondary relative z-10 flex flex-col gap-4 rounded-2xl p-3">
            <div className="flex shrink-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h3 className="body-3-highlight text-primary">{'Tất cả Chứng chỉ quỹ'}</h3>
                <div className="flex flex-wrap items-center gap-3">
                    {FUND_LIST_TABS.map((key) => {
                        const isActive = tab === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => {
                                    setTab(key);
                                    setSorting([{ id: 'profit_ytd', desc: true }]);
                                }}
                                className={`rounded-full px-3 py-1 transition-colors ${
                                    isActive
                                        ? 'base-tertiary body-4-highlight text-primary'
                                        : 'body-4 text-secondary'
                                }`}
                            >
                                {t[key]}
                            </button>
                        );
                    })}
                </div>
            </div>
            {data.length === 0 ? (
                <div className="flex min-h-48 flex-1 items-center justify-center py-8">
                    <EmptyState />
                </div>
            ) : (
                <table className="w-full table-fixed border-separate border-spacing-0">
                    <thead>
                        {table.getHeaderGroups().map((hg) => (
                            <tr key={hg.id}>
                                {hg.headers.map((header) => {
                                    const meta = header.column.columnDef.meta as
                                        | FundTableColMeta
                                        | undefined;
                                    const alignCls =
                                        meta?.align === 'right' ? 'text-right' : 'text-left';
                                    return (
                                        <th
                                            key={header.id}
                                            scope="col"
                                            className={`body-4 text-secondary ${alignCls} ${meta?.widthClass ?? ''} ${meta?.thClass ?? ''}`.trim()}
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
                                key={row.id}
                                onClick={() => onSelectFund(row.original.name)}
                                className="cursor-pointer"
                            >
                                {row.getVisibleCells().map((cell) => {
                                    const meta = cell.column.columnDef.meta as
                                        | FundTableColMeta
                                        | undefined;
                                    const alignCls =
                                        meta?.align === 'right' ? 'text-right' : 'text-left';
                                    return (
                                        <td
                                            key={cell.id}
                                            className={`pt-8 align-middle ${alignCls} ${meta?.widthClass ?? ''} ${meta?.tdClass ?? ''}`.trim()}
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
            )}
        </section>
    );
};
