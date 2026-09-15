'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { FaArrowTrendDown, FaArrowTrendUp, FaChevronRight } from 'react-icons/fa6';

import { DownloadAppModal } from '@/components/common/modal/DownloadAppModal';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { createChartAllocationPie } from '@/config/assets';
import { ALLOCATION_COLORS } from '@/constants/assets';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import type { AssetAllocationItem, AssetSummaryProps } from '@/types/pages/assets';
import { calcAssetPercent, formatPnlDisplay } from '@/utils/assets';
import { formatNumberVN, formatPercentVN } from '@/utils/format';

type Props = AssetSummaryProps;

export const AssetAllocation = ({ data, isLoading }: Props) => {
    const [isDownloadAppModalOpen, setIsDownloadAppModalOpen] = useState(false);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useEChartsInstance(chartContainerRef);

    const allocationItems: AssetAllocationItem[] = useMemo(() => {
        const product = data?.products;
        const money = data?.money;
        const pnl = data?.pnl;

        const moneyTotal = money?.total ?? 0;
        const stock = product?.stock ?? 0;
        // Demo chỉ có tiền mặt + chứng khoán
        // const hay0 = product?.hay0 ?? 0;
        // const fund = product?.fund ?? 0;
        // const bond = product?.bond ?? 0;
        // const childSavings = product?.child_savings ?? 0;
        const totalAssets = moneyTotal + stock;

        return [
            {
                label: 'Tiền mặt',
                value: formatNumberVN(moneyTotal, { trimTrailingZeros: true }),
                color: ALLOCATION_COLORS.money,
                percentage: calcAssetPercent(moneyTotal, totalAssets),
                pnlChange: null,
            },
            // {
            //     label: 'Hay0',
            //     value: formatNumberVN(hay0, { trimTrailingZeros: true }),
            //     color: ALLOCATION_COLORS.hay0,
            //     percentage: calcAssetPercent(hay0, totalAssets),
            //     pnlChange: null,
            // },
            {
                label: 'Chứng Khoán',
                value: formatNumberVN(stock, { trimTrailingZeros: true }),
                color: ALLOCATION_COLORS.stock,
                percentage: calcAssetPercent(stock, totalAssets),
                pnlChange: formatPnlDisplay(pnl?.stock),
            },
            // {
            //     label: 'Chứng chỉ quỹ',
            //     value: formatNumberVN(fund, { trimTrailingZeros: true }),
            //     color: ALLOCATION_COLORS.fund,
            //     percentage: calcAssetPercent(fund, totalAssets),
            //     pnlChange: formatPnlDisplay(pnl?.fund),
            // },
            // {
            //     label: 'Tích luỹ HayBond',
            //     value: formatNumberVN(bond, { trimTrailingZeros: true }),
            //     color: ALLOCATION_COLORS.bond,
            //     percentage: calcAssetPercent(bond, totalAssets),
            //     pnlChange: null,
            // },
            // {
            //     label: 'Cho con',
            //     value: formatNumberVN(childSavings, { trimTrailingZeros: true }),
            //     color: ALLOCATION_COLORS.childSavings,
            //     percentage: calcAssetPercent(childSavings, totalAssets),
            //     pnlChange: formatPnlDisplay(pnl?.child_savings),
            // },
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

    return (
        <section className="flex flex-col w-full base-secondary rounded-xl p-3 gap-4 shrink-0">
            <header className="flex items-center justify-between gap-2">
                <h2 className="body-3-highlight text-primary">{'Phân bổ tài sản'}</h2>
            </header>
            <div className="flex flex-row gap-6 w-full items-center">
                <div className="w-1/3 shrink-0 flex items-center justify-center">
                    <div ref={chartContainerRef} className="w-60 h-60" />
                </div>
                <ul className="m-0 flex w-2/3 min-w-0 list-none flex-col gap-3 p-0">
                    {allocationItems.map((asset, index) => {
                        const isLastItem = index === allocationItems.length - 1;
                        const changeColorClass = asset.pnlChange?.isUp ? 'text-green' : 'text-red';
                        return (
                            <li key={asset.label} className="flex flex-col gap-3">
                                <article className="flex w-full items-center gap-3">
                                    <span
                                        className="w-3 h-3 rounded-full shrink-0"
                                        style={{ backgroundColor: asset.color }}
                                    />
                                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                        <div className="flex items-center gap-1.5">
                                            <span className="body-4 text-primary">
                                                {asset.label}
                                            </span>
                                            <span className="body-4 text-secondary">
                                                ({formatPercentVN(asset.percentage)})
                                            </span>
                                        </div>
                                        {isLoading ? (
                                            <div className="w-24 h-5">
                                                <Skeleton />
                                            </div>
                                        ) : (
                                            <span className="body-4-highlight text-primary">
                                                {asset.value}
                                            </span>
                                        )}
                                        {asset.pnlChange && (
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1">
                                                    {asset.pnlChange.isUp ? (
                                                        <FaArrowTrendUp
                                                            className={`${changeColorClass} text-xs`}
                                                        />
                                                    ) : (
                                                        <FaArrowTrendDown
                                                            className={`${changeColorClass} text-xs`}
                                                        />
                                                    )}
                                                    <span
                                                        className={`body-5 ${changeColorClass}`}
                                                    >
                                                        {asset.pnlChange.amount}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`body-5 ${changeColorClass}`}
                                                >
                                                    {asset.pnlChange.pct}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <FaChevronRight
                                        size={16}
                                        className="cursor-pointer text-primary shrink-0"
                                        onClick={() => setIsDownloadAppModalOpen(true)}
                                    />
                                </article>
                                {!isLastItem && <hr className="w-full border-0 h-px base-tertiary" />}
                            </li>
                        );
                    })}
                </ul>
            </div>
            {isDownloadAppModalOpen && (
                <DownloadAppModal onClose={() => setIsDownloadAppModalOpen(false)} />
            )}
        </section>
    );
};
