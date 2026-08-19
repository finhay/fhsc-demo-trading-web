'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { FaChevronDown, FaChevronLeft, FaChevronUp, FaCircleInfo } from 'react-icons/fa6';

import { Spinner } from '@/components/common/ui/Spinner';
import { Tooltip } from '@/components/common/ui/Tooltip';
import { HaybondHistoryDynamic } from '@/components/haybond/flexible-ownership-detail/HaybondHistoryDynamic';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { fetchHayBondPackagesDynamic } from '@/services/api/bond-enterprise/packages';
import {
    fetchHayBondDynamicFlexibleSummary,
    fetchHayBondDynamicSavingBondOwnership,
    fetchHayBondDynamicSavingBooksDetail,
} from '@/services/api/bond-enterprise/saving-books';
import { useHaybondFlexStore } from '@/stores/haybond/useHaybondFlexStore';
import type { HaybondPackageItem } from '@/types/bond-enterprise/packages';
import type {
    HaybondBondOwnershipItem,
    HaybondFlexibleSummaryData,
    HaybondInvestmentDetailData,
} from '@/types/bond-enterprise/saving-books';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';
import { formatDate, formatNumberVN, formatTimeString } from '@/utils/format';

export const HaybondFlexibleOwnershipDetail = () => {
    const trans = useTranslate();
    const router = useRouter();
    const {
        isOverlayLoading,
        setPackage,
        openBuy: openFlexibleBuy,
        openSell: openFlexibleSell,
    } = useHaybondFlexStore();
    const [data, setData] = useState<HaybondInvestmentDetailData | null>(null);
    const [summary, setSummary] = useState<HaybondFlexibleSummaryData | null>(null);
    const [bonds, setBonds] = useState<HaybondBondOwnershipItem[]>([]);
    const [packages, setPackages] = useState<HaybondPackageItem[]>([]);
    const [tab, setTab] = useState<'TTDT' | 'TTTP'>('TTDT');
    const [showMoreTotalInterest, setShowMoreTotalInterest] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleWithdraw = () => {
        if (summary?.canSell) {
            openFlexibleSell();
        }
    };

    const handleOpenBuy = () => {
        const pkg = packages[0];
        if (!pkg) return;
        setPackage({ id: pkg.id, name: pkg.name, interest_rate: pkg.interest_rate });
        openFlexibleBuy(pkg.id);
    };

    const fetchAll = async () => {
        setIsLoading(true);
        try {
            const [bondsRes, detailRes, summaryRes, packagesRes] = await Promise.all([
                fetchHayBondDynamicSavingBondOwnership(),
                fetchHayBondDynamicSavingBooksDetail(),
                fetchHayBondDynamicFlexibleSummary(),
                fetchHayBondPackagesDynamic(),
            ]);
            if (isSuccessApi(bondsRes.error_code)) {
                setBonds(bondsRes.data ?? []);
            }
            if (isSuccessApi(detailRes.error_code)) {
                setData(detailRes.data);
            } else {
                toast.error(detailRes.message);
            }
            if (isSuccessApi(summaryRes.error_code)) {
                setSummary(summaryRes.data);
            } else {
                toast.error(summaryRes.message);
            }
            if (isSuccessApi(packagesRes.error_code)) {
                setPackages(packagesRes.data ?? []);
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.haybond.something_went_wrong));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    return (
        <div className="flex h-full min-h-0 w-full flex-col gap-2">
            <Spinner isLoading={isLoading || isOverlayLoading} />
            <div className="flex shrink-0 items-center gap-3">
                <button
                    type="button"
                    className="text-primary cursor-pointer"
                    onClick={() => router.back()}
                >
                    <FaChevronLeft size={16} />
                </button>
                <h3 className="font-heading-4 text-primary">{trans.haybond.owning_detail}</h3>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-2">
                <div className="flex shrink-0 items-center gap-2">
                    <div className="flex w-80 shrink-0 items-center">
                        <span className="font-body-2-highlight text-secondary">
                            {trans.haybond.overview}
                        </span>
                    </div>
                    {data ? (
                        <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                            <span className="font-body-2-highlight text-secondary">
                                {trans.haybond.detail_info}
                            </span>
                            <div className="bg-secondary flex gap-1 rounded-full p-1">
                                <button
                                    type="button"
                                    className={`font-body-3-highlight cursor-pointer rounded-full px-4 py-0.5 ${
                                        tab === 'TTDT'
                                            ? 'bg-green text-quaternary'
                                            : 'text-tertiary'
                                    }`}
                                    onClick={() => setTab('TTDT')}
                                >
                                    {trans.haybond.invest_info}
                                </button>
                                <button
                                    type="button"
                                    className={`font-body-3-highlight cursor-pointer rounded-full px-4 py-0.5 ${
                                        tab === 'TTTP'
                                            ? 'bg-green text-quaternary'
                                            : 'text-tertiary'
                                    }`}
                                    onClick={() => setTab('TTTP')}
                                >
                                    {trans.haybond.bond_info}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="min-w-0 flex-1" />
                    )}
                </div>
                <div className="flex min-h-0 flex-1 gap-2">
                    <aside className="flex w-80 shrink-0 flex-col gap-2 min-h-0">
                        <div className="bg-secondary flex flex-col gap-3 rounded p-3">
                            <div className="flex items-center justify-between">
                                <span className="font-caption text-secondary">
                                    {trans.haybond.invest_amount}
                                </span>
                                <div className="flex items-center gap-1">
                                    <span className="font-caption text-secondary">
                                        {trans.haybond.current_profit}
                                    </span>
                                    <Tooltip
                                        variant="light"
                                        content={
                                            <div className="flex max-w-xs flex-col gap-1 p-1">
                                                <span className="font-body-3-highlight text-quaternary">
                                                    {trans.haybond.gross_profit.title}
                                                </span>
                                                <span className="font-caption text-quaternary whitespace-pre-line">
                                                    {trans.haybond.gross_profit.content}
                                                </span>
                                            </div>
                                        }
                                    >
                                        <FaCircleInfo
                                            size={16}
                                            className="text-secondary cursor-pointer"
                                        />
                                    </Tooltip>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-body-2-highlight text-primary">
                                    {formatNumberVN(summary?.totalSavingAmount ?? 0, {
                                        decimals: 0,
                                    })}
                                    {trans.haybond.currency_unit}
                                </span>
                                <span className="font-body-2-highlight text-green">
                                    {formatNumberVN(summary?.totalEstimatedInterest ?? 0, {
                                        decimals: 0,
                                    })}
                                    {trans.haybond.currency_unit}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                {packages.length > 0 && (
                                    <button
                                        type="button"
                                        className="bg-highlight text-quaternary font-body-2-highlight flex-1 cursor-pointer rounded-full py-2"
                                        onClick={handleOpenBuy}
                                    >
                                        {trans.haybond.buy_more}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className={`font-body-2-highlight text-quaternary flex-1 rounded-full py-2 ${
                                        summary?.canSell
                                            ? 'bg-red cursor-pointer'
                                            : 'bg-gray cursor-not-allowed'
                                    }`}
                                    onClick={handleWithdraw}
                                    disabled={!summary?.canSell}
                                >
                                    {trans.haybond.withdraw}
                                </button>
                            </div>
                        </div>
                        <HaybondHistoryDynamic />
                    </aside>
                    {data && (
                        <section className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
                            {tab === 'TTDT' && (
                                <div className="flex flex-col gap-2">
                                    <div className="bg-secondary flex flex-col gap-6 rounded p-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="font-body-3 text-secondary shrink-0">
                                                {trans.haybond.yield_rate}
                                            </span>
                                            <span className="font-body-3-highlight text-primary text-right">
                                                {`~${formatNumberVN(data.interestRate * 100, { decimals: 2, trimTrailingZeros: true })}%/${trans.haybond.year}`}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="font-body-3 text-secondary shrink-0">
                                                {trans.haybond.holding_period}
                                            </span>
                                            <span className="font-body-3-highlight text-primary text-right">
                                                {trans.haybond.flexible_no_term}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-secondary flex flex-col gap-6 rounded p-3">
                                        <span className="font-body-2-highlight text-secondary">
                                            {trans.haybond.since_start}
                                        </span>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="font-body-3 text-secondary shrink-0">
                                                {trans.haybond.start_date}
                                            </span>
                                            <span className="font-body-3-highlight text-primary text-right">
                                                {formatTimeString(data.startDate)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="font-body-3 text-secondary shrink-0">
                                                {trans.haybond.total_invested}
                                            </span>
                                            <span className="font-body-3-highlight text-primary text-right">
                                                {`${formatNumberVN(data.totalInvestmentAmount, { decimals: 0 })}${trans.haybond.currency_unit}`}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="font-body-3 text-secondary shrink-0">
                                                {trans.haybond.total_withdrawn}
                                            </span>
                                            <span className="font-body-3-highlight text-primary text-right">
                                                {`${formatNumberVN(data.totalWithdrawAmount, { decimals: 0 })}${trans.haybond.currency_unit}`}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <button
                                                type="button"
                                                className="flex w-full cursor-pointer items-center justify-between"
                                                onClick={() =>
                                                    setShowMoreTotalInterest(!showMoreTotalInterest)
                                                }
                                            >
                                                <span className="font-body-3 text-secondary flex items-center gap-2">
                                                    {trans.haybond.total_net_profit}
                                                    {showMoreTotalInterest ? (
                                                        <FaChevronUp size={12} />
                                                    ) : (
                                                        <FaChevronDown size={12} />
                                                    )}
                                                </span>
                                                <span className="font-body-3-highlight text-primary">
                                                    {formatNumberVN(data.totalReceivedInterest, {
                                                        decimals: 0,
                                                    })}
                                                    {trans.haybond.currency_unit}
                                                </span>
                                            </button>
                                            {showMoreTotalInterest && (
                                                <>
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-body-3 text-secondary">
                                                                {trans.haybond.coupon}
                                                            </span>
                                                            <Tooltip
                                                                variant="light"
                                                                content={
                                                                    <div className="flex max-w-xs flex-col gap-1 p-1">
                                                                        <span className="font-body-3-highlight text-quaternary">
                                                                            {trans.haybond.coupon}
                                                                        </span>
                                                                        <span className="font-caption text-quaternary whitespace-pre-line">
                                                                            {
                                                                                trans.haybond
                                                                                    .coupon_received_tip
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                }
                                                            >
                                                                <FaCircleInfo
                                                                    size={16}
                                                                    className="text-secondary cursor-pointer"
                                                                />
                                                            </Tooltip>
                                                        </div>
                                                        <span className="font-body-3-highlight text-primary">
                                                            {`${formatNumberVN(data.totalCouponAmount, { decimals: 0 })}${trans.haybond.currency_unit}`}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-body-3 text-secondary">
                                                                {trans.haybond.buy_sell_spread}
                                                            </span>
                                                            <Tooltip
                                                                variant="light"
                                                                content={
                                                                    <div className="flex max-w-xs flex-col gap-1 p-1">
                                                                        <span className="font-body-3-highlight text-quaternary">
                                                                            {
                                                                                trans.haybond
                                                                                    .spread_info
                                                                                    .title
                                                                            }
                                                                        </span>
                                                                        <span className="font-caption text-quaternary whitespace-pre-line">
                                                                            {
                                                                                trans.haybond
                                                                                    .spread_info
                                                                                    .content
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                }
                                                            >
                                                                <FaCircleInfo
                                                                    size={16}
                                                                    className="text-secondary cursor-pointer"
                                                                />
                                                            </Tooltip>
                                                        </div>
                                                        <span className="font-body-3-highlight text-primary">
                                                            {`${formatNumberVN(data.deltaBuySellAmount, { decimals: 0 })}${trans.haybond.currency_unit}`}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="font-body-3 text-secondary shrink-0">
                                                {trans.haybond.pending_sell_cash}
                                            </span>
                                            <span className="font-body-3-highlight text-primary text-right">
                                                {`${formatNumberVN(data.pendingSaleAmount, { decimals: 0 })}${trans.haybond.currency_unit}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {tab === 'TTTP' && (
                                <div className="flex flex-col gap-2">
                                    {bonds.map((bond) => (
                                        <div
                                            key={bond.bondId}
                                            className="bg-secondary flex flex-col gap-6 rounded p-3"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="font-body-3 text-secondary shrink-0">
                                                    {trans.haybond.bond_symbol}
                                                </span>
                                                <span className="font-body-3-highlight text-primary text-right">
                                                    {`${bond.symbol}`}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="font-body-3 text-secondary shrink-0">
                                                    {trans.haybond.owned_qty}
                                                </span>
                                                <span className="font-body-3-highlight text-primary text-right">
                                                    {formatNumberVN(
                                                        Number(bond.totalOwnershipQuantity),
                                                        { decimals: 0 },
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="font-body-3 text-secondary shrink-0">
                                                    {trans.haybond.pending_qty}
                                                </span>
                                                <span className="font-body-3-highlight text-primary text-right">
                                                    {formatNumberVN(
                                                        Number(bond.totalPendingQuantity),
                                                        { decimals: 0 },
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="font-body-3 text-secondary shrink-0">
                                                    {trans.haybond.owned_value}
                                                </span>
                                                <span className="font-body-3-highlight text-primary text-right">
                                                    {`${formatNumberVN(Number(bond.totalOwnershipAmount), { decimals: 0 })}${trans.haybond.currency_unit}`}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="font-body-3 text-secondary shrink-0">
                                                    {trans.haybond.coupon_received}
                                                </span>
                                                <span className="font-body-3-highlight text-primary text-right">
                                                    {`${formatNumberVN(Number(bond.totalCouponReceived), { decimals: 0 })}${trans.haybond.currency_unit}`}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="font-body-3 text-secondary shrink-0">
                                                    {trans.haybond.coupon_pending}
                                                </span>
                                                <span className="font-body-3-highlight text-primary text-right">
                                                    {`${formatNumberVN(Number(bond.totalCouponPending), { decimals: 0 })}${trans.haybond.currency_unit}${
                                                        bond.totalCouponPending
                                                            ? ` (${trans.haybond.expected_settle_date} ${formatDate(bond.estimateCouponReceiveDate)})`
                                                            : ''
                                                    }`}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};
