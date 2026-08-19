import { type ColumnDef } from '@tanstack/react-table';

import Image from 'next/image';

import { MarketFundTableSortCaret } from '@/components/thi-truong/assets/fund/table/MarketFundTableSortCaret';
import { MarketFundTableTwoLineHeader } from '@/components/thi-truong/assets/fund/table/MarketFundTableTwoLineHeader';
import {
    PROFIT_PERIOD_ONE_YEAR,
    PROFIT_PERIOD_THREE_YEARS,
    PROFIT_PERIOD_YEAR_TO_DATE,
} from '@/constants/market';
import type { FundCertificateItem, FundTableColMeta } from '@/types/pages/fund';
import { formatNumberVN } from '@/utils/format';
import {
    formatFundPercent,
    getFundValueColor,
    getLatestNav,
    getProfitByPeriod,
} from '@/utils/market/market-fund';

type ProfitColumnConfig = {
    id: string;
    period: string;
    line1: string;
    line2: string;
};

const createColMeta = (align: 'left' | 'right', widthClass: string): FundTableColMeta => ({
    align,
    widthClass,
    thClass: 'px-0 py-0',
    tdClass: 'px-0 py-0',
});

const createProfitColumn = ({
    id,
    period,
    line1,
    line2,
}: ProfitColumnConfig): ColumnDef<FundCertificateItem> => ({
    id,
    accessorFn: (row) => getProfitByPeriod(row, period) ?? undefined,
    sortUndefined: 'last',
    header: ({ column }) => (
        <button
            type="button"
            className="inline-flex w-full items-center justify-end gap-1 font-body-3 text-secondary"
            onClick={column.getToggleSortingHandler()}
        >
            <MarketFundTableTwoLineHeader line1={line1} line2={line2} />
            <MarketFundTableSortCaret sorted={column.getIsSorted()} />
        </button>
    ),
    meta: createColMeta('right', 'w-1/6'),
    cell: ({ row }) => {
        const value = getProfitByPeriod(row.original, period);
        return (
            <span className={`font-body-2 ${getFundValueColor(value)}`}>
                {formatFundPercent(value)}
            </span>
        );
    },
});

export const getMarketFundTableColumns = (): ColumnDef<FundCertificateItem>[] => {
    return [
        {
            id: 'fund',
            accessorKey: 'name',
            enableSorting: false,
            header: () => (
                <span className="inline-flex flex-col items-start leading-5">
                    <span>{'Quỹ/'}</span>
                    <span>{'Tổ chức phát hành'}</span>
                </span>
            ),
            meta: createColMeta('left', 'w-1/3'),
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="flex cursor-pointer items-center gap-4">
                        {item.image_url ? (
                            <Image
                                src={item.image_url}
                                alt={item.name}
                                width={40}
                                height={40}
                                className="bg-quinary size-10 shrink-0 rounded-full object-cover"
                            />
                        ) : (
                            <div className="bg-tertiary size-10 shrink-0 rounded-full" />
                        )}
                        <div className="flex flex-col gap-1">
                            <span className="font-body-2-highlight text-primary">{item.name}</span>
                            <span className="font-body-3 text-secondary">
                                {item.fund_company_management_short_name}
                            </span>
                        </div>
                    </div>
                );
            },
        },
        {
            id: 'nav',
            accessorFn: (row) => getLatestNav(row).navpf,
            enableSorting: false,
            header: () => 'Giá gần nhất',
            meta: createColMeta('right', 'w-1/6'),
            cell: ({ row }) => {
                const { navpf, date } = getLatestNav(row.original);
                return (
                    <div className="flex flex-col items-end gap-1">
                        <span className="font-body-2 text-primary">
                            {navpf == null ? '--' : formatNumberVN(navpf, { decimals: 2 })}
                        </span>
                    </div>
                );
            },
        },
        createProfitColumn({
            id: 'profit_3y',
            period: PROFIT_PERIOD_THREE_YEARS,
            line1: 'LNTB',
            line2: '3 năm',
        }),
        createProfitColumn({
            id: 'profit_1y',
            period: PROFIT_PERIOD_ONE_YEAR,
            line1: 'LNTB',
            line2: '1 năm',
        }),
        createProfitColumn({
            id: 'profit_ytd',
            period: PROFIT_PERIOD_YEAR_TO_DATE,
            line1: 'LNTB',
            line2: 'từ đầu năm',
        }),
    ];
};
