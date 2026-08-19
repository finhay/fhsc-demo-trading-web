'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { FaChevronLeft, FaCircleCheck, FaCircleInfo, FaRegCircle } from 'react-icons/fa6';

import { Spinner } from '@/components/common/ui/Spinner';
import { Tooltip } from '@/components/common/ui/Tooltip';
import { BTN_ORDERS_HISTORIES } from '@/constants/haybond';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { fetchHayBondOrdersDetail } from '@/services/api/bond-enterprise/orders';
import type { HaybondOrderDetailData } from '@/types/bond-enterprise/orders';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';
import { formatDate, formatNumberVN } from '@/utils/format';

export const HaybondOrderDetail = () => {
    const trans = useTranslate();
    const router = useRouter();
    const { id } = router.query;
    const [data, setData] = useState<HaybondOrderDetailData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const getTextStatus = (status: string, sellEarly: boolean) => {
        if (sellEarly) return trans.haybond.early_sell_order_detail;
        switch (status) {
            case BTN_ORDERS_HISTORIES.KEY_SUCCESS:
                return trans.haybond.success_order_detail;
            case BTN_ORDERS_HISTORIES.KEY_CANCELED:
                return trans.haybond.rejected_order_detail;
            default:
                return trans.haybond.processing_order_detail;
        }
    };

    const getTextEndProgress = (status: string, type: string) => {
        if (status === BTN_ORDERS_HISTORIES.KEY_CANCELED) {
            return trans.haybond.reject;
        }
        if (type === 'SELL') {
            return trans.haybond.sell_success;
        }
        return trans.haybond.invest_success;
    };

    const getTextCouponAmount = () => {
        if (!data) return '';
        if (data.coupon_amount === 0) {
            return data.estimate_date_receive_coupon == null
                ? trans.haybond.no_coupon
                : `0${trans.haybond.currency_unit}`;
        }
        return `${formatNumberVN(data.coupon_amount, { decimals: 0 })}${trans.haybond.currency_unit}`;
    };

    const renderProgress = (status: string) => {
        const done = <FaCircleCheck size={24} className="text-green" />;
        const divider = <div className="bg-quaternary h-px w-24" />;
        if (status === BTN_ORDERS_HISTORIES.KEY_SUCCESS) {
            return (
                <>
                    {done}
                    {divider}
                    {done}
                    {divider}
                    {done}
                </>
            );
        }
        if (status === BTN_ORDERS_HISTORIES.KEY_CANCELED) {
            return (
                <>
                    {done}
                    {divider}
                    {done}
                    {divider}
                    <FaCircleInfo size={24} className="text-red" />
                </>
            );
        }
        return (
            <>
                {done}
                {divider}
                {done}
                {divider}
                <FaRegCircle size={24} className="text-tertiary" />
            </>
        );
    };

    const fetchDetail = async () => {
        if (!id || typeof id !== 'string') return;
        setIsLoading(true);
        try {
            const { error_code, message, data: detail } = await fetchHayBondOrdersDetail(id);
            if (isSuccessApi(error_code)) {
                setData(detail);
            } else {
                toast.error(message);
                router.push('/haybond');
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.haybond.something_went_wrong));
            router.push('/haybond');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (router.isReady) {
            fetchDetail();
        }
    }, [router.isReady, id]);

    return (
        <div className="flex h-full min-h-0 w-full flex-col gap-2">
            <Spinner isLoading={isLoading} />
            <div className="flex shrink-0 items-center gap-3">
                <button
                    type="button"
                    className="text-primary cursor-pointer"
                    onClick={() => router.back()}
                >
                    <FaChevronLeft size={16} />
                </button>
                <h3 className="font-heading-4 text-primary">
                    {data ? getTextStatus(data.order_status, data.sell_early) : ''}
                </h3>
            </div>
            {!isLoading && data && (
                <div className="flex min-h-0 flex-1 gap-2">
                    <aside className="flex w-80 shrink-0 flex-col gap-2">
                        <span className="font-body-2-highlight text-secondary">
                            {trans.haybond.overview}
                        </span>
                        <div className="bg-secondary flex flex-col gap-3 rounded p-3">
                            <div className="flex items-center justify-between">
                                <span className="font-caption text-secondary">
                                    {trans.haybond.amount}
                                </span>
                                <div className="flex items-center gap-1">
                                    <span className="font-caption text-secondary">
                                        {trans.haybond.profit_before_fee}
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
                                    {formatNumberVN(data.total_amount, { decimals: 0 })}
                                    {trans.haybond.currency_unit}
                                </span>
                                <span className="font-body-2-highlight text-green">
                                    {formatNumberVN(data.gross_profit, { decimals: 0 })}
                                    {trans.haybond.currency_unit}
                                </span>
                            </div>
                            <div className="bg-primary h-px w-full" />
                            <div className="flex items-center justify-center gap-1">
                                {renderProgress(data.order_status)}
                            </div>
                            <div className="flex items-center justify-center gap-16">
                                <span className="font-caption text-primary text-center">
                                    {data.order_side === 'SELL'
                                        ? trans.haybond.confirm_sell
                                        : trans.haybond.confirm_invest}
                                </span>
                                <span className="font-caption text-primary text-center">
                                    {trans.haybond.trade_processing}
                                </span>
                                <span className="font-caption text-primary text-center">
                                    {getTextEndProgress(data.order_status, data.order_side)}
                                </span>
                            </div>
                        </div>
                    </aside>
                    <section className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
                        <span className="font-body-2-highlight text-secondary">
                            {trans.haybond.detail_info}
                        </span>
                        <div className="bg-secondary flex flex-col gap-6 rounded p-3">
                            <div className="flex items-center justify-between gap-3">
                                <span className="font-body-3 text-secondary shrink-0">
                                    {trans.haybond.yield_rate}
                                </span>
                                <span className="font-body-3-highlight text-primary text-right">
                                    {`~${formatNumberVN(
                                        (data.sell_early
                                            ? data.end_early_interest_rate
                                            : data.interest_rate) * 100,
                                        { decimals: 2, trimTrailingZeros: true },
                                    )}%/${trans.haybond.year}`}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="font-body-3 text-secondary shrink-0">
                                    {trans.haybond.invest_code}
                                </span>
                                <span className="font-body-3-highlight text-primary text-right">
                                    {data.symbol}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="font-body-3 text-secondary shrink-0">
                                    {trans.haybond.holding_period}
                                </span>
                                <span className="font-body-3-highlight text-primary text-right">
                                    {`${data.term.term} ${data.term.term_name}`}
                                </span>
                            </div>
                            {data.estimate_date_receive_coupon && (
                                <div className="flex items-center justify-between gap-3">
                                    <span className="font-body-3 text-secondary shrink-0">
                                        {trans.haybond.coupon_pay_date}
                                    </span>
                                    <span className="font-body-3-highlight text-primary text-right">
                                        {formatDate(data.estimate_date_receive_coupon)}
                                    </span>
                                </div>
                            )}
                        </div>
                        {data.order_status !== BTN_ORDERS_HISTORIES.KEY_CANCELED && (
                            <>
                                <div className="bg-secondary flex flex-col gap-6 rounded p-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="font-body-3 text-secondary shrink-0">
                                            {trans.haybond.interest_start_date}
                                        </span>
                                        <span className="font-body-3-highlight text-primary text-right">
                                            {formatDate(data.start)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="font-body-3 text-secondary shrink-0">
                                            {trans.haybond.expected_end_date}
                                        </span>
                                        <span className="font-body-3-highlight text-primary text-right">
                                            {formatDate(data.end_date)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="font-body-3 text-secondary shrink-0">
                                            {trans.haybond.order_time}
                                        </span>
                                        <span className="font-body-3-highlight text-primary text-right">
                                            {formatDate(data.order_date)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="font-body-3 text-secondary shrink-0">
                                            {trans.haybond.interest_days}
                                        </span>
                                        <span className="font-body-3-highlight text-primary text-right">
                                            {`${data.days_in_periods} ${
                                                data.days_in_periods > 1
                                                    ? trans.haybond.days
                                                    : trans.haybond.day
                                            }`}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-secondary flex flex-col gap-6 rounded p-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="font-body-3 text-secondary shrink-0">
                                            {trans.haybond.profit_before_fee}
                                        </span>
                                        <span className="font-body-3-highlight text-primary text-right">
                                            {`${formatNumberVN(data.gross_profit, { decimals: 0 })}${trans.haybond.currency_unit}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-1">
                                            <span className="font-body-3 text-secondary">
                                                {trans.haybond.sell_fee}
                                            </span>
                                            <Tooltip
                                                variant="light"
                                                content={
                                                    <div className="flex max-w-xs flex-col gap-1 p-1">
                                                        <span className="font-body-3-highlight text-quaternary">
                                                            {trans.haybond.fee.title}
                                                        </span>
                                                        <span className="font-caption text-quaternary whitespace-pre-line">
                                                            {trans.haybond.fee.content}
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
                                            {`${formatNumberVN(data.fee, { decimals: 0 })}${trans.haybond.currency_unit}`}
                                        </span>
                                    </div>
                                    {data.tax !== 0 && (
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-1">
                                                <span className="font-body-3 text-secondary">
                                                    {trans.haybond.sell_tax}
                                                </span>
                                            </div>
                                            <span className="font-body-3-highlight text-primary">
                                                {`${formatNumberVN(data.tax, { decimals: 0 })}${trans.haybond.currency_unit}`}
                                            </span>
                                        </div>
                                    )}
                                    <div className="border-tertiary my-1 border-t" />
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="font-body-3 text-secondary shrink-0">
                                            {trans.haybond.net_profit}
                                        </span>
                                        <span className="font-body-3-highlight text-primary text-right">
                                            {`${formatNumberVN(
                                                data.gross_profit - (data.fee + data.tax),
                                                { decimals: 0 },
                                            )}${trans.haybond.currency_unit}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-1">
                                            <span className="font-body-3 text-secondary">
                                                Coupon
                                            </span>
                                            <Tooltip
                                                variant="light"
                                                content={
                                                    <div className="flex max-w-xs flex-col gap-1 p-1">
                                                        <span className="font-body-3-highlight text-quaternary">
                                                            {trans.haybond.coupon_info.title}
                                                        </span>
                                                        <span className="font-caption text-quaternary whitespace-pre-line">
                                                            {trans.haybond.coupon_info.content}
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
                                            {getTextCouponAmount()}
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
                                                            {trans.haybond.spread_info.title}
                                                        </span>
                                                        <span className="font-caption text-quaternary whitespace-pre-line">
                                                            {trans.haybond.spread_info.content}
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
                                            {`${formatNumberVN(data.delta_buy_sell, { decimals: 0 })}${trans.haybond.currency_unit}`}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
};
