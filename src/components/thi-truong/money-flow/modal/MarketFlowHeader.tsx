'use client';

import { MarketDot } from '@/components/thi-truong/shared/MarketDot';
import { useTranslate } from '@/hooks/useTranslate';
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
    const trans = useTranslate();

    const title =
        activeTab === 'foreign'
            ? trans.market.flow.modal.title_foreign
            : trans.market.flow.modal.title_proprietary;

    const buyValue = toTradingFlowBillions(stats?.total_buy_value ?? 0);
    const sellValue = toTradingFlowBillions(stats?.total_sell_value ?? 0);
    const netValue = toTradingFlowBillions(stats?.delta_buy_sell ?? 0);

    return (
        <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
            <h2 id="dialog-title" className="font-body-1-highlight text-primary truncate">
                {title}
            </h2>
            {stats && (
                <div className="bg-secondary flex shrink-0 items-center gap-6 rounded-full px-4 py-2">
                    <div className="flex items-center gap-2">
                        {activeTab === 'foreign' && <MarketDot />}
                        <span className="font-body-3-highlight text-primary">
                            {trans.market.flow.modal.today}
                        </span>
                    </div>
                    <span className="h-4 w-px bg-quaternary" aria-hidden />
                    <div className="flex items-center gap-6">
                        <span className="font-body-3 text-secondary">
                            {trans.market.flow.modal.buy_value}:{' '}
                            <span className="font-body-3-highlight text-green">
                                {formatNumberVN(buyValue, { decimals: 2 })} tỷ
                            </span>
                        </span>
                        <span className="font-body-3 text-secondary">
                            {trans.market.flow.modal.sell_value}:{' '}
                            <span className="font-body-3-highlight text-red">
                                {formatNumberVN(sellValue, { decimals: 2 })} tỷ
                            </span>
                        </span>
                        <span className="font-body-3 text-secondary">
                            {trans.market.flow.modal.net_value}:{' '}
                            <span
                                className={`font-body-3-highlight ${getNetColor(stats.delta_buy_sell ?? 0)}`}
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
