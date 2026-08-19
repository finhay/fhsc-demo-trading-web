import { FundCard } from '@/components/quan-ly-quy/common/FundCard';
import { useTranslate } from '@/hooks/useTranslate';
import { useFundDataStore } from '@/stores/fund/useFundDataStore';
import { formatNumberVN, formatNumberVNWithUnit } from '@/utils/format';

export const FundInvestorCard = () => {
    const trans = useTranslate();
    const { investorRows } = useFundDataStore();

    const totalNav = investorRows.reduce((s, r) => s + r.nav, 0);
    const totalCap = investorRows.reduce((s, r) => s + r.von_uy_thac_vnd, 0);
    const pnl = totalNav - totalCap;
    const ret = totalCap > 0 ? (pnl / totalCap) * 100 : 0;
    const winners = investorRows.filter((r) => r.return_pct > 0).length;
    const losersCount = investorRows.filter((r) => r.return_pct < 0).length;
    const kpis = { totalNav, pnl, ret, winners, losersCount };

    return (
        <section
            aria-label={trans.fund.investor.kpis.total_nav}
            className="flex shrink-0 flex-wrap gap-2 [&>*]:w-[calc(50%-0.25rem)] lg:[&>*]:w-[calc(25%-0.375rem)]"
        >
            <FundCard
                label={trans.fund.investor.kpis.total_nav}
                value={formatNumberVNWithUnit(kpis.totalNav)}
                sub={
                    <span className="text-green">
                        {kpis.ret >= 0 ? '+' : ''}
                        {formatNumberVN(kpis.ret)}%
                    </span>
                }
            />
            <FundCard
                label={trans.fund.investor.kpis.monthly_pnl}
                value={`${kpis.pnl >= 0 ? '+' : ''}${formatNumberVNWithUnit(kpis.pnl)}`}
                valueClassName={kpis.pnl >= 0 ? 'text-green' : 'text-red'}
                sub={
                    <span className={kpis.ret >= 0 ? 'text-green' : 'text-red'}>
                        {kpis.ret >= 0 ? '+' : ''}
                        {formatNumberVN(kpis.ret)}%
                    </span>
                }
            />
            <FundCard
                label={trans.fund.investor.kpis.profitable}
                value={`${kpis.winners} / ${investorRows.length}`}
            />
            <FundCard
                label={trans.fund.investor.kpis.losing}
                value={String(kpis.losersCount)}
                valueClassName="text-red"
            />
        </section>
    );
};
