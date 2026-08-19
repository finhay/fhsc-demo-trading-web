import { useEffect, useState } from 'react';

import { FundImportStep } from '@/components/quan-ly-quy/import/FundImportStep';
import { FundInvestorDone } from '@/components/quan-ly-quy/import/investor/FundInvestorDone';
import { FundInvestorPreview } from '@/components/quan-ly-quy/import/investor/FundInvestorPreview';
import { FundInvestorUpload } from '@/components/quan-ly-quy/import/investor/FundInvestorUpload';
import { FundTradeDone } from '@/components/quan-ly-quy/import/trade/FundTradeDone';
import { FundTradePreview } from '@/components/quan-ly-quy/import/trade/FundTradePreview';
import { FundTradeUpload } from '@/components/quan-ly-quy/import/trade/FundTradeUpload';
import {
    INVESTOR_IMPORT_STEPS,
    INVESTOR_STEP_KEYS,
    TRADE_IMPORT_STEPS,
    TRADE_STEP_KEYS,
} from '@/constants/fund';
import { useTranslate } from '@/hooks/useTranslate';
import { useFundDataStore } from '@/stores/fund/useFundDataStore';
import { useFundInvestorStore } from '@/stores/fund/useFundInvestorStore';
import { useFundTradeStore } from '@/stores/fund/useFundTradeStore';
import type { FundImportTab, ImportSource } from '@/types/pages/fund';
import { getStepStates } from '@/utils/fund/fund';

type Props = {
    initialTab?: FundImportTab;
    initialSource?: ImportSource;
};

export const FundImport = ({ initialTab = 'investor', initialSource = 'file' }: Props) => {
    const trans = useTranslate();
    const { investorRows } = useFundDataStore();
    const hasInvestors = investorRows.length > 0;

    const [activeTab, setActiveTab] = useState<FundImportTab>(() =>
        initialTab === 'trade' && investorRows.length === 0 ? 'investor' : initialTab,
    );

    const { step: tradeStep, resetStore: resetTrade } = useFundTradeStore();
    const { step: investorStep, resetStore: resetInvestor } = useFundInvestorStore();

    const isTrade = activeTab === 'trade';
    const currentStep = isTrade ? tradeStep : investorStep;
    const steps = isTrade ? TRADE_IMPORT_STEPS : INVESTOR_IMPORT_STEPS;
    const stepKeys = isTrade ? TRADE_STEP_KEYS : INVESTOR_STEP_KEYS;
    const stepStates = getStepStates(stepKeys, steps, currentStep);
    const isDone = currentStep === 'done';

    const switchImportTab = (tab: FundImportTab) => {
        if (tab === 'trade' && !hasInvestors) return;
        setActiveTab(tab);
        if (tab === 'trade') resetTrade();
        else resetInvestor();
    };

    useEffect(() => {
        setActiveTab(initialTab === 'trade' && !hasInvestors ? 'investor' : initialTab);
    }, [initialTab]);

    useEffect(() => {
        if (activeTab === 'trade' && !hasInvestors) {
            setActiveTab('investor');
        }
    }, [activeTab, hasInvestors]);

    return (
        <section className="flex min-h-0 min-w-0 w-full flex-1 flex-col gap-2 overflow-hidden">
            <div
                className="flex shrink-0 gap-1 rounded-xl bg-secondary p-1"
                role="tablist"
                aria-label={trans.fund.import.tab_investor}
            >
                {(['investor', 'trade'] as const).map((key) => {
                    const disabled = key === 'trade' && !hasInvestors;
                    return (
                        <button
                            key={key}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === key}
                            aria-controls={`tabpanel-${key}`}
                            id={`tab-${key}`}
                            title={disabled ? trans.fund.import.tab_trade_disabled_hint : undefined}
                            disabled={disabled}
                            onClick={() => switchImportTab(key)}
                            className={`flex-1 rounded-full py-2 font-body-3-highlight transition-colors ${
                                disabled
                                    ? 'cursor-not-allowed opacity-45 text-tertiary'
                                    : activeTab === key
                                      ? 'bg-highlight text-quaternary'
                                      : 'text-secondary hover:bg-quaternary/40 hover:text-primary'
                            }`}
                        >
                            {key === 'investor'
                                ? trans.fund.import.tab_investor
                                : trans.fund.import.tab_trade}
                        </button>
                    );
                })}
            </div>
            {!hasInvestors && (
                <aside className="shrink-0 rounded-xl bg-blue/10 px-3 py-2 font-caption text-blue">
                    {trans.fund.import.tab_trade_disabled_hint}
                </aside>
            )}
            {!isDone && <FundImportStep steps={steps} stepStates={stepStates} />}
            {activeTab === 'trade' && (
                <div
                    id="tabpanel-trade"
                    role="tabpanel"
                    aria-labelledby="tab-trade"
                    className="flex min-h-0 min-w-0 flex-1 flex-col gap-2"
                >
                    {tradeStep === 'upload' && (
                        <FundTradeUpload
                            prefillSource={initialTab === 'trade' ? initialSource : 'file'}
                        />
                    )}
                    {tradeStep === 'preview' && <FundTradePreview />}
                    {tradeStep === 'done' && <FundTradeDone />}
                </div>
            )}
            {activeTab === 'investor' && (
                <div
                    id="tabpanel-investor"
                    role="tabpanel"
                    aria-labelledby="tab-investor"
                    className="flex min-h-0 min-w-0 flex-1 flex-col gap-2"
                >
                    {investorStep === 'upload' && (
                        <FundInvestorUpload
                            prefillSource={initialTab === 'investor' ? initialSource : 'file'}
                        />
                    )}
                    {investorStep === 'preview' && <FundInvestorPreview />}
                    {investorStep === 'done' && <FundInvestorDone />}
                </div>
            )}
        </section>
    );
};
