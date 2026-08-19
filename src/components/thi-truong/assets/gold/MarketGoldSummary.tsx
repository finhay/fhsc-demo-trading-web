'use client';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { useTranslate } from '@/hooks/useTranslate';
import type { GoldItem } from '@/types/datafeed/finance';
import { getChangeColor } from '@/utils/common';
import { formatMetalChangePercent, formatMetalPrice } from '@/utils/market/market-assets';

type Props = {
    items: GoldItem[];
};

export const MarketGoldSummary = ({ items }: Props) => {
    const trans = useTranslate();

    return items.length === 0 ? (
        <div className="flex min-h-32 items-center justify-center rounded-2xl bg-secondary p-4">
            <EmptyState />
        </div>
    ) : (
        <div className="flex gap-3">
            {items.map((item) => {
                const buyChange = formatMetalChangePercent(item.buy_value_change_percent);
                const sellChange = formatMetalChangePercent(item.sell_value_change_percent);

                return (
                    <div
                        key={item.index}
                        className="flex min-w-0 flex-1 flex-col gap-4 rounded-2xl bg-secondary p-4"
                    >
                        <h4 className="font-body-2-highlight text-primary truncate">{item.name}</h4>
                        <div className="flex gap-2">
                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                                <span className="font-body-3 text-secondary">
                                    {trans.market.assets.modal.buy}
                                </span>
                                <div className="flex flex-wrap items-center gap-1">
                                    <span className="font-body-3-highlight text-primary">
                                        {formatMetalPrice(item.buy_value)}
                                    </span>
                                    {buyChange && (
                                        <span
                                            className={`font-body-3 ${getChangeColor(
                                                item.buy_value_change_percent ?? 0,
                                            )}`}
                                        >
                                            {buyChange}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                                <span className="font-body-3 text-secondary">
                                    {trans.market.assets.modal.sell}
                                </span>
                                <div className="flex flex-wrap items-center gap-1">
                                    <span className="font-body-3-highlight text-primary">
                                        {formatMetalPrice(item.sell_value)}
                                    </span>
                                    {sellChange && (
                                        <span
                                            className={`font-body-3 ${getChangeColor(
                                                item.sell_value_change_percent ?? 0,
                                            )}`}
                                        >
                                            {sellChange}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
