import { FundInvestorCard } from '@/components/quan-ly-quy/investor/FundInvestorCard';
import { FundInvestorTable } from '@/components/quan-ly-quy/investor/FundInvestorTable';

export const FundInvestor = () => {
    return (
        <section className="flex min-h-full min-w-0 w-full flex-col gap-2">
            <FundInvestorCard />
            <FundInvestorTable />
        </section>
    );
};
