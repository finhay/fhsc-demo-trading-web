'use client';

import { useMemo } from 'react';

import Image from 'next/image';

import { EmptyState } from '@/components/common/feature/EmptyState';
import type { MetalProviderItem } from '@/types/datafeed/finance';
import { getChangeColor } from '@/utils/common';
import {
    formatMetalChangePercent,
    formatMetalPrice,
    groupMetalProviders,
} from '@/utils/market/market-assets';

type Props = {
    items: MetalProviderItem[];
};

const PriceCell = ({
    price,
    changePercent,
}: {
    price: number;
    changePercent: number | null | undefined;
}) => {
    const changeLabel = formatMetalChangePercent(changePercent);

    return (
        <div className="flex w-28 shrink-0 items-center gap-2">
            <span className="body-4-highlight text-primary whitespace-nowrap">
                {formatMetalPrice(price)}
            </span>
            {changeLabel && (
                <span
                    className={`body-4 whitespace-nowrap ${getChangeColor(
                        changePercent ?? 0,
                    )}`}
                >
                    {changeLabel}
                </span>
            )}
        </div>
    );
};

export const MarketMetalProviders = ({ items }: Props) => {
    const groups = useMemo(() => groupMetalProviders(items), [items]);

    return items.length === 0 ? (
        <div className="flex min-h-32 items-center justify-center rounded-2xl base-secondary p-4">
            <EmptyState />
        </div>
    ) : (
        <div className="base-secondary flex flex-col overflow-hidden rounded-2xl">
            <div className="flex w-full shrink-0 items-center justify-between base-secondary px-4 py-3">
                <span className="body-4 text-secondary min-w-0 flex-1">{'Loại vàng'}</span>
                <span className="body-4 text-secondary w-28 shrink-0">{'Giá mua'}</span>
                <span className="body-4 text-secondary w-28 shrink-0">{'Giá bán'}</span>
            </div>

            <div className="flex flex-col gap-4 px-4 pb-4">
                {groups.map((group, groupIndex) => (
                    <div key={group.provider} className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            {group.providerIcon ? (
                                <Image
                                    src={group.providerIcon}
                                    alt={group.provider}
                                    width={12}
                                    height={12}
                                    className="size-3 shrink-0 rounded-full object-cover"
                                    unoptimized
                                />
                            ) : (
                                <div className="size-3 shrink-0 rounded-full base-tertiary" />
                            )}
                            <span className="body-4-highlight text-secondary whitespace-nowrap">
                                {group.provider}
                            </span>
                        </div>

                        {group.items.map((item) => (
                            <div
                                key={item.index}
                                className="flex w-full items-start justify-between gap-2"
                            >
                                <span className="body-4-highlight text-primary min-w-0 flex-1 truncate">
                                    {item.name}
                                </span>
                                <PriceCell
                                    price={item.buy_value}
                                    changePercent={item.buy_value_change_percent}
                                />
                                <PriceCell
                                    price={item.sell_value}
                                    changePercent={item.sell_value_change_percent}
                                />
                            </div>
                        ))}

                        {groupIndex < groups.length - 1 && (
                            <div className="border-t border-tertiary" aria-hidden="true" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
