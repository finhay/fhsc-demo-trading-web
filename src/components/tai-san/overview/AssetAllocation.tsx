'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { FaArrowTrendDown, FaArrowTrendUp, FaChevronDown } from 'react-icons/fa6';

import { Skeleton } from '@/components/common/ui/Skeleton';
import { createChartAllocationPie } from '@/config/assets';
import { ALLOCATION_COLORS } from '@/constants/assets';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import type { AssetAllocationItem, AssetSummaryProps } from '@/types/pages/assets';
import { calcAssetPercent, formatPnlDisplay } from '@/utils/assets';
import { formatNumberVN, formatPercentVN } from '@/utils/format';

type Props = AssetSummaryProps;

type MoneyBreakdown = {
    cash: number;
    dividendCash: number;
};

export const AssetAllocation = ({ data, isLoading }: Props) => {
    const [isMoneyExpanded, setIsMoneyExpanded] = useState(true);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useEChartsInstance(chartContainerRef);

    const moneyBreakdown: MoneyBreakdown = useMemo(() => {
        const moneyTotal = data?.money?.total ?? 0;
        const dividendCash = data?.products?.receivable?.cash ?? 0;
        return {
            dividendCash,
            cash: moneyTotal - dividendCash,
        };
    }, [data]);

    const allocationItems: AssetAllocationItem[] = useMemo(() => {
        const product = data?.products;
        const money = data?.money;
        const pnl = data?.pnl;

        const moneyTotal = money?.total ?? 0;
        const stock = product?.stock ?? 0;
        const totalAssets = moneyTotal + stock;

        return [
            {
                label: 'Tổng tiền',
                value: `${formatNumberVN(moneyTotal, { trimTrailingZeros: true })}đ`,
                color: ALLOCATION_COLORS.money,
                percentage: calcAssetPercent(moneyTotal, totalAssets),
                pnlChange: null,
            },
            {
                label: 'Chứng Khoán',
                value: `${formatNumberVN(stock, { trimTrailingZeros: true })}đ`,
                color: ALLOCATION_COLORS.stock,
                percentage: calcAssetPercent(stock, totalAssets),
                pnlChange: formatPnlDisplay(pnl?.stock),
            },
        ];
    }, [data]);

    useEffect(() => {
        const chartData = allocationItems.map((item) => ({
            name: item.label,
            y: item.percentage,
            color: item.color,
        }));

        chartInstanceRef.current?.setOption(createChartAllocationPie(chartData), {
            notMerge: true,
        });
    }, [allocationItems, chartInstanceRef]);

    const moneyItem = allocationItems[0];
    const stockItem = allocationItems[1];

    return (
        <section className="flex flex-col w-full base-secondary rounded-xl p-3 gap-4 shrink-0">
            <header className="flex items-center justify-between gap-2">
                <h2 className="body-3-highlight text-primary">{'Phân bổ tài sản'}</h2>
            </header>
            <div className="flex flex-row gap-6 w-full items-center">
                <div className="w-1/3 shrink-0 flex items-center justify-center">
                    <div ref={chartContainerRef} className="w-60 h-60" />
                </div>
                <ul className="m-0 flex w-2/3 min-w-0 list-none flex-col gap-4 p-0 py-3">
                    <li className="flex flex-col">
                        <button
                            type="button"
                            onClick={() => setIsMoneyExpanded((prev) => !prev)}
                            className="flex w-full items-center gap-3 text-left"
                            aria-expanded={isMoneyExpanded}
                        >
                            <span
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: moneyItem.color }}
                            />
                            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                <div className="flex items-center gap-3">
                                    <span className="body-4 text-primary">{moneyItem.label}</span>
                                    <span className="body-4 text-secondary">
                                        ({formatPercentVN(moneyItem.percentage)})
                                    </span>
                                </div>
                                {isLoading ? (
                                    <div className="w-24 h-5">
                                        <Skeleton />
                                    </div>
                                ) : (
                                    <span className="body-4-highlight text-primary">
                                        {moneyItem.value}
                                    </span>
                                )}
                            </div>
                            <FaChevronDown
                                size={16}
                                className={`text-primary shrink-0 transition-transform duration-300 ${
                                    isMoneyExpanded ? 'rotate-180' : 'rotate-0'
                                }`}
                            />
                        </button>

                        <div
                            className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                                isMoneyExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                            }`}
                        >
                            <div className="min-h-0 overflow-hidden">
                                <div className="flex flex-col gap-4 pt-4">
                                    <div className="flex w-full items-center gap-3">
                                        <span className="w-3 shrink-0" aria-hidden />
                                        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                            <span className="body-4 text-secondary">
                                                {'Tiền mặt'}
                                            </span>
                                            {isLoading ? (
                                                <div className="w-24 h-5">
                                                    <Skeleton />
                                                </div>
                                            ) : (
                                                <span className="body-4-highlight text-primary">
                                                    {`${formatNumberVN(moneyBreakdown.cash, {
                                                        trimTrailingZeros: true,
                                                    })}đ`}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex w-full items-center gap-3">
                                        <span className="w-3 shrink-0" aria-hidden />
                                        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                            <span className="body-4 text-secondary">
                                                {'Tiền cổ tức chờ về'}
                                            </span>
                                            {isLoading ? (
                                                <div className="w-24 h-5">
                                                    <Skeleton />
                                                </div>
                                            ) : (
                                                <span className="body-4-highlight text-primary">
                                                    {`${formatNumberVN(moneyBreakdown.dividendCash, {
                                                        trimTrailingZeros: true,
                                                    })}đ`}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>

                    <hr className="w-full border-0 h-px base-tertiary" />

                    <li>
                        <article className="flex w-full items-center gap-3">
                            <span
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: stockItem.color }}
                            />
                            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                <div className="flex items-center gap-3">
                                    <span className="body-4 text-primary">{stockItem.label}</span>
                                    <span className="body-4 text-secondary">
                                        ({formatPercentVN(stockItem.percentage)})
                                    </span>
                                </div>
                                {isLoading ? (
                                    <div className="w-24 h-5">
                                        <Skeleton />
                                    </div>
                                ) : (
                                    <span className="body-4-highlight text-primary">
                                        {stockItem.value}
                                    </span>
                                )}
                                {stockItem.pnlChange && (
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            {stockItem.pnlChange.isUp ? (
                                                <FaArrowTrendUp className="text-xs text-green" />
                                            ) : (
                                                <FaArrowTrendDown className="text-xs text-red" />
                                            )}
                                            <span
                                                className={`body-5 ${
                                                    stockItem.pnlChange.isUp
                                                        ? 'text-green'
                                                        : 'text-red'
                                                }`}
                                            >
                                                {stockItem.pnlChange.amount}
                                            </span>
                                        </div>
                                        <span
                                            className={`body-5 ${
                                                stockItem.pnlChange.isUp
                                                    ? 'text-green'
                                                    : 'text-red'
                                            }`}
                                        >
                                            {stockItem.pnlChange.pct}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </article>
                    </li>
                </ul>
            </div>
        </section>
    );
};
