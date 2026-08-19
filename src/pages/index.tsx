'use client';

import { useMemo } from 'react';

import { InputSearch } from '@/components/common/feature/InputSearch';
import { StockDetailModal } from '@/components/common/modal/StockDetailModal';
import { MarketGlobalIndex } from '@/components/thi-truong/MarketGlobalIndex';
import { MarketHeatmap } from '@/components/thi-truong/MarketHeatmap';
import { MarketLiquidity } from '@/components/thi-truong/MarketLiquidity';
import { MarketAssets } from '@/components/thi-truong/assets/MarketAssets';
import { MarketCurrency } from '@/components/thi-truong/currency/MarketCurrency';
import { MarketIndex } from '@/components/thi-truong/index/MarketIndex';
import { MarketDetailModal } from '@/components/thi-truong/index/modal/MarketDetailModal';
import { MarketMacro } from '@/components/thi-truong/macro/MarketMacro';
import { MarketFlow } from '@/components/thi-truong/money-flow/MarketFlow';
import { MarketPerspective } from '@/components/thi-truong/perspective/MarketPerspective';
import { MarketWatchlist } from '@/components/thi-truong/watchlist/MarketWatchlist';
import { DefaultLayout } from '@/layouts/DefaultLayout';
import { useMarketIndexStore } from '@/stores/common/useMarketIndexStore';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';
import type { StocksInfoV2Item } from '@/types/datafeed/stock-info';
import { buildMarketPageTitle } from '@/utils/common';

export default function Home() {
    const { exchange, data } = useMarketIndexStore();
    const {
        isOpenDetailModal,
        detailModalType,
        detailIndex,
        openStockDetail,
        openIndexDetail,
        closeStockDetail,
    } = useStockInfoStore();
    const pageTitle = useMemo(
        () =>
            buildMarketPageTitle({
                exchange,
                marketIndexes: data ?? [],
                pageSuffix: 'Thị trường',
                fallbackTitle: 'Thị trường',
            }),
        [exchange, data],
    );

    const handleSelectStock = (stock: StocksInfoV2Item) => {
        openStockDetail(stock.symbol);
    };

    return (
        <DefaultLayout title={pageTitle} metaDescription={pageTitle}>
            <article className="w-full flex flex-col gap-5 bg-primary">
                <div className="flex w-full flex-col gap-2 xl:flex-row xl:items-stretch">
                    <div className="flex w-full flex-col xl:w-80 xl:shrink-0 xl:min-w-0 2xl:w-96 2xl:flex-none">
                        <MarketIndex />
                    </div>
                    <div className="relative min-h-0 min-w-0 flex-1">
                        <div className="flex flex-col gap-2 xl:absolute xl:inset-0">
                            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
                                <MarketHeatmap />
                            </div>
                            <MarketFlow />
                        </div>
                    </div>
                    <aside className="relative flex w-full flex-col gap-2 xl:w-96 xl:shrink-0 2xl:w-96">
                        <div className="flex flex-col gap-2 xl:absolute xl:inset-0">
                            <div className="relative z-20 shrink-0">
                                <InputSearch
                                    variant="pill"
                                    className="w-full"
                                    placeholder={'Tìm kiếm mã'}
                                    includeIndices
                                    onSelectIndex={openIndexDetail}
                                    onSelectStock={handleSelectStock}
                                    inputId="market-home-stock-search"
                                />
                            </div>
                            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
                                <div className="shrink-0">
                                    <MarketLiquidity />
                                </div>
                                <div className="shrink-0">
                                    <MarketPerspective />
                                </div>
                                <div className="flex min-h-80 flex-col overflow-hidden xl:min-h-0 xl:flex-1">
                                    <MarketWatchlist />
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-px w-6 shrink-0 bg-tertiary" aria-hidden="true" />
                        <h2 className="shrink-0 font-body-2-highlight text-primary">
                            {'Toàn cảnh thị trường'}
                        </h2>
                        <div className="h-px min-w-0 flex-1 bg-tertiary" aria-hidden="true" />
                    </div>
                    <div className="flex flex-col gap-2 xl:grid xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] xl:items-stretch 2xl:grid 2xl:grid-cols-[minmax(0,2.5fr)_minmax(0,2fr)_minmax(0,1.5fr)] 2xl:items-stretch 2xl:gap-2">
                        <div className="relative min-h-0 min-w-0 overflow-hidden 2xl:overflow-visible">
                            <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden rounded-xl bg-secondary p-4 xl:absolute xl:inset-0 2xl:static 2xl:gap-3 2xl:overflow-visible">
                                <div className="shrink-0">
                                    <MarketGlobalIndex />
                                </div>
                                <MarketAssets />
                            </div>
                        </div>
                        <div className="flex min-h-0 min-w-0 flex-col gap-2 2xl:contents">
                            <div className="shrink-0">
                                <MarketMacro />
                            </div>
                            <div className="min-h-0 xl:flex-1">
                                <MarketCurrency />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <p className="font-body-3 text-tertiary">
                        {
                            '* Hiệu suất được tính dựa trên dữ liệu quá khứ, không phản ánh hiệu suất tương lai'
                        }
                    </p>
                    <p className="font-body-3 text-tertiary">
                        {
                            '* Các nội dung trên chỉ cung cấp thông tin, không nhằm mục đích kinh doanh hoặc tư vấn tài chính, đầu tư, thuế, pháp lý, kế toán hay tư vấn khác.'
                        }
                    </p>
                    <p className="font-body-3 text-tertiary">
                        {'* Nguồn dữ liệu từ FiinPro và các đơn vị cung cấp thông tin khác.'}
                    </p>
                </div>
            </article>
            {isOpenDetailModal &&
                (detailModalType === 'index' && detailIndex ? (
                    <MarketDetailModal onClose={closeStockDetail} />
                ) : (
                    <StockDetailModal onClose={closeStockDetail} />
                ))}
        </DefaultLayout>
    );
}
