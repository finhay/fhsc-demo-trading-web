'use client';

import { useEffect } from 'react';

import { SubAccounts } from '@/components/common/assets/SubAccounts';
import { StockDetailModal } from '@/components/common/modal/StockDetailModal';
import { AssetPnl } from '@/components/tai-san/AssetPnl';
import { AssetStocks } from '@/components/tai-san/AssetStocks';
import { AssetTransactions } from '@/components/tai-san/AssetTransactions';
import { AssetAllocation } from '@/components/tai-san/overview/AssetAllocation';
import { AssetDebt } from '@/components/tai-san/overview/AssetDebt';
import { AssetOverview } from '@/components/tai-san/overview/AssetOverview';
import { AssetPortfolio } from '@/components/tai-san/portfolio/AssetPortfolio';
import { AssetStructure } from '@/components/tai-san/portfolio/AssetStructure';
import { AssetTradeHistory } from '@/components/tai-san/trade-history/AssetTradeHistory';
import { MarketDetailModal } from '@/components/thi-truong/index/modal/MarketDetailModal';
import { useAssetStore } from '@/stores/assets/useAssetStore';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';
import { usePaperAccountStore } from '@/stores/paper-trading/usePaperAccountStore';

export const AssetView = () => {
    const { accountId } = usePaperAccountStore();
    const { assetsSummary, isSummaryLoading, fetchAssetsSummary, fetchPortfolio } = useAssetStore();
    const { isOpenDetailModal, detailModalType, detailIndex, closeStockDetail } =
        useStockInfoStore();

    useEffect(() => {
        if (!accountId) return;
        fetchPortfolio();
        fetchAssetsSummary();
    }, [accountId]);

    return (
        <>
            <article className="flex gap-2 w-full h-full overflow-hidden">
                <section className="flex h-full min-h-0 w-1/3 min-w-96 shrink-0 flex-col gap-2 overflow-y-auto">
                    <AssetOverview data={assetsSummary} isLoading={isSummaryLoading} />
                    <AssetAllocation data={assetsSummary} isLoading={isSummaryLoading} />
                    <AssetDebt />
                    <AssetTransactions />
                </section>
                <section className="flex flex-1 min-w-0 flex-col gap-2 h-full min-h-0 overflow-y-auto">
                    <header className="flex shrink-0 items-center gap-4">
                        <h1 className="font-heading-4 text-primary whitespace-nowrap">
                            {'Danh mục Chứng Khoán'}
                        </h1>
                        <div className="w-64">
                            <SubAccounts variant="embedded" borderClass="border-highlight" />
                        </div>
                    </header>
                    <div className="grid shrink-0 grid-cols-[1fr_2fr] items-stretch gap-2">
                        <AssetStocks />
                        <AssetStructure />
                    </div>
                    <AssetPortfolio />
                    <div className="h-96 shrink-0">
                        <AssetPnl />
                    </div>
                    <AssetTradeHistory />
                </section>
            </article>
            {isOpenDetailModal &&
                (detailModalType === 'index' && detailIndex ? (
                    <MarketDetailModal onClose={closeStockDetail} />
                ) : (
                    <StockDetailModal onClose={closeStockDetail} />
                ))}
        </>
    );
};
