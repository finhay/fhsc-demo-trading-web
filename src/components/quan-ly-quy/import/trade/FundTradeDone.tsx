import { FaCheck } from 'react-icons/fa6';

import { FUND_TAB } from '@/constants/fund';
import { useTranslate } from '@/hooks/useTranslate';
import { useFundDataStore } from '@/stores/fund/useFundDataStore';
import { useFundTradeStore } from '@/stores/fund/useFundTradeStore';

export const FundTradeDone = () => {
    const trans = useTranslate();
    const { resetStore } = useFundTradeStore();
    const { setActiveTab } = useFundDataStore();

    return (
        <section
            role="status"
            className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-8"
        >
            <span
                className="flex h-14 w-14 items-center justify-center rounded-full border border-green bg-green/10"
                aria-hidden="true"
            >
                <FaCheck size={24} className="text-green" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-2 text-center">
                <h2 className="font-heading-4 text-primary">
                    {trans.fund.import.steps.done.title}
                </h2>
                <p className="font-body-3 text-secondary">
                    {trans.fund.import.steps.done.description}
                </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
                <button
                    type="button"
                    onClick={resetStore}
                    className="inline-flex items-center justify-center rounded-full bg-tertiary px-5 py-2 font-body-3-highlight text-primary transition-colors hover:bg-quaternary"
                >
                    {trans.fund.import.steps.done.import_more}
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab(FUND_TAB.PORTFOLIO)}
                    className="inline-flex items-center justify-center rounded-full bg-highlight px-5 py-2 font-body-3-highlight text-quaternary transition-colors hover:bg-highlight/80"
                >
                    {trans.fund.import.steps.done.view_portfolio}
                </button>
            </div>
        </section>
    );
};
