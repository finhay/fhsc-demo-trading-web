import { FundCard } from '@/components/quan-ly-quy/common/FundCard';
import { useTranslate } from '@/hooks/useTranslate';
import { useFundDataStore } from '@/stores/fund/useFundDataStore';
import { formatNumberVN, formatNumberVNWithUnit } from '@/utils/format';

export const FundOverviewCard = () => {
    const trans = useTranslate();
    const { investorRows } = useFundDataStore();

    const totalAUM = investorRows.reduce((s, i) => s + i.nav, 0);
    const totalCash = investorRows.reduce((s, i) => s + i.cash, 0);
    const totalCapital = investorRows.reduce((s, i) => s + i.von_uy_thac_vnd, 0);

    const totalPnl = totalAUM - totalCapital;
    const totalReturn = totalCapital > 0 ? ((totalAUM - totalCapital) / totalCapital) * 100 : 0;
    const cashPctAum = totalAUM > 0 ? (totalCash / totalAUM) * 100 : 0;

    return (
        <section
            aria-label={trans.fund.overview.aum}
            className="flex shrink-0 flex-wrap gap-2 [&>*]:w-[calc(50%-0.25rem)] lg:[&>*]:w-[calc(25%-0.375rem)]"
        >
            <FundCard
                label={trans.fund.overview.aum}
                value={formatNumberVNWithUnit(totalAUM)}
                sub={
                    <span>
                        <span className="text-green">
                            {totalReturn >= 0 ? '+' : ''}
                            {formatNumberVN(totalReturn)}%
                        </span>{' '}
                        {trans.fund.overview.aum_change_hint}
                    </span>
                }
            />
            <FundCard
                label={trans.fund.overview.investors_count}
                value={String(investorRows.length)}
            />
            <FundCard
                label={trans.fund.overview.cash}
                value={formatNumberVNWithUnit(totalCash)}
                sub={
                    <span>
                        {trans.fund.overview.cash_equiv_aum}{' '}
                        <span className="font-body-3-highlight text-primary">
                            {formatNumberVN(cashPctAum)}%
                        </span>{' '}
                        AUM
                    </span>
                }
            />
            <FundCard
                label={trans.fund.overview.monthly_return}
                value={formatNumberVNWithUnit(totalPnl)}
                valueClassName={totalPnl >= 0 ? 'text-green' : 'text-red'}
                sub={
                    <span className={totalReturn >= 0 ? 'text-green' : 'text-red'}>
                        {totalReturn >= 0 ? '+' : ''}
                        {formatNumberVN(totalReturn)}% AUM
                    </span>
                }
            />
        </section>
    );
};
