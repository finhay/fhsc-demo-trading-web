'use client';

import Image from 'next/image';

import { Dialog } from '@/components/common/ui/Dialog';
import { MarketFundSummary } from '@/components/thi-truong/assets/fund/MarketFundSummary';
import { MarketFundUniverse } from '@/components/thi-truong/assets/fund/MarketFundUniverse';
import { MarketFundDetail } from '@/components/thi-truong/assets/fund/detail/MarketFundDetail';
import { MarketFundTable } from '@/components/thi-truong/assets/fund/table/MarketFundTable';
import { AUTH_MODE } from '@/constants/auth';
import { FUND_UNIVERSE_BG_URL } from '@/constants/market';
import { useTranslate } from '@/hooks/useTranslate';
import { useAuthFlowStore } from '@/stores/auth/useAuthFlowStore';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useMarketFundStore } from '@/stores/fund/useMarketFundStore';
import type { FundCertificateItem } from '@/types/pages/fund';

type Props = {
    certificates: FundCertificateItem[];
};

export const MarketFundModal = ({ certificates }: Props) => {
    const trans = useTranslate();
    const { profile } = useAuthStore();
    const { openAuthDialog } = useAuthFlowStore();
    const {
        selectedFundName,
        summary,
        topInvestor,
        topAum,
        topFundFlow,
        closeModal,
        backToSummary,
        selectFund,
    } = useMarketFundStore();

    const handleSelectFund = (fundName: string) => {
        if (!profile) {
            openAuthDialog(AUTH_MODE.LOGIN);
            return;
        }
        selectFund(fundName);
    };

    return (
        <Dialog
            onClose={closeModal}
            onBack={selectedFundName ? () => backToSummary() : undefined}
            title={
                selectedFundName
                    ? trans.market.assets.fund_modal.detail.title
                    : trans.market.assets.fund_modal.title
            }
            maxWidth="max-w-7xl"
            maxHeight="h-[90vh]"
            panelClassName="bg-primary"
            headerClassName="p-4"
            bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
            {selectedFundName ? (
                <MarketFundDetail />
            ) : (
                <div className="scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto">
                    <div className="shrink-0 px-4">
                        <MarketFundSummary summary={summary} />
                    </div>
                    <div className="relative shrink-0 overflow-visible">
                        <div className="pointer-events-none absolute inset-0 overflow-hidden">
                            <Image
                                src={FUND_UNIVERSE_BG_URL}
                                alt=""
                                fill
                                priority
                                className="object-cover object-top"
                                aria-hidden
                            />
                            <div
                                aria-hidden
                                className="absolute inset-0 bg-gradient-to-r from-primary via-transparent to-primary"
                            />
                            <div
                                aria-hidden
                                className="absolute -left-16 top-0 size-72 rounded-full bg-yellow opacity-20 blur-2xl"
                            />
                        </div>
                        <div className="relative z-10 overflow-visible px-4">
                            <MarketFundUniverse
                                certificates={certificates}
                                topInvestor={topInvestor}
                                topAum={topAum}
                                topFundFlow={topFundFlow}
                                onSelectFund={handleSelectFund}
                            />
                        </div>
                    </div>
                    <div className="relative z-10 -mt-12 shrink-0 px-4">
                        <MarketFundTable
                            certificates={certificates}
                            onSelectFund={handleSelectFund}
                        />
                    </div>
                </div>
            )}
        </Dialog>
    );
};
