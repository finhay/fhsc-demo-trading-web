import type { ColumnDef } from '@tanstack/react-table';

import { useEffect, useState } from 'react';

import { FundDropdown } from '@/components/quan-ly-quy/common/FundDropdown';
import { FundInputSearch } from '@/components/quan-ly-quy/common/FundInputSearch';
import type { FundColMeta } from '@/components/quan-ly-quy/common/FundTable';
import { FundTable } from '@/components/quan-ly-quy/common/FundTable';
import { FundStockDetail } from '@/components/quan-ly-quy/portfolio/FundStockDetail';
import { useTranslate } from '@/hooks/useTranslate';
import { useFundDataStore } from '@/stores/fund/useFundDataStore';
import { formatNumberVN, formatNumberVNWithUnit } from '@/utils/format';
import type { StockSummary } from '@/utils/fund/fund';

type PortfolioRow = StockSummary & { _maxWeight: number; _stockName: string };

export const FundPortfolioTable = () => {
    const trans = useTranslate();
    const { portfolioSummary, investorRows, stockNames } = useFundDataStore();

    const [search, setSearch] = useState('');
    const [sectorFilter, setSectorFilter] = useState('');
    const [selected, setSelected] = useState<StockSummary | null>(null);

    const sectorMap: Record<string, number> = {};
    portfolioSummary.forEach((r) => {
        const sector = r.nganh.trim();
        if (!sector) return;
        sectorMap[sector] = (sectorMap[sector] ?? 0) + 1;
    });
    investorRows.forEach((inv) => {
        inv.thesis.forEach((th) => {
            const sector = th.sector.trim();
            if (!sector) return;
            sectorMap[sector] = (sectorMap[sector] ?? 0) + 1;
        });
    });
    const sectorOptions = Object.entries(sectorMap)
        .map(([sector, count]) => ({ value: sector, label: sector, count }))
        .sort((a, b) => a.label.localeCompare(b.label));

    const q = search.trim().toLowerCase();
    const filtered = portfolioSummary.filter((r) => {
        const matchQ = !q || r.ma_ck.toLowerCase().includes(q) || r.nganh.toLowerCase().includes(q);
        const matchS = !sectorFilter || r.nganh === sectorFilter;
        return matchQ && matchS;
    });

    const maxWeight = Math.max(...filtered.map((r) => r.weight_pct), 1);

    const data: PortfolioRow[] = filtered.map((r) => ({
        ...r,
        _maxWeight: maxWeight,
        _stockName: stockNames[r.ma_ck] ?? r.nganh,
    }));

    const columns: ColumnDef<PortfolioRow, any>[] = [
        {
            id: 'symbol',
            header: trans.fund.portfolio.columns.symbol,
            enableSorting: false,
            meta: { align: 'left', thClass: 'w-40 p-2', tdClass: 'p-2' } satisfies FundColMeta,
            cell: ({ row }) => (
                <>
                    <div className="font-body-3-highlight text-primary">{row.original.ma_ck}</div>
                    <div className="truncate font-tiny text-tertiary">
                        {row.original._stockName}
                    </div>
                </>
            ),
        },
        {
            id: 'kl',
            accessorFn: (row) => row.total_kl,
            header: trans.fund.portfolio.columns.total_quantity,
            enableSorting: true,
            sortDescFirst: true,
            meta: {
                align: 'right',
                thClass: 'p-2 w-28',
                tdClass: 'p-2 font-body-3 text-primary',
                nowrap: true,
            } satisfies FundColMeta,
            cell: ({ row }) => formatNumberVN(row.original.total_kl, { decimals: 0 }),
        },
        {
            id: 'avg_cost',
            accessorFn: (row) => row.weighted_avg_cost,
            header: trans.fund.portfolio.columns.avg_cost,
            enableSorting: true,
            sortDescFirst: true,
            meta: {
                align: 'right',
                thClass: 'w-24 p-2',
                tdClass: 'p-2 font-body-3 text-primary',
                nowrap: true,
            } satisfies FundColMeta,
            cell: ({ row }) => formatNumberVN(row.original.weighted_avg_cost),
        },
        {
            id: 'current_price',
            accessorFn: (row) => row.current_price,
            header: trans.fund.portfolio.columns.current_price,
            enableSorting: true,
            sortDescFirst: true,
            meta: {
                align: 'right',
                thClass: 'w-24 p-2',
                tdClass: 'p-2 font-body-3 text-primary',
                nowrap: true,
            } satisfies FundColMeta,
            cell: ({ row }) => formatNumberVN(row.original.current_price),
        },
        {
            id: 'wt',
            accessorFn: (row) => row.weight_pct,
            header: trans.fund.portfolio.columns.weight,
            enableSorting: true,
            sortDescFirst: true,
            meta: { align: 'left', thClass: 'p-2 w-44', tdClass: 'p-2' } satisfies FundColMeta,
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div
                        role="meter"
                        aria-valuenow={row.original.weight_pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${trans.fund.portfolio.columns.weight}: ${formatNumberVN(row.original.weight_pct)}%`}
                        className="h-1.5 flex-1 overflow-hidden rounded-full bg-tertiary"
                    >
                        <div
                            className={`h-full rounded-full ${row.original.pnl >= 0 ? 'bg-highlight' : 'bg-red'}`}
                            style={{
                                width: `${(row.original.weight_pct / row.original._maxWeight) * 100}%`,
                            }}
                        />
                    </div>
                    <span className="w-10 shrink-0 text-right font-body-3 text-secondary">
                        {formatNumberVN(row.original.weight_pct)}%
                    </span>
                </div>
            ),
        },
        {
            id: 'pnl',
            accessorFn: (row) => row.pnl,
            header: trans.fund.portfolio.columns.pnl,
            enableSorting: true,
            sortDescFirst: true,
            meta: {
                align: 'right',
                thClass: 'p-2 w-24',
                tdClass: 'p-2 font-body-3-highlight',
                nowrap: true,
            } satisfies FundColMeta,
            cell: ({ row }) => (
                <span className={row.original.pnl >= 0 ? 'text-green' : 'text-red'}>
                    {row.original.pnl >= 0 ? '+' : ''}
                    {formatNumberVNWithUnit(row.original.pnl)}
                </span>
            ),
        },
        {
            id: 'ret',
            accessorFn: (row) => row.pnl_pct,
            header: trans.fund.portfolio.columns.pnl_pct,
            enableSorting: true,
            sortDescFirst: true,
            meta: {
                align: 'right',
                thClass: 'p-2 w-20',
                tdClass: 'p-2 font-body-3-highlight',
                nowrap: true,
            } satisfies FundColMeta,
            cell: ({ row }) => (
                <span className={row.original.pnl_pct >= 0 ? 'text-green' : 'text-red'}>
                    {row.original.pnl_pct >= 0 ? '+' : ''}
                    {formatNumberVN(row.original.pnl_pct)}%
                </span>
            ),
        },
    ];

    useEffect(() => {
        if (!selected && filtered.length > 0) {
            const initial = filtered.reduce(
                (max, r) => (r.weight_pct > max.weight_pct ? r : max),
                filtered[0],
            );
            setSelected(initial);
        }
    }, [filtered, selected]);

    return (
        <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
            <div className="flex shrink-0 items-center gap-2">
                <FundInputSearch
                    value={search}
                    onChange={setSearch}
                    placeholder={trans.fund.portfolio.search_placeholder}
                    aria-label={trans.fund.portfolio.search_placeholder}
                />
                <FundDropdown
                    options={sectorOptions}
                    value={sectorFilter}
                    onChange={setSectorFilter}
                    allLabel={trans.fund.investor.filter.all_sectors}
                    ariaLabel={trans.fund.portfolio.sector_filter_list_aria}
                />
            </div>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 lg:flex-row lg:gap-2">
                <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl bg-secondary lg:flex-[3_1_0%]">
                    <div className="scrollbar flex min-h-0 flex-1 flex-col overflow-auto">
                        <FundTable
                            data={data}
                            columns={columns}
                            defaultSorting={[{ id: 'wt', desc: true }]}
                            getRowKey={(r) => r.ma_ck}
                            onRowClick={(r) => setSelected(r)}
                            caption={trans.fund.portfolio.columns.symbol}
                            rowClassName={(r) => (selected?.ma_ck === r.ma_ck ? 'bg-success' : '')}
                        />
                    </div>
                </div>
                <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl bg-secondary p-4 lg:flex-[2_1_0%]">
                    <div className="scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
                        <FundStockDetail stock={selected} />
                    </div>
                </div>
            </div>
        </section>
    );
};
