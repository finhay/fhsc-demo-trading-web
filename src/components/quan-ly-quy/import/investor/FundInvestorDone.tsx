import { FaCheck } from 'react-icons/fa6';

import { FUND_TAB } from '@/constants/fund';
import { useTranslate } from '@/hooks/useTranslate';
import { useFundDataStore } from '@/stores/fund/useFundDataStore';
import { useFundInvestorStore } from '@/stores/fund/useFundInvestorStore';

export const FundInvestorDone = () => {
    const trans = useTranslate();
    const { resetStore, importedCount } = useFundInvestorStore();
    const { setActiveTab } = useFundDataStore();

    return (
        <section
            role="status"
            className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-8"
        >
            <div
                className="flex h-16 w-16 items-center justify-center rounded-full bg-green/10"
                aria-hidden="true"
            >
                <FaCheck size={32} className="text-green" />
            </div>
            <div className="flex flex-col gap-2 text-center">
                <h2 className="font-heading-4 text-primary">
                    {trans.fund.import.import_investor.done.title}
                </h2>
                <p className="font-body-3 text-secondary">
                    {trans.fund.import.import_investor.done.description_fn(importedCount)}
                </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
                <button
                    type="button"
                    onClick={resetStore}
                    className="inline-flex items-center justify-center rounded-full bg-tertiary px-5 py-2 font-body-3-highlight text-primary transition-colors hover:bg-quaternary"
                >
                    {trans.fund.import.import_investor.done.import_more}
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab(FUND_TAB.CLIENTS)}
                    className="inline-flex items-center justify-center rounded-full bg-highlight px-5 py-2 font-body-3-highlight text-quaternary transition-colors hover:bg-highlight/80"
                >
                    {trans.fund.import.import_investor.done.view_clients}
                </button>
            </div>
        </section>
    );
};
