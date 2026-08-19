'use client';

import { FaCircleInfo } from 'react-icons/fa6';

import { Tooltip } from '@/components/common/ui/Tooltip';
import { useTranslate } from '@/hooks/useTranslate';
import type { PreviewChangeDataItem } from '@/types/bond-enterprise/saving-books';
import { formatDate, formatNumberVN } from '@/utils/format';

type Props = {
    onClose?: () => void;
    agreementData: PreviewChangeDataItem[];
    onConfirm: () => void;
};

export const HaybondNewSellOrderSummary = ({ onClose, agreementData, onConfirm }: Props) => {
    const trans = useTranslate();

    return (
        <div className="flex flex-col gap-4">
            <div className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto">
                {agreementData.map((item, index) => {
                    const {
                        amount,
                        price,
                        quantity,
                        fee,
                        execute_date,
                        max_coupon_amount,
                        symbol,
                    } = item;
                    return (
                        <div key={index} className="bg-tertiary flex flex-col gap-2 rounded-xl p-3">
                            <div className="flex items-center justify-between">
                                <p className="font-body-2-highlight text-primary">
                                    {trans.haybond.sell}
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
                                        {`${formatNumberVN(Number(amount), { decimals: 0 })}${trans.haybond.currency_unit}`}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-caption text-secondary">
                                        {trans.haybond.unit_price}
                                    </span>
                                    <span className="font-body-3-highlight text-primary">
                                        {`${formatNumberVN(Number(price), { decimals: 0 })}${trans.haybond.currency_unit}`}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-caption text-secondary">
                                        {trans.haybond.quantity}
                                    </span>
                                    <span className="font-body-3-highlight text-primary">
                                        {`${quantity} ${trans.haybond.bond}`}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-caption text-secondary">
                                        {trans.haybond.sell_fee}
                                    </span>
                                    <span className="font-body-3-highlight text-primary">
                                        {`${formatNumberVN(Number(fee), { decimals: 0 })}${trans.haybond.currency_unit}`}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-caption text-secondary">
                                        {trans.haybond.bond_symbol}
                                    </span>
                                    <span className="font-body-3-highlight text-primary">
                                        {symbol}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-1">
                                    <span className="font-caption text-secondary">
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
                                    {`${formatNumberVN(Number(max_coupon_amount), { decimals: 0 })}${trans.haybond.currency_unit}`}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
            {agreementData.length > 0 && (
                <button
                    type="button"
                    onClick={onConfirm}
                    className="bg-highlight text-quaternary font-body-3-highlight w-full rounded-full px-4 py-2"
                >
                    {trans.haybond.confirm}
                </button>
            )}
        </div>
    );
};
