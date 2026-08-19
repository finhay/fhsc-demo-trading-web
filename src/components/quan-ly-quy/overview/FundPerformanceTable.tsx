import { EmptyState } from '@/components/common/feature/EmptyState';
import { useTranslate } from '@/hooks/useTranslate';
import { formatNumberVN, formatNumberVNWithUnit } from '@/utils/format';
import type { SectorPerformance } from '@/utils/fund/fund';

type Props = {
    rows: SectorPerformance[];
};

export const FundPerformanceTable = ({ rows }: Props) => {
    const trans = useTranslate();

    return (
        <section
            className="flex h-full flex-col gap-2 rounded-xl bg-secondary p-4"
            aria-label={trans.fund.overview.sector_performance.title}
        >
            <h3 className="font-body-2-highlight shrink-0 text-primary">
                {trans.fund.overview.sector_performance.title}
            </h3>
            {rows.length === 0 ? (
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-2 py-6">
                    <EmptyState />
                </div>
            ) : (
                <div className="scrollbar flex-1 overflow-auto min-h-0">
                    <table
                        className="w-full min-w-72 border-separate border-spacing-0"
                        aria-label={trans.fund.overview.sector_performance.title}
                    >
                        <thead className="sticky top-0 z-10 bg-secondary">
                            <tr className="font-caption-highlight text-tertiary">
                                <th
                                    scope="col"
                                    className="border-b border-tertiary bg-secondary pb-2 text-left"
                                >
                                    {trans.fund.overview.sector_performance.columns.sector}
                                </th>
                                <th
                                    scope="col"
                                    className="border-b border-tertiary bg-secondary pb-2 text-right"
                                >
                                    {trans.fund.overview.sector_performance.columns.investor_count}
                                </th>
                                <th
                                    scope="col"
                                    className="border-b border-tertiary bg-secondary pb-2 text-right"
                                >
                                    {trans.fund.overview.sector_performance.columns.nav}
                                </th>
                                <th
                                    scope="col"
                                    className="border-b border-tertiary bg-secondary pb-2 text-right"
                                >
                                    {trans.fund.overview.sector_performance.columns.return_pct}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr
                                    key={row.sector}
                                    className="[&>td]:border-b [&>td]:border-tertiary"
                                >
                                    <td className="py-2 font-body-3-highlight text-primary">
                                        {row.sector}
                                    </td>
                                    <td className="py-2 text-right font-body-3 text-secondary">
                                        {row.investor_count}
                                    </td>
                                    <td className="py-2 text-right font-body-3 text-secondary">
                                        {formatNumberVNWithUnit(row.nav)}
                                    </td>
                                    <td
                                        className={`py-2 text-right font-body-3-highlight ${
                                            row.return_pct >= 0 ? 'text-green' : 'text-red'
                                        }`}
                                    >
                                        {row.return_pct >= 0 ? '+' : ''}
                                        {formatNumberVN(row.return_pct)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
};
