'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import dayjs from 'dayjs';
import { FaBell, FaChevronLeft, FaCircleInfo, FaFileLines } from 'react-icons/fa6';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Dialog } from '@/components/common/ui/Dialog';
import { Spinner } from '@/components/common/ui/Spinner';
import { Tooltip } from '@/components/common/ui/Tooltip';
import { HaybondListCommand } from '@/components/haybond/shared/HaybondListCommand';
import { MQTT } from '@/constants/common';
import { BTN_OWNERSHIP_HISTORIES, CASH_HISTORY_TYPES } from '@/constants/haybond';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import {
    fetchHayBondSavingBooksClosing,
    fetchHayBondSavingBooksClosingPreview,
    fetchHayBondSavingBooksDetail,
    getAgreements,
} from '@/services/api/bond-enterprise/saving-books';
import { useHaybondStore } from '@/stores/haybond/useHaybondStore';
import type { HaybondAgreementItem } from '@/types/bond-enterprise/packages';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';
import { formatDate, formatNumberVN } from '@/utils/format';

export const HaybondOwnershipDetail = () => {
    const trans = useTranslate();
    const router = useRouter();
    const { id } = router.query;
    const [isLoading, setIsLoading] = useState(true);
    const [agreements, setAgreements] = useState<HaybondAgreementItem[]>([]);
    const [isAgreementsOpen, setIsAgreementsOpen] = useState(false);
    const {
        dataDetailSaving,
        isOverlayLoading,
        setDataDetailSaving,
        setDataClosing,
        setIsOverlayLoading,
        openSell: openTermSell,
    } = useHaybondStore();
    const hasDetail = !!dataDetailSaving.symbol || !!dataDetailSaving.start;

    const getWidthProgress = (startDate: string, endDate: string) => {
        const newStartDate = dayjs(startDate);
        const newEndDate = dayjs(endDate);
        const today = dayjs();
        const totalDuration = newEndDate.diff(newStartDate, 'day') + 1;
        const elapsedDuration = Math.min(today.diff(newStartDate, 'day') + 1, totalDuration);
        const percentageElapsed = (elapsedDuration / totalDuration) * MQTT.PERCENTAGE_CONVERSION;
        return `${Math.min(Math.max(percentageElapsed, 0), 100)}%`;
    };

    const getTextStatus = (status: string) => {
        if (status === BTN_OWNERSHIP_HISTORIES.KEY_CLOSED) {
            return trans.haybond.ended_detail;
        }
        return trans.haybond.owning_detail;
    };

    const getTextName = (type: string, name = '') => {
        const number = name.replace(/\D/g, '');
        switch (type) {
            case CASH_HISTORY_TYPES.BUY:
                return trans.haybond.buy_bond;
            case CASH_HISTORY_TYPES.SELL:
                return trans.haybond.sell_bond;
            default:
                return `${trans.haybond.receive_coupon} ${number} ${trans.haybond.times}`;
        }
    };

    const getTextCouponAmount = () => {
        if (dataDetailSaving.coupon_amount !== 0) {
            return `${formatNumberVN(dataDetailSaving.coupon_amount, { decimals: 0 })}${trans.haybond.currency_unit}`;
        }
        return dataDetailSaving.estimate_date_receive_coupon == null
            ? trans.haybond.no_coupon
            : `0${trans.haybond.currency_unit}`;
    };

    const getTimeSaving = () => {
        if (dataDetailSaving.sell_early) {
            const dayText =
                dataDetailSaving.days_in_period > 1 ? trans.haybond.days : trans.haybond.day;
            return `${dataDetailSaving.days_in_period} ${dayText}`;
        }
        return `${dataDetailSaving.term.term} ${dataDetailSaving.term.term_name}`;
    };

    const fetchAgreementsData = async (savingId: string) => {
        try {
            const { data } = await getAgreements(savingId);
            const payload = data as { agreement_data?: HaybondAgreementItem[] };
            if (payload?.agreement_data) {
                setAgreements(payload.agreement_data);
            }
        } catch {}
    };

    const fetchDetail = async () => {
        if (!id || typeof id !== 'string') return;
        setIsLoading(true);
        try {
            const [dataDetail, dataClosing] = await Promise.all([
                fetchHayBondSavingBooksDetail(id),
                fetchHayBondSavingBooksClosing(id),
            ]);
            if (isSuccessApi(dataDetail.error_code)) {
                setDataDetailSaving({
                    ...dataDetail.data,
                    allow_close: dataClosing.data?.allow_close ?? false,
                });
                setDataClosing({ id });
                fetchAgreementsData(id);
            } else {
                toast.error(dataDetail.message);
                router.push('/haybond');
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.haybond.something_went_wrong));
            router.push('/haybond');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenSellEarly = async () => {
        if (!dataDetailSaving.allow_close || !id || typeof id !== 'string') return;
        setIsOverlayLoading(true);
        try {
            const { error_code, message, data } = await fetchHayBondSavingBooksClosingPreview(id);
            if (isSuccessApi(error_code)) {
                setDataClosing({
                    id,
                    name: data.package_info.name,
                    start_date: data.start,
                    execute_date: data.agreement_data.execute_date,
                    amount: data.agreement_data.amount,
                    early_profit: data.end_early_interest_rate,
                    trading_fee: data.agreement_data.fee,
                    net_amount: data.agreement_data.net_amount,
                    symbol: data.symbol,
                    quantity: data.agreement_data.quantity,
                    price: data.agreement_data.price,
                });
                openTermSell(id);
            } else {
                toast.error(message);
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.haybond.something_went_wrong));
        } finally {
            setIsOverlayLoading(false);
        }
    };

    useEffect(() => {
        if (router.isReady) {
            fetchDetail();
        }
    }, [router.isReady, id]);

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
                <h3 className="font-heading-4 text-primary">
                    {getTextStatus(dataDetailSaving.status)}
                </h3>
            </div>
            {!isLoading && hasDetail && (
                <div className="flex min-h-0 flex-1 gap-2">
                    <aside className="flex w-80 shrink-0 flex-col gap-2 min-h-0">
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
                                    {formatNumberVN(dataDetailSaving.total_amount, { decimals: 0 })}
                                    {trans.haybond.currency_unit}
                                </span>
                                <span className="font-body-2-highlight text-green">
                                    {formatNumberVN(dataDetailSaving.gross_profit, { decimals: 0 })}
                                    {trans.haybond.currency_unit}
                                </span>
                            </div>
                            <div className="bg-primary h-px w-full" />
                            <div className="flex items-center justify-between">
                                <span className="font-caption text-secondary">
                                    {trans.haybond.start_date}
                                </span>
                                <span className="font-caption text-secondary">
                                    {trans.haybond.end_date}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-body-3 text-primary">
                                    {formatDate(dataDetailSaving.start)}
                                </span>
                                <span className="font-body-3 text-primary">
                                    {formatDate(dataDetailSaving.end)}
                                </span>
                            </div>
                            <div className="bg-success relative h-2 w-full overflow-hidden rounded-2xl">
                                <div
                                    className="absolute inset-y-0 left-0 rounded-2xl"
                                    style={{
                                        width: getWidthProgress(
                                            dataDetailSaving.start,
                                            dataDetailSaving.end,
                                        ),
                                        backgroundImage:
                                            'linear-gradient(to right, #07ae04, #a1ec02)',
                                    }}
                                />
                            </div>
                        </div>
                        <div className="bg-secondary flex min-h-0 flex-1 flex-col gap-3 overflow-hidden rounded p-3">
                            <h3 className="font-body-2-highlight text-primary shrink-0">
                                {trans.haybond.cash_history}
                            </h3>
                            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
                                {dataDetailSaving.cash_histories.length === 0 && <EmptyState />}
                                {dataDetailSaving.cash_histories.map((item, index) => {
                                    const { type, execute_date, fee, amount, tax, name } = item;
                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between gap-2"
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-body-3-highlight text-primary">
                                                    {getTextName(type, name)}
                                                </span>
                                                <span className="font-caption text-secondary">
                                                    {formatDate(execute_date)}
                                                </span>
                                            </div>
                                            <span className="font-body-2-highlight text-primary">
                                                {formatNumberVN(
                                                    type === 'RECEIVE_COUPON'
                                                        ? amount - (fee + tax)
                                                        : amount,
                                                    { decimals: 0 },
                                                )}
                                                {trans.haybond.currency_unit}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>
                    <section className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <span className="font-body-2-highlight text-secondary">
                                {trans.haybond.detail_info}
                            </span>
                            <button
                                type="button"
                                className="cursor-pointer"
                                onClick={() => setIsAgreementsOpen(true)}
                            >
                                <FaFileLines size={20} className="text-secondary" />
                            </button>
                        </div>
                        {dataDetailSaving.status === 'PROCESSING_CLOSE' &&
                            dataDetailSaving.sell_early && (
                                <div className="bg-error flex items-start gap-3 rounded px-4 py-3">
                                    <FaBell className="text-primary mt-0.5 shrink-0" size={24} />
                                    <div className="flex flex-col gap-1">
                                        <span className="font-body-2-highlight text-primary">
                                            {trans.haybond.early_sell_processing}
                                        </span>
                                        <span className="font-body-3 text-secondary">
                                            {trans.haybond.time_info_updated}
                                        </span>
                                    </div>
                                </div>
                            )}
                        <div className="bg-secondary flex flex-col gap-6 rounded p-3">
                            <div className="flex items-center justify-between gap-3">
                                <span className="font-body-3 text-secondary shrink-0">
                                    {trans.haybond.yield_rate}
                                </span>
                                <span className="font-body-3-highlight text-primary text-right">
                                    {`~${formatNumberVN(
                                        (dataDetailSaving.sell_early
                                            ? (dataDetailSaving.end_early_interest_rate ?? 0)
                                            : dataDetailSaving.interest_rate) * 100,
                                        { decimals: 2, trimTrailingZeros: true },
                                    )}%/${trans.haybond.year}`}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="font-body-3 text-secondary shrink-0">
                                    {trans.haybond.invest_code}
                                </span>
                                <span className="font-body-3-highlight text-primary text-right">
                                    {dataDetailSaving.symbol}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="font-body-3 text-secondary shrink-0">
                                    {trans.haybond.holding_period}
                                </span>
                                <span className="font-body-3-highlight text-primary text-right">
                                    {getTimeSaving()}
                                </span>
                            </div>
                            {dataDetailSaving.estimate_date_receive_coupon && (
                                <div className="flex items-center justify-between gap-3">
                                    <span className="font-body-3 text-secondary shrink-0">
                                        {trans.haybond.coupon_pay_date}
                                    </span>
                                    <span className="font-body-3-highlight text-primary text-right">
                                        {formatDate(dataDetailSaving.estimate_date_receive_coupon)}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="bg-secondary flex flex-col gap-6 rounded p-3">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-1">
                                    <span className="font-body-3 text-secondary">
                                        {trans.haybond.profit_before_fee}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-body-3-highlight text-primary">
                                        {`${formatNumberVN(dataDetailSaving.gross_profit, { decimals: 0 })}${trans.haybond.currency_unit}`}
                                    </span>
                                </div>
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
                                <div className="flex items-center gap-1">
                                    <span className="font-body-3-highlight text-primary">
                                        {`${formatNumberVN(dataDetailSaving.fee, { decimals: 0 })}${trans.haybond.currency_unit}`}
                                    </span>
                                </div>
                            </div>
                            {dataDetailSaving.tax !== 0 && (
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-1">
                                        <span className="font-body-3 text-secondary">
                                            {trans.haybond.sell_tax}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="font-body-3-highlight text-primary">
                                            {`${formatNumberVN(dataDetailSaving.tax, { decimals: 0 })}${trans.haybond.currency_unit}`}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div className="border-tertiary my-1 border-t" />
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-1">
                                    <span className="font-body-3 text-secondary">
                                        {trans.haybond.net_profit}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-body-3-highlight text-primary">
                                        {`${formatNumberVN(
                                            dataDetailSaving.gross_profit -
                                                (dataDetailSaving.fee + dataDetailSaving.tax),
                                            { decimals: 0 },
                                        )}${trans.haybond.currency_unit}`}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-1">
                                    <span className="font-body-3 text-secondary">Coupon</span>
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
                                <div className="flex items-center gap-1">
                                    <span className="font-body-3-highlight text-primary">
                                        {getTextCouponAmount()}
                                    </span>
                                </div>
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
                                <div className="flex items-center gap-1">
                                    <span className="font-body-3-highlight text-primary">
                                        {`${formatNumberVN(dataDetailSaving.delta_buy_sell, { decimals: 0 })}${trans.haybond.currency_unit}`}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-auto flex flex-col items-center gap-2 pt-4">
                            <button
                                type="button"
                                className={`font-body-3-highlight w-80 cursor-pointer rounded-full py-2 ${
                                    dataDetailSaving.allow_close
                                        ? 'bg-secondary text-red'
                                        : 'bg-secondary text-tertiary'
                                }`}
                                onClick={handleOpenSellEarly}
                                disabled={!dataDetailSaving.allow_close}
                            >
                                {trans.haybond.early_sell}
                            </button>
                            {!dataDetailSaving.allow_close &&
                                dataDetailSaving.status !== BTN_OWNERSHIP_HISTORIES.KEY_CLOSED && (
                                    <span className="font-body-3 text-secondary text-center">
                                        {trans.haybond.package_updating}
                                    </span>
                                )}
                        </div>
                    </section>
                </div>
            )}
            {isAgreementsOpen && (
                <Dialog
                    title={trans.haybond.detail_info}
                    maxWidth="max-w-3xl"
                    onClose={() => setIsAgreementsOpen(false)}
                >
                    {agreements.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <HaybondListCommand
                            agreementData={agreements}
                            symbol={dataDetailSaving.symbol}
                            isOrderList
                        />
                    )}
                </Dialog>
            )}
        </div>
    );
};
