import type { ColumnDef } from '@tanstack/react-table';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { FundInvestorStatusChip } from '@/components/quan-ly-quy/common/FundInvestorStatusChip';
import type { FundColMeta } from '@/components/quan-ly-quy/common/FundTable';
import { FundTable } from '@/components/quan-ly-quy/common/FundTable';
import { FUND_TAB } from '@/constants/fund';
import { useTranslate } from '@/hooks/useTranslate';
import type { InvestorRow } from '@/stores/fund/useFundDataStore';
import { useFundDataStore } from '@/stores/fund/useFundDataStore';
import { formatNumberVN, formatNumberVNWithUnit } from '@/utils/format';

type Props = {
    rows: InvestorRow[];
};

export const FundTopInvestorsTable = ({ rows }: Props) => {
    const trans = useTranslate();
    const { selectInvestor, setActiveTab } = useFundDataStore();

    const columns: ColumnDef<InvestorRow, any>[] = [
        {
            id: 'ho_ten',
            header: trans.fund.overview.top_investors.columns.investor,
            enableSorting: false,
            meta: { align: 'left', width: '16%', nowrap: true } satisfies FundColMeta,
            cell: ({ row }) => (
                <div className="flex flex-col gap-1">
                    <p className="font-body-3-highlight text-primary">{row.original.ho_ten}</p>
                    <p className="font-tiny text-tertiary">{row.original.ma_ndt}</p>
                </div>
            ),
        },
        {
            id: 'nav',
            accessorFn: (row) => row.nav,
            header: trans.fund.overview.top_investors.columns.nav,
            enableSorting: true,
            sortDescFirst: true,
            meta: {
                align: 'right',
                width: '11%',
                thClass: 'py-3 pr-3',
                nowrap: true,
            } satisfies FundColMeta,
            cell: ({ row }) => (
                <span className="font-body-3-highlight text-primary tabular-nums">
                    {formatNumberVNWithUnit(row.original.nav)}
                </span>
            ),
        },
        {
            id: 'cap',
            accessorFn: (row) => row.von_uy_thac_vnd,
            header: trans.fund.overview.top_investors.columns.capital,
            enableSorting: true,
            sortDescFirst: true,
            meta: {
                align: 'right',
                width: '11%',
                thClass: 'py-3 pr-3',
                nowrap: true,
            } satisfies FundColMeta,
            cell: ({ row }) => (
                <span className="font-body-3 text-secondary tabular-nums">
                    {formatNumberVNWithUnit(row.original.von_uy_thac_vnd)}
                </span>
            ),
        },
        {
            id: 'pnl',
            accessorFn: (row) => row.nav - row.von_uy_thac_vnd,
            header: trans.fund.overview.top_investors.columns.return,
            enableSorting: true,
            sortDescFirst: true,
            meta: {
                align: 'right',
                width: '10%',
                thClass: 'py-3 pr-3',
                nowrap: true,
            } satisfies FundColMeta,
            cell: ({ row }) => {
                const pnl = row.original.nav - row.original.von_uy_thac_vnd;
                return (
                    <span
                        className={`font-body-3-highlight tabular-nums ${pnl >= 0 ? 'text-green' : 'text-red'}`}
                    >
                        {pnl >= 0 ? '+' : ''}
                        {formatNumberVNWithUnit(pnl)}
                    </span>
                );
            },
        },
        {
            id: 'ret',
            accessorFn: (row) => row.return_pct,
            header: trans.fund.overview.top_investors.columns.return_pct,
            enableSorting: true,
            sortDescFirst: true,
            meta: {
                align: 'right',
                width: '10%',
                thClass: 'py-3 pr-3',
                nowrap: true,
            } satisfies FundColMeta,
            cell: ({ row }) => (
                <span
                    className={`font-body-3-highlight tabular-nums ${row.original.return_pct >= 0 ? 'text-green' : 'text-red'}`}
                >
                    {row.original.return_pct >= 0 ? '+' : ''}
                    {formatNumberVN(row.original.return_pct)}%
                </span>
            ),
        },
        {
            id: 'thesis',
            header: trans.fund.overview.top_investors.columns.thesis,
            enableSorting: false,
            meta: { align: 'left', width: '30%' } satisfies FundColMeta,
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1">
                    {row.original.thesis.map((th) => (
                        <span
                            key={`${row.original.ma_ndt}-${th.sector}`}
                            className="inline-flex overflow-hidden rounded-full"
                        >
                            <span className="bg-tertiary px-2 py-1 font-tiny text-secondary">
                                {th.sector}
                            </span>
                            <span className="border-l border-tertiary bg-quaternary p-1 font-tiny-highlight text-primary">
                                {th.pct}%
                            </span>
                        </span>
                    ))}
                </div>
            ),
        },
        {
            id: 'status',
            header: trans.fund.overview.top_investors.columns.status,
            enableSorting: false,
            meta: { align: 'right', width: '12%', nowrap: true } satisfies FundColMeta,
            cell: ({ row }) => (
                <FundInvestorStatusChip
                    status={row.original.trang_thai}
                    label={trans.fund.investor.status[row.original.trang_thai]}
                />
            ),
        },
    ];

    return (
        <section
            className="flex h-full flex-col gap-2 rounded-xl bg-secondary p-5"
            aria-label={trans.fund.overview.top_investors.title}
        >
            <div className="flex shrink-0 items-center justify-between">
                <h3 className="font-body-2-highlight text-primary">
                    {trans.fund.overview.top_investors.title}
                </h3>
                {rows.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setActiveTab(FUND_TAB.CLIENTS)}
                        className="font-caption-highlight text-highlight transition-opacity hover:opacity-80"
                    >
                        {trans.fund.overview.top_investors.view_all}
                    </button>
                )}
            </div>
            {rows.length === 0 ? (
                <div className="flex min-h-48 flex-1 flex-col items-center justify-center px-4 py-8 [&_figure]:h-auto [&_figure]:justify-normal">
                    <EmptyState />
                </div>
            ) : (
                <div className="scrollbar overflow-auto">
                    <FundTable
                        data={rows}
                        columns={columns}
                        defaultSorting={[{ id: 'nav', desc: true }]}
                        getRowKey={(r) => r.ma_ndt}
                        onRowClick={(r) => selectInvestor(r, { presentation: 'dialog' })}
                        caption={trans.fund.overview.top_investors.title}
                    />
                </div>
            )}
        </section>
    );
};
