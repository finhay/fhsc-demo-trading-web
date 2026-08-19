'use client';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { MarketDot } from '@/components/thi-truong/shared/MarketDot';
import type { ForeignTradingStatsData } from '@/types/datafeed/trading-data';
import { getNetColor } from '@/utils/common';
import { formatNumberVN } from '@/utils/format';
import { toTradingFlowBillions } from '@/utils/market/market-flow';

type Props = {
    stats: ForeignTradingStatsData | null;
    showDot?: boolean;
    isLoading?: boolean;
};

export const MarketFlowStats = ({ stats, showDot = false, isLoading = false }: Props) => {
    const buyValue = toTradingFlowBillions(stats?.total_buy_value ?? 0);
    const sellValue = toTradingFlowBillions(stats?.total_sell_value ?? 0);
    const netValue = toTradingFlowBillions(Math.abs(stats?.delta_buy_sell ?? 0));

    const renderValue = (value: string, colorClass: string) =>
        isLoading ? (
            <span className="flex h-4 items-center md:h-6">
                <span className="block h-3 w-14">
                    <Skeleton />
                </span>
            </span>
        ) : (
            <span className={`font-body-3-highlight ${colorClass}`}>{value}</span>
        );

    return (
        <div className="border-tertiary flex min-w-0 flex-1 flex-col gap-4 rounded-xl border p-4">
            {!stats && !isLoading ? (
                <EmptyState />
            ) : (
                <>
                    <div className="flex w-full flex-col gap-3">
                        <div className="flex items-center gap-1">
                            <div className="flex items-center gap-2">
                                {showDot && <MarketDot />}
                                <span className="font-body-3-highlight text-primary">{'GTGD'}</span>
                            </div>
                            <span className="font-body-3 text-tertiary">({'tỷ đồng'})</span>
                        </div>
                        <div className="flex w-full items-center gap-6">
                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                                <span className="font-body-3 text-secondary">{'Mua'}</span>
                                {renderValue(
                                    formatNumberVN(buyValue, { decimals: 2 }),
                                    'text-green',
                                )}
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                                <span className="font-body-3 text-secondary">{'Bán'}</span>
                                {renderValue(
                                    formatNumberVN(sellValue, { decimals: 2 }),
                                    'text-red',
                                )}
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                                <span className="font-body-3 text-secondary">{'Ròng'}</span>
                                {renderValue(
                                    formatNumberVN(netValue, { decimals: 2 }),
                                    getNetColor(stats?.delta_buy_sell ?? 0),
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="bg-tertiary h-px w-full" />
                    <div className="flex w-full flex-col gap-3">
                        <div className="flex items-center gap-1">
                            <div className="flex items-center gap-2">
                                {showDot && <MarketDot />}
                                <span className="font-body-3-highlight text-primary">{'KLGD'}</span>
                            </div>
                            <span className="font-body-3 text-tertiary">({'cp'})</span>
                        </div>
                        <div className="flex w-full items-center gap-6">
                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                                <span className="font-body-3 text-secondary">{'Mua'}</span>
                                {renderValue(
                                    formatNumberVN(stats?.total_buy_volume ?? 0, { decimals: 0 }),
                                    'text-green',
                                )}
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                                <span className="font-body-3 text-secondary">{'Bán'}</span>
                                {renderValue(
                                    formatNumberVN(stats?.total_sell_volume ?? 0, { decimals: 0 }),
                                    'text-red',
                                )}
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                                <span className="font-body-3 text-secondary">{'Ròng'}</span>
                                {renderValue(
                                    formatNumberVN(Math.abs(stats?.delta_volume ?? 0), {
                                        decimals: 0,
                                    }),
                                    getNetColor(stats?.delta_volume ?? 0),
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
