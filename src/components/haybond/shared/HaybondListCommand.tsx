'use client';

import { useEffect, useMemo, useState } from 'react';

import { FaCircleInfo } from 'react-icons/fa6';

import { Tooltip } from '@/components/common/ui/Tooltip';
import { useTranslate } from '@/hooks/useTranslate';
import { getBondInfoBySymbol } from '@/services/api/bond-enterprise/bonds';
import { useHaybondStore } from '@/stores/haybond/useHaybondStore';
import type { HaybondTermBuyData } from '@/types/pages/haybond';
import { formatDate, formatNumberVN } from '@/utils/format';

type BondInfo = {
    name?: string;
    prospectus_url?: string;
};

type Props = {
    agreementData?: HaybondTermBuyData['agreementData'];
    symbol?: string;
    isOrderList?: boolean;
};

export const HaybondListCommand = ({
    agreementData: agreementDataProp,
    symbol: symbolProp,
    isOrderList: isOrderListProp,
}: Props = {}) => {
    const trans = useTranslate();
    const { termBuyData } = useHaybondStore();
    const usingProps = agreementDataProp !== undefined;
    const agreementData = usingProps ? agreementDataProp! : termBuyData.agreementData;
    const symbolFromStore = usingProps ? symbolProp : termBuyData.symbol;
    const isOrderList = usingProps ? (isOrderListProp ?? false) : termBuyData.isOrderList;
    const [bondInfo, setBondInfo] = useState<BondInfo | null>(null);

    const symbol = useMemo(
        () => symbolFromStore || (agreementData?.[0] as { symbol?: string })?.symbol || '',
        [symbolFromStore, agreementData],
    );

    useEffect(() => {
        if (!symbol) return;
        getBondInfoBySymbol(symbol).then((res) => {
            setBondInfo((res.data as BondInfo) ?? null);
        });
    }, [symbol]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto">
                {agreementData.map((item, index) => {
                    const {
                        order_side,
                        amount,
                        price,
                        quantity,
                        fee,
                        execute_date,
                        max_coupon_amount,
                        tax,
                        buyer,
                        seller,
                    } = item;
                    return (
                        <div key={index} className="bg-tertiary flex flex-col gap-2 rounded-xl p-3">
                            <div className="flex items-center justify-between">
                                <p className="font-body-2-highlight text-primary">
                                    {order_side === 'BUY' ? trans.haybond.buy : trans.haybond.sell}
                                </p>
                                <span className="font-caption text-secondary">
                                    {formatDate(execute_date)}
                                </span>
                            </div>
                            <div className="grid grid-cols-5 gap-3">
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-caption text-secondary">
                                        {trans.haybond.amount}
                                    </span>
                                    <span className="font-body-3-highlight text-primary">
                                        {`${formatNumberVN(amount, { decimals: 0 })}${trans.haybond.currency_unit}`}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-caption text-secondary">
                                        {trans.haybond.unit_price}
                                    </span>
                                    <span className="font-body-3-highlight text-primary">
                                        {`${formatNumberVN(price, { decimals: 0 })}${trans.haybond.currency_unit}`}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-caption text-secondary">
                                        {trans.haybond.quantity}
                                    </span>
                                    <span className="font-body-3-highlight text-primary">
                                        {`${formatNumberVN(quantity, { decimals: 0 })}${trans.haybond.currency_unit}`}
                                    </span>
                                </div>
                                {order_side === 'SELL' && (
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-1">
                                            <span className="font-body-3 text-secondary">
                                                {trans.haybond.max_coupon}
                                            </span>
                                            <Tooltip
                                                variant="light"
                                                content={
                                                    <div className="flex max-w-xs flex-col gap-1 p-1">
                                                        <span className="font-body-3-highlight text-quaternary">
                                                            {trans.haybond.max_coupon_info.title}
                                                        </span>
                                                        <span className="font-caption text-quaternary whitespace-pre-line">
                                                            {trans.haybond.max_coupon_info.content}
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
                                            {`${formatNumberVN(max_coupon_amount, { decimals: 0 })}${trans.haybond.currency_unit}`}
                                        </span>
                                    </div>
                                )}
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-caption text-secondary">
                                        {order_side === 'SELL'
                                            ? trans.haybond.sell_fee
                                            : trans.haybond.buy_fee}
                                    </span>
                                    <span className="font-body-3-highlight text-primary">
                                        {`${formatNumberVN(fee, { decimals: 0 })}${trans.haybond.currency_unit}`}
                                    </span>
                                </div>
                                {order_side === 'BUY' && (
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-caption text-secondary">
                                            {trans.haybond.bond_symbol}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <span className="font-body-3-highlight text-primary">
                                                {symbol}
                                            </span>
                                            <Tooltip
                                                variant="light"
                                                interactive
                                                content={
                                                    <div className="flex max-w-xs flex-col gap-1 p-1">
                                                        <span className="font-body-3-highlight text-quaternary">
                                                            {trans.haybond.issuer_info}
                                                        </span>
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="font-caption text-quaternary">
                                                                {trans.haybond.bond_code}
                                                            </span>
                                                            <span className="font-caption text-quaternary">
                                                                {symbol}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="font-caption text-quaternary">
                                                                {trans.haybond.issuer}
                                                            </span>
                                                            <span className="font-caption text-quaternary">
                                                                {bondInfo?.name ?? ''}
                                                            </span>
                                                        </div>
                                                        {bondInfo?.prospectus_url && (
                                                            <a
                                                                href={bondInfo.prospectus_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="font-caption text-highlight flex items-center justify-between gap-2 underline"
                                                            >
                                                                {trans.haybond.prospectus}
                                                            </a>
                                                        )}
                                                    </div>
                                                }
                                            >
                                                <FaCircleInfo
                                                    size={16}
                                                    className="text-secondary"
                                                />
                                            </Tooltip>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-5 gap-3">
                                {order_side === 'SELL' && (
                                    <>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-caption text-secondary">
                                                {trans.haybond.sell_tax}
                                            </span>
                                            <span className="font-body-3-highlight text-primary">
                                                {`${formatNumberVN(tax, { decimals: 0 })}${trans.haybond.currency_unit}`}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-caption text-secondary">
                                                {trans.haybond.buyer}
                                            </span>
                                            <span className="font-body-3-highlight text-primary">
                                                {buyer}
                                            </span>
                                        </div>
                                    </>
                                )}
                                {order_side === 'BUY' && (
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-caption text-secondary">
                                            {trans.haybond.buyer}
                                        </span>
                                        <span className="font-body-3-highlight text-primary">
                                            {seller}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {!isOrderList && (
                <div className="bg-tertiary rounded-xl p-3 font-caption text-secondary">
                    <span>{trans.haybond.note}:</span>
                    <ul className="mt-1 list-disc pl-4">
                        <li>{trans.haybond.order_info.detail_1}</li>
                        <li>{trans.haybond.order_info.detail_2}</li>
                    </ul>
                </div>
            )}
        </div>
    );
};
