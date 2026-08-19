import { FundPortfolioCard } from '@/components/quan-ly-quy/portfolio/FundPortfolioCard';
import { FundPortfolioTable } from '@/components/quan-ly-quy/portfolio/FundPortfolioTable';

export const FundPortfolio = () => {
    return (
        <section className="flex min-h-full min-w-0 w-full flex-col gap-2">
            <FundPortfolioCard />
            <FundPortfolioTable />
        </section>
    );
};
