'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { FaArrowTrendDown, FaArrowTrendUp, FaChevronRight } from 'react-icons/fa6';
import { RiTodoLine } from 'react-icons/ri';

import { DownloadAppModal } from '@/components/common/modal/DownloadAppModal';
import { Dialog } from '@/components/common/ui/Dialog';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { createChartAllocationPie } from '@/config/assets';
import { ALLOCATION_COLORS } from '@/constants/assets';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import { useTranslate } from '@/hooks/useTranslate';
import { getLatestMonthlyReport } from '@/services/api/accounts/profile';
import type { AssetAllocationItem, AssetSummaryProps } from '@/types/pages/assets';
import { calcAssetPercent, formatPnlDisplay } from '@/utils/assets';
import { isSuccessApi } from '@/utils/common';
import { formatNumberVN, formatPercentVN } from '@/utils/format';

type Props = AssetSummaryProps;

export const AssetAllocation = ({ data, isLoading }: Props) => {
    const trans = useTranslate();
    const [isDownloadAppModalOpen, setIsDownloadAppModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportUrl, setReportUrl] = useState('');
    const [isLoadingReport, setIsLoadingReport] = useState(false);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useEChartsInstance(chartContainerRef);

    const allocationItems: AssetAllocationItem[] = useMemo(() => {
        const product = data?.products;
        const money = data?.money;
        const pnl = data?.pnl;

        const moneyTotal = money?.total ?? 0;
        const hay0 = product?.hay0 ?? 0;
        const stock = product?.stock ?? 0;
        const fund = product?.fund ?? 0;
        const bond = product?.bond ?? 0;
        const childSavings = product?.child_savings ?? 0;
        const totalAssets = moneyTotal + hay0 + stock + fund + bond + childSavings;

        return [
            {
                label: trans.assets.allocation.money,
                value: formatNumberVN(moneyTotal, { trimTrailingZeros: true }),
                color: ALLOCATION_COLORS.money,
                percentage: calcAssetPercent(moneyTotal, totalAssets),
                pnlChange: null,
            },
            {
                label: trans.assets.allocation.hay0,
                value: formatNumberVN(hay0, { trimTrailingZeros: true }),
                color: ALLOCATION_COLORS.hay0,
                percentage: calcAssetPercent(hay0, totalAssets),
                pnlChange: null,
            },
            {
                label: trans.assets.allocation.stock,
                value: formatNumberVN(stock, { trimTrailingZeros: true }),
                color: ALLOCATION_COLORS.stock,
                percentage: calcAssetPercent(stock, totalAssets),
                pnlChange: formatPnlDisplay(pnl?.stock),
            },
            {
                label: trans.assets.allocation.fund,
                value: formatNumberVN(fund, { trimTrailingZeros: true }),
                color: ALLOCATION_COLORS.fund,
                percentage: calcAssetPercent(fund, totalAssets),
                pnlChange: formatPnlDisplay(pnl?.fund),
            },
            {
                label: trans.assets.allocation.bond,
                value: formatNumberVN(bond, { trimTrailingZeros: true }),
                color: ALLOCATION_COLORS.bond,
                percentage: calcAssetPercent(bond, totalAssets),
                pnlChange: null,
            },
            {
                label: trans.assets.allocation.child_savings,
                value: formatNumberVN(childSavings, { trimTrailingZeros: true }),
                color: ALLOCATION_COLORS.childSavings,
                percentage: calcAssetPercent(childSavings, totalAssets),
                pnlChange: formatPnlDisplay(pnl?.child_savings),
            },
        ];
    }, [data, trans.assets.allocation]);

    const handleOpenReportModal = async () => {
        setIsLoadingReport(true);
        try {
            const { error_code, message, data: reportData } = await getLatestMonthlyReport();
            if (isSuccessApi(error_code)) {
                setReportUrl(reportData);
                setIsReportModalOpen(true);
            } else {
                throw new Error(message);
            }
        } catch {
        } finally {
            setIsLoadingReport(false);
        }
    };

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
        <section className="flex flex-col w-full bg-secondary rounded-xl p-3 gap-4 shrink-0">
            <header className="flex items-center justify-between gap-2">
                <h2 className="font-body-2-highlight text-primary">
                    {trans.assets.allocation.heading}
                </h2>
                <button
                    type="button"
                    onClick={handleOpenReportModal}
                    disabled={isLoadingReport}
                    className="flex items-center gap-2 shrink-0 disabled:opacity-50"
                >
                    <span className="font-body-3 text-highlight whitespace-nowrap">
                        {trans.assets.allocation.report_button}
                    </span>
                    <RiTodoLine className="text-highlight text-base shrink-0" aria-hidden />
                </button>
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
                                            <span className="font-body-3 text-primary">
                                                {asset.label}
                                            </span>
                                            <span className="font-body-3 text-secondary">
                                                ({formatPercentVN(asset.percentage)})
                                            </span>
                                        </div>
                                        {isLoading ? (
                                            <div className="w-24 h-5">
                                                <Skeleton />
                                            </div>
                                        ) : (
                                            <span className="font-body-3-highlight text-primary">
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
                                                        className={`font-caption ${changeColorClass}`}
                                                    >
                                                        {asset.pnlChange.amount}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`font-caption ${changeColorClass}`}
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
                                {!isLastItem && <hr className="w-full border-0 h-px bg-tertiary" />}
                            </li>
                        );
                    })}
                </ul>
            </div>
            {isDownloadAppModalOpen && (
                <DownloadAppModal onClose={() => setIsDownloadAppModalOpen(false)} />
            )}
            {isReportModalOpen && (
                <Dialog
                    title={trans.assets.allocation.report_button}
                    maxWidth="max-w-5xl"
                    maxHeight="h-[70vh]"
                    onClose={() => setIsReportModalOpen(false)}
                >
                    <div className="flex-1 min-h-[70vh]">
                        <object
                            width="100%"
                            height="100%"
                            data={reportUrl}
                            type="application/pdf"
                            aria-label={trans.assets.allocation.report_button}
                        />
                    </div>
                </Dialog>
            )}
        </section>
    );
};
