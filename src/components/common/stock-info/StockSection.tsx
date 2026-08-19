'use client';

import { FC } from 'react';

import { ChartTradingView } from '@/components/common/feature/ChartTradingView';
import { StockInfo } from '@/components/common/stock-info/StockInfo';
import { StockNavigation } from '@/components/common/stock-info/StockNavigation';
import { StockChartPanel } from '@/components/common/stock-info/chart/StockChartPanel';
import { StockEvents } from '@/components/common/stock-info/event/StockEvents';
import { StockFinance } from '@/components/common/stock-info/finance/StockFinance';
import { StockOverview } from '@/components/common/stock-info/overview/StockOverview';
import { StockProfile } from '@/components/common/stock-info/profile/StockProfile';
import { StockStatistics } from '@/components/common/stock-info/statistics/StockStatistics';
import { STOCK_INFO_SECTION_ARIA } from '@/constants/stock-info';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';
import { useTradingStore } from '@/stores/trading/useTradingStore';

type Props = {
    className: string;
    hideChartPanel?: boolean;
    hideFullscreenToggle?: boolean;
    enableIndexSearch?: boolean;
};

export const StockSection: FC<Props> = ({
    className,
    hideChartPanel = false,
    hideFullscreenToggle = false,
    enableIndexSearch = false,
}) => {
    const { selectedStock } = useStockInfoStore();
    const { selectedTabInfor, isChartFullscreen } = useTradingStore();

    return (
        <section className={className} aria-label={STOCK_INFO_SECTION_ARIA.CHART}>
            <div className="flex min-h-0 flex-1 gap-2">
                <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden">
                    <div className="shrink-0">
                        <div className="p-3">
                            <StockInfo enableIndexSearch={enableIndexSearch} />
                        </div>
                        <StockNavigation hideFullscreenToggle={hideFullscreenToggle} />
                    </div>
                    {selectedTabInfor === 'CHART' && (
                        <div className="min-h-0 flex-1">
                            <ChartTradingView symbol={selectedStock?.symbol} />
                        </div>
                    )}
                    {selectedTabInfor !== 'CHART' && (
                        <div className="min-h-0 flex-1 overflow-hidden px-3">
                            {selectedTabInfor === 'OVERVIEW' && <StockOverview />}
                            {selectedTabInfor === 'FINANCE' && <StockFinance />}
                            {selectedTabInfor === 'STATISTICS' && <StockStatistics />}
                            {selectedTabInfor === 'EVENTS' && <StockEvents />}
                            {selectedTabInfor === 'PROFILE' && <StockProfile />}
                        </div>
                    )}
                </div>
                {!hideChartPanel && !isChartFullscreen && <StockChartPanel />}
            </div>
        </section>
    );
};
