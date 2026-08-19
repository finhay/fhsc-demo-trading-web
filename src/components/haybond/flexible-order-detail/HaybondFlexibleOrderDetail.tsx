'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { FaChevronLeft } from 'react-icons/fa6';

import { Spinner } from '@/components/common/ui/Spinner';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { fetchHayBondFlexibleOrderDetail } from '@/services/api/bond-enterprise/orders';
import type { HaybondFlexibleOrderDetailData } from '@/types/bond-enterprise/orders';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';
import { formatDateTime, formatNumberVN } from '@/utils/format';

const ICON_PROCESSING =
    'https://cdn1.finhay.com.vn/vnsc-prod/1737445913521-haybond-icon-processing.svg';
const ICON_SUCCESS =
    'https://cdn1.finhay.com.vn/vnsc-prod/1737447296453-haybond-flexible-icon-success.svg';
const ICON_REJECT =
    'https://cdn1.finhay.com.vn/vnsc-prod/1737447257990-haybond-flexible-icon-reject.svg';
const ICON_STEP_DONE =
    'https://cdn1.finhay.com.vn/vnsc-prod/1737446044912-checkbox-circle-fill.svg';
const ICON_STEP_PENDING =
    'https://cdn1.finhay.com.vn/vnsc-prod/1737446017922-radio-button-blank-line.svg';

export const HaybondFlexibleOrderDetail = () => {
    const trans = useTranslate();
    const router = useRouter();
    const { id } = router.query;
    const [data, setData] = useState<HaybondFlexibleOrderDetailData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const getIconHeader = (orderStatus: string) => {
        if (orderStatus === 'PENDING' || orderStatus === 'SENT' || orderStatus === 'PROCESSING') {
            return ICON_PROCESSING;
        }
        if (orderStatus === 'COMPLETED' || orderStatus === 'SUCCESS') {
            return ICON_SUCCESS;
        }
        return ICON_REJECT;
    };

    const fetchDetail = async () => {
        if (!id || typeof id !== 'string') return;
        setIsLoading(true);
        try {
            const { error_code, message, data: detail } = await fetchHayBondFlexibleOrderDetail(id);
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
        <div className="flex h-full min-h-0 w-full flex-col items-center gap-3">
            <Spinner isLoading={isLoading} />
            <div className="flex w-full shrink-0 items-center gap-3">
                <button
                    type="button"
                    className="text-primary cursor-pointer"
                    onClick={() => router.back()}
                >
                    <FaChevronLeft size={16} />
                </button>
                <h3 className="font-heading-4 text-primary">{trans.haybond.order_detail}</h3>
            </div>
            {!isLoading && data && (
                <div className="bg-secondary flex w-full max-w-xl flex-col items-center gap-9 rounded p-6">
                    <div className="flex flex-col items-center gap-4">
                        <Image
                            src={getIconHeader(data.orderStatus)}
                            width={48}
                            height={48}
                            alt=""
                        />
                        <h3 className="font-heading-4 text-primary text-center">{data.title}</h3>
                    </div>
                    <div className="bg-tertiary relative flex w-full items-start justify-between gap-3 rounded p-3">
                        {data.progress.map((item, index) => (
                            <div
                                key={index}
                                className="relative z-10 flex w-1/3 flex-col items-center gap-2"
                            >
                                {index < data.progress.length - 1 && (
                                    <div className="bg-gray absolute top-3 left-1/2 h-px w-full" />
                                )}
                                <Image
                                    src={
                                        item.status === 'COMPLETED'
                                            ? ICON_STEP_DONE
                                            : data.orderStatus === 'CANCELED'
                                              ? ICON_REJECT
                                              : ICON_STEP_PENDING
                                    }
                                    width={item.status === 'COMPLETED' ? 24 : 22}
                                    height={item.status === 'COMPLETED' ? 24 : 22}
                                    alt=""
                                    className="relative z-10"
                                />
                                <span className="font-body-2 text-primary text-center">
                                    {item.title}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="flex w-full flex-col gap-3">
                        <div className="bg-tertiary flex flex-col gap-6 rounded p-3">
                            <div className="flex items-center justify-between">
                                <span className="font-body-3 text-secondary">
                                    {trans.haybond.bond_symbol}
                                </span>
                                <span className="font-body-3-highlight text-primary">
                                    {data.symbol}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-body-3 text-secondary">
                                    {trans.haybond.order_time}
                                </span>
                                <span className="font-body-3-highlight text-primary">
                                    {formatDateTime(data.executeAt)}
                                </span>
                            </div>
                        </div>
                        <div className="bg-tertiary flex flex-col gap-6 rounded p-3">
                            <div className="flex items-center justify-between">
                                <span className="font-body-3 text-secondary">
                                    {trans.haybond.amount}
                                </span>
                                <span className="font-body-3-highlight text-primary">
                                    {formatNumberVN(data.totalAmount, { decimals: 0 })}đ
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-body-3 text-secondary">
                                    {trans.haybond.unit_price}
                                </span>
                                <span className="font-body-3-highlight text-primary">
                                    {formatNumberVN(data.price, { decimals: 0 })}đ
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-body-3 text-secondary">
                                    {trans.haybond.quantity}
                                </span>
                                <span className="font-body-3-highlight text-primary">
                                    {formatNumberVN(data.quantity, { decimals: 0 })}Bond
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-body-3 text-secondary">
                                    {data.orderSide === 'BUY'
                                        ? trans.haybond.buy_fee
                                        : trans.haybond.sell_fee}
                                </span>
                                <span className="font-body-3-highlight text-primary">
                                    {formatNumberVN(data.fee, { decimals: 0 })}đ
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-body-3 text-secondary">
                                    {data.orderSide === 'BUY'
                                        ? trans.haybond.seller
                                        : trans.haybond.buyer}
                                </span>
                                <span className="font-body-3-highlight text-primary">
                                    {data.orderSide === 'BUY' ? data.seller : data.buyer}
                                </span>
                            </div>
                        </div>
                    </div>
                    {(data.orderStatus === 'COMPLETED' || data.orderStatus === 'SUCCESS') && (
                        <Link
                            href="/haybond/chi-tiet-goi-linh-hoat"
                            className="bg-highlight text-quaternary font-body-2-highlight w-full cursor-pointer rounded-full py-2 text-center"
                        >
                            {trans.haybond.view_ownership}
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
};
