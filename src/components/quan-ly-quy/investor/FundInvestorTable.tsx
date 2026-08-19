import type { ColumnDef } from '@tanstack/react-table';

import { useState } from 'react';

import { FundDropdown } from '@/components/quan-ly-quy/common/FundDropdown';
import { FundInputSearch } from '@/components/quan-ly-quy/common/FundInputSearch';
import { FundInvestorStatusChip } from '@/components/quan-ly-quy/common/FundInvestorStatusChip';
import type { FundColMeta } from '@/components/quan-ly-quy/common/FundTable';
import { FundTable } from '@/components/quan-ly-quy/common/FundTable';
import { useTranslate } from '@/hooks/useTranslate';
import type { InvestorRow } from '@/stores/fund/useFundDataStore';
import { useFundDataStore } from '@/stores/fund/useFundDataStore';
import { formatNumberVN, formatNumberVNWithUnit } from '@/utils/format';

export const FundInvestorTable = () => {
    const trans = useTranslate();
    const { investorRows, holdings, selectInvestor, selectedInvestor } = useFundDataStore();

    const [search, setSearch] = useState('');
    const [sectorFilter, setSectorFilter] = useState('');

    const sectorMap: Record<string, number> = {};
    investorRows.forEach((r) => {
        r.thesis.forEach((th) => {
            const sector = th.sector.trim();
            if (!sector) return;
            sectorMap[sector] = (sectorMap[sector] ?? 0) + 1;
        });
    });
    holdings.forEach((h) => {
        const sector = h.nganh.trim();
        if (!sector) return;
        sectorMap[sector] = (sectorMap[sector] ?? 0) + 1;
    });
    const allSectors = Object.entries(sectorMap)
        .map(([sector, count]) => ({ value: sector, label: sector, count }))
        .sort((a, b) => a.label.localeCompare(b.label));

    const searchLower = search.toLowerCase();
    const filtered = investorRows.filter((row) => {
        const matchSearch =
            !search ||
            row.ho_ten.toLowerCase().includes(searchLower) ||
            row.ma_ndt.toLowerCase().includes(searchLower);
        const holdingSectors = new Set(
            holdings.filter((h) => h.ma_ndt === row.ma_ndt).map((h) => h.nganh.trim()),
        );
        const matchSector =
            !sectorFilter ||
            row.thesis.some((th) => th.sector.trim() === sectorFilter) ||
            holdingSectors.has(sectorFilter);
        return matchSearch && matchSector;
    });

    const columns: ColumnDef<InvestorRow, any>[] = [
        {
            id: 'ho_ten',
            header: trans.fund.investor.columns.investor,
            enableSorting: false,
            meta: { align: 'left', width: '16%' } satisfies FundColMeta,
            cell: ({ row }) => (
                <div className="flex flex-col gap-1">
                    <p className="font-body-3-highlight text-primary">{row.original.ho_ten}</p>
                    <p className="font-tiny text-tertiary">{row.original.ma_ndt}</p>
                </div>
            ),
        },
        {
            id: 'cap',
            accessorFn: (row) => row.von_uy_thac_vnd,
            header: trans.fund.investor.columns.capital,
            enableSorting: true,
            sortDescFirst: true,
            meta: { align: 'right', width: '11%', thClass: 'p-3' } satisfies FundColMeta,
            cell: ({ row }) => (
                <span className="font-body-3 tabular-nums text-secondary">
                    {formatNumberVNWithUnit(row.original.von_uy_thac_vnd)}
                </span>
            ),
        },
        {
            id: 'nav',
            accessorFn: (row) => row.nav,
            header: trans.fund.investor.columns.nav,
            enableSorting: true,
            sortDescFirst: true,
            meta: { align: 'right', width: '11%', thClass: 'p-3' } satisfies FundColMeta,
            cell: ({ row }) => (
                <span className="font-body-3-highlight tabular-nums text-primary">
                    {formatNumberVNWithUnit(row.original.nav)}
                </span>
            ),
        },
        {
            id: 'pnl',
            accessorFn: (row) => row.nav - row.von_uy_thac_vnd,
            header: trans.fund.investor.columns.pnl,
            enableSorting: true,
            sortDescFirst: true,
            meta: { align: 'right', width: '10%', thClass: 'p-3' } satisfies FundColMeta,
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
            header: trans.fund.investor.columns.return_pct,
            enableSorting: true,
            sortDescFirst: true,
            meta: { align: 'right', width: '10%', thClass: 'p-3' } satisfies FundColMeta,
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
            header: trans.fund.investor.columns.thesis,
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
            header: trans.fund.investor.columns.status,
            enableSorting: false,
            meta: { align: 'right', width: '12%' } satisfies FundColMeta,
            cell: ({ row }) => (
                <FundInvestorStatusChip
                    status={row.original.trang_thai}
                    label={trans.fund.investor.status[row.original.trang_thai]}
                />
            ),
        },
    ];

    return (
        <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
            <div className="flex shrink-0 items-center gap-2">
                <FundInputSearch
                    value={search}
                    onChange={setSearch}
                    placeholder={trans.fund.investor.filter.search_placeholder}
                    aria-label={trans.fund.investor.filter.search_placeholder}
                />
                <FundDropdown
                    options={allSectors}
                    value={sectorFilter}
                    onChange={setSectorFilter}
                    allLabel={trans.fund.investor.filter.all_sectors}
                    ariaLabel={trans.fund.investor.thesis_filter_list_aria}
                />
            </div>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl bg-secondary">
                <div className="scrollbar flex min-h-0 flex-1 flex-col overflow-auto">
                    <FundTable
                        data={filtered}
                        columns={columns}
                        defaultSorting={[{ id: 'cap', desc: true }]}
                        getRowKey={(r) => r.ma_ndt}
                        onRowClick={(r) => selectInvestor(r, { presentation: 'dialog' })}
                        caption={trans.fund.investor.columns.investor}
                        rowClassName={(r) =>
                            selectedInvestor?.ma_ndt === r.ma_ndt
                                ? 'bg-success shadow-[inset_3px_0_0_#49d82f]'
                                : ''
                        }
                    />
                </div>
            </div>
        </section>
    );
};
