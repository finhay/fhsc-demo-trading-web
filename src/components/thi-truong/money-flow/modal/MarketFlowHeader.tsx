'use client';

import { MarketDot } from '@/components/thi-truong/shared/MarketDot';
import type { ForeignTradingStatsData } from '@/types/datafeed/trading-data';
import type { TradingFlowTab } from '@/types/pages/market';
import { getNetColor } from '@/utils/common';
import { formatNumberVN } from '@/utils/format';
import { toTradingFlowBillions } from '@/utils/market/market-flow';

type Props = {
    activeTab: TradingFlowTab;
    stats: ForeignTradingStatsData | null;
};

export const MarketFlowHeader = ({ activeTab, stats }: Props) => {
    const title = activeTab === 'foreign' ? 'Giao dịch khối ngoại' : 'Giao dịch tự doanh';

    const buyValue = toTradingFlowBillions(stats?.total_buy_value ?? 0);
    const sellValue = toTradingFlowBillions(stats?.total_sell_value ?? 0);
    const netValue = toTradingFlowBillions(stats?.delta_buy_sell ?? 0);

    return (
        <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
            <h2 id="dialog-title" className="body-2-highlight text-primary truncate">
                {title}
            </h2>
            {stats && (
                <div className="base-secondary flex shrink-0 items-center gap-6 rounded-full px-4 py-2">
                    <div className="flex items-center gap-2">
                        {activeTab === 'foreign' && <MarketDot />}
                        <span className="body-4-highlight text-primary">{'Hôm nay'}</span>
                    </div>
                    <span className="h-4 w-px base-quaternary" aria-hidden />
                    <div className="flex items-center gap-6">
                        <span className="body-4 text-secondary">
                            {'GT mua'}:{' '}
                            <span className="body-4-highlight text-green">
                                {formatNumberVN(buyValue, { decimals: 2 })} tỷ
                            </span>
                        </span>
                        <span className="body-4 text-secondary">
                            {'GT bán'}:{' '}
                            <span className="body-4-highlight text-red">
                                {formatNumberVN(sellValue, { decimals: 2 })} tỷ
                            </span>
                        </span>
                        <span className="body-4 text-secondary">
                            {'GT ròng'}:{' '}
                            <span
                                className={`body-4-highlight ${getNetColor(stats.delta_buy_sell ?? 0)}`}
                            >
                                {formatNumberVN(Math.abs(netValue), { decimals: 2 })} tỷ
                            </span>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
