'use client';

import { useTranslate } from '@/hooks/useTranslate';
import { useHaybondFlexStore } from '@/stores/haybond/useHaybondFlexStore';
import { formatDate, formatNumberVN } from '@/utils/format';

export const HaybondFlexibleListCommandSell = () => {
    const trans = useTranslate();
    const { dataSellPreview } = useHaybondFlexStore();
    const { agreementData } = dataSellPreview;

    return (
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
                                    {`${formatNumberVN(quantity, { decimals: 0 })}Bond`}
                                </span>
                            </div>
                            {order_side === 'SELL' && (
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-caption text-secondary">
                                        {trans.haybond.max_coupon}
                                    </span>
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
                                        {trans.haybond.seller}
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
    );
};
