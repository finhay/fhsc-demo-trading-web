import { FundCard } from '@/components/quan-ly-quy/common/FundCard';
import { useTranslate } from '@/hooks/useTranslate';
import { useFundDataStore } from '@/stores/fund/useFundDataStore';
import { formatNumberVN, formatNumberVNWithUnit } from '@/utils/format';

export const FundPortfolioCard = () => {
    const trans = useTranslate();
    const { portfolioSummary, investorRows } = useFundDataStore();

    const totalValue = portfolioSummary.reduce((s, r) => s + r.current_value, 0);
    const totalCost = portfolioSummary.reduce((s, r) => s + r.total_kl * r.weighted_avg_cost, 0);
    const totalPnl = totalValue - totalCost;
    const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

    const totalCash = investorRows.reduce((s, i) => s + i.cash, 0);
    const totalAUM = investorRows.reduce((s, i) => s + i.nav, 0);
    const cashPct = totalAUM > 0 ? (totalCash / totalAUM) * 100 : 0;

    return (
        <section
            aria-label={trans.fund.portfolio.summary.total_value}
            className="flex shrink-0 flex-wrap gap-2 [&>*]:w-full md:[&>*]:w-[calc(33.333%-0.334rem)]"
        >
            <FundCard
                label={trans.fund.portfolio.summary.total_value}
                value={formatNumberVNWithUnit(totalValue)}
            />
            <FundCard
                label={trans.fund.portfolio.summary.total_pnl}
                value={`${totalPnl >= 0 ? '+' : ''}${formatNumberVNWithUnit(totalPnl)}`}
                valueClassName={totalPnl >= 0 ? 'text-green' : 'text-red'}
                sub={
                    <span className={totalPnlPct >= 0 ? 'text-green' : 'text-red'}>
                        {totalPnlPct >= 0 ? '+' : ''}
                        {formatNumberVN(totalPnlPct)}%
                    </span>
                }
            />
            <FundCard
                label={trans.fund.portfolio.summary.cash_available}
                value={formatNumberVNWithUnit(totalCash)}
                sub={
                    <span>
                        {trans.fund.overview.cash_equiv_aum}{' '}
                        <span className="font-body-3-highlight text-primary">
                            {formatNumberVN(cashPct)}%
                        </span>{' '}
                        AUM
                    </span>
                }
            />
        </section>
    );
};
