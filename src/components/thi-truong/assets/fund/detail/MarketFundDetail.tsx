'use client';

import { useState } from 'react';

import { MarketFundDetailChart } from '@/components/thi-truong/assets/fund/detail/MarketFundDetailChart';
import { MarketFundDetailCompare } from '@/components/thi-truong/assets/fund/detail/MarketFundDetailCompare';
import { MarketFundDetailFeeTab } from '@/components/thi-truong/assets/fund/detail/MarketFundDetailFeeTab';
import { MarketFundDetailHeader } from '@/components/thi-truong/assets/fund/detail/MarketFundDetailHeader';
import { MarketFundDetailInfoTab } from '@/components/thi-truong/assets/fund/detail/MarketFundDetailInfoTab';
import { MarketFundDetailMonthlyStats } from '@/components/thi-truong/assets/fund/detail/MarketFundDetailMonthlyStats';
import { MarketFundDetailTradingInfo } from '@/components/thi-truong/assets/fund/detail/MarketFundDetailTradingInfo';
import { FUND_DETAIL_TABS } from '@/constants/market';
import { useTranslate } from '@/hooks/useTranslate';
import { useMarketFundStore } from '@/stores/fund/useMarketFundStore';
import type { FundDetailTab } from '@/types/pages/fund';
import { getLatestNav } from '@/utils/market/market-fund';

export const MarketFundDetail = () => {
    const trans = useTranslate();
    const d = trans.market.assets.fund_modal.detail;

    const { selectedFundName, detail, listing, navHistories } = useMarketFundStore();

    const [tab, setTab] = useState<FundDetailTab>(FUND_DETAIL_TABS[0]);

    if (!detail || !selectedFundName) return null;

    return (
        <div className="scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-x-hidden overflow-y-auto px-4 pb-4">
            <MarketFundDetailHeader detail={detail} />
            <MarketFundDetailChart
                key={selectedFundName}
                fundName={selectedFundName}
                latestNav={getLatestNav(detail)}
                initialChartData={navHistories}
            />
            <MarketFundDetailMonthlyStats detail={detail} />
            <MarketFundDetailCompare original={detail} />
            <MarketFundDetailTradingInfo detail={detail} />
            <section className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    {FUND_DETAIL_TABS.map((key) => {
                        const isActive = tab === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setTab(key)}
                                className={`px-3 py-1 transition-colors ${
                                    isActive
                                        ? 'font-body-3-highlight text-primary'
                                        : 'font-body-3 text-secondary'
                                }`}
                            >
                                {d.tabs[key]}
                            </button>
                        );
                    })}
                </div>
                {tab === FUND_DETAIL_TABS[0] ? (
                    <MarketFundDetailInfoTab listing={listing} />
                ) : (
                    <MarketFundDetailFeeTab detail={detail} />
                )}
            </section>
        </div>
    );
};
