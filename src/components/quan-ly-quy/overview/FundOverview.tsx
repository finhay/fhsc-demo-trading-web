import { FundOverviewCard } from '@/components/quan-ly-quy/overview/FundOverviewCard';
import { FundPerformanceChart } from '@/components/quan-ly-quy/overview/FundPerformanceChart';
import { FundPerformanceTable } from '@/components/quan-ly-quy/overview/FundPerformanceTable';
import { FundTopInvestorsTable } from '@/components/quan-ly-quy/overview/FundTopInvestorsTable';
import { useFundDataStore } from '@/stores/fund/useFundDataStore';
import { calcSectorPerformance } from '@/utils/fund/fund';

export const FundOverview = () => {
    const { investorRows, holdings, prices, investors } = useFundDataStore();

    const sectorPerf = calcSectorPerformance(
        investors.length ? investors : investorRows,
        holdings,
        prices,
    );

    const topInvestors = [...investorRows]
        .filter((r) => r.nav - r.von_uy_thac_vnd > 0)
        .sort((a, b) => b.nav - b.von_uy_thac_vnd - (a.nav - a.von_uy_thac_vnd))
        .slice(0, 3);

    return (
        <section className="flex h-full min-h-0 w-full min-w-0 flex-col gap-2">
            <FundOverviewCard />
            <div className="flex min-h-0 flex-1 flex-col gap-2">
                <div className="flex min-h-0 flex-1 gap-2">
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                        <FundPerformanceChart />
                    </div>
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                        <FundPerformanceTable rows={sectorPerf} />
                    </div>
                </div>
                <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                    <FundTopInvestorsTable rows={topInvestors} />
                </div>
            </div>
        </section>
    );
};
