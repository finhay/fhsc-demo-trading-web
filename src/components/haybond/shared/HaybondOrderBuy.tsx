'use client';

import { type ChangeEvent, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { FaCircleInfo } from 'react-icons/fa6';

import { Tooltip } from '@/components/common/ui/Tooltip';
import { DEFAULT_ORDER_INFO, TERM_BUY_FLOW_STEPS } from '@/constants/haybond';
import { toast } from '@/hooks/lib/useToast';
import useDebounce from '@/hooks/useDebounce';
import { useTranslate } from '@/hooks/useTranslate';
import { fetchHayBondContract } from '@/services/api/bond-enterprise/bonds';
import {
    postHayBondOrdersEstimate,
    postHayBondOrdersPreview,
} from '@/services/api/bond-enterprise/orders';
import { useHaybondStore } from '@/stores/haybond/useHaybondStore';
import { getApiErrorMessage } from '@/utils/common';
import { formatNumberVN } from '@/utils/format';
import { getErrorMessageHaybondEstimate, getErrorMessageHaybondPreview } from '@/utils/haybond';

export const HaybondOrderBuy = () => {
    const trans = useTranslate();
    const [disabled, setDisabled] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);
    const {
        termBuyData,
        setTermBuyData,
        setAcceptTC,
        setIsOverlayLoading,
        setBuyStep: setStep,
    } = useHaybondStore();
    const { bondAmount, price, packageInfo, estimateInfo } = termBuyData;
    const bondAmountData = useDebounce(bondAmount, 1000);

    const handleChangeBondAmount = (e: ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        setTermBuyData({ bondAmount: Number(rawValue) });
    };

    const handleUpdateInfoTransfer = async (amount: number) => {
        setIsOverlayLoading(true);
        try {
            const response = await postHayBondOrdersEstimate({
                package_id: packageInfo.id,
                amount,
            });
            if (response.data) {
                setTermBuyData({ estimateInfo: { ...response.data } });
                setDisabled(false);
            } else {
                getErrorMessageHaybondEstimate(response.error_code, trans);
                setDisabled(true);
                setTermBuyData({ estimateInfo: { ...DEFAULT_ORDER_INFO } });
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.haybond.response_message.system_error));
            setDisabled(true);
            setTermBuyData({ estimateInfo: { ...DEFAULT_ORDER_INFO } });
        } finally {
            setIsOverlayLoading(false);
        }
    };

    const handleOpenConfirm = async () => {
        if (disabled) return;
        setIsOverlayLoading(true);
        try {
            const [contractResponse, previewResponse] = await Promise.all([
                fetchHayBondContract(),
                postHayBondOrdersPreview({
                    package_id: packageInfo.id,
                    amount: bondAmount,
                }),
            ]);
            setTermBuyData({
                contract: {
                    pathFile: contractResponse.data.pathFile,
                    signed: contractResponse.data.signed,
                    title: contractResponse.title ?? '',
                },
            });
            setAcceptTC(contractResponse.data.signed);
            if (previewResponse.data) {
                setTermBuyData({
                    symbol: previewResponse.data.symbol,
                    start: previewResponse.data.start,
                    agreementData: [...previewResponse.data.agreement_data],
                });
                setStep(TERM_BUY_FLOW_STEPS.CONFIRM);
            } else {
                getErrorMessageHaybondPreview(
                    previewResponse.error_code,
                    trans,
                    previewResponse.message,
                );
            }
        } catch (error) {
            toast.error(getApiErrorMessage(error, trans.haybond.response_message.system_error));
        } finally {
            setIsOverlayLoading(false);
        }
    };

    useEffect(() => {
        if (bondAmountData) {
            handleUpdateInfoTransfer(bondAmountData);
        } else {
            setTermBuyData({ estimateInfo: { ...DEFAULT_ORDER_INFO } });
            setDisabled(true);
        }
    }, [bondAmountData]);

    useLayoutEffect(() => {
        const timer = setTimeout(() => inputRef.current?.focus(), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex flex-col gap-4">
            <div className="bg-tertiary flex flex-col gap-1 rounded-xl px-3 py-2">
                <span className="font-caption text-secondary">{trans.haybond.product_package}</span>
                <span className="font-body-3-highlight text-primary">
                    {`${packageInfo.name} ~ ${formatNumberVN(packageInfo.interest_rate * 100, { decimals: 2, trimTrailingZeros: true })}%/${trans.haybond.year}`}
                </span>
            </div>
            <div className="bg-tertiary border-highlight flex flex-col gap-1 rounded-xl border px-3 py-2">
                <label className="font-caption text-highlight" htmlFor="haybond-term-buy-amount">
                    {trans.haybond.enter_buy_amount}
                </label>
                <input
                    id="haybond-term-buy-amount"
                    ref={inputRef}
                    className="font-body-3-highlight text-primary bg-transparent outline-none"
                    onChange={handleChangeBondAmount}
                    type="text"
                    inputMode="numeric"
                    value={`${formatNumberVN(bondAmount, { decimals: 0 })}${trans.haybond.currency_unit}`}
                />
            </div>
            <div className="flex flex-col gap-2">
                <h4 className="font-body-3-highlight text-primary">{trans.haybond.trade_info}</h4>
                <div className="bg-tertiary flex items-center justify-between gap-3 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-1">
                        <span className="font-body-3 text-secondary">
                            {trans.haybond.buy_price}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="font-body-3-highlight text-primary">
                            {`${formatNumberVN(price, { decimals: 0 })}${trans.haybond.currency_unit}`}
                        </span>
                    </div>
                </div>
                <div className="bg-tertiary flex items-center justify-between gap-3 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-1">
                        <span className="font-body-3 text-secondary">
                            {trans.haybond.est_buy_qty}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="font-body-3-highlight text-primary">
                            {`${formatNumberVN(estimateInfo.estimated_quantity, { decimals: 0 })}${trans.haybond.bond_abbr}`}
                        </span>
                    </div>
                </div>
                <div className="flex items-center justify-between gap-3 py-1">
                    <div className="flex items-center gap-1">
                        <span className="font-body-3 text-secondary">
                            {trans.haybond.total_trade_amount}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="font-body-3-highlight text-green">
                            {`${formatNumberVN(estimateInfo.total_amount, { decimals: 0 })}${trans.haybond.currency_unit}`}
                        </span>
                    </div>
                </div>
                <div className="flex items-center justify-between gap-3 py-1">
                    <div className="flex items-center gap-1">
                        <span className="font-body-3 text-secondary">
                            {trans.haybond.temp_profit}
                        </span>
                        <Tooltip
                            variant="light"
                            content={
                                <div className="flex max-w-xs flex-col gap-1 p-1">
                                    <span className="font-body-3-highlight text-quaternary">
                                        {trans.haybond.profit_tip.title}
                                    </span>
                                    <span className="font-caption text-quaternary whitespace-pre-line">
                                        {trans.haybond.profit_tip.content}
                                    </span>
                                </div>
                            }
                        >
                            <FaCircleInfo size={16} className="text-secondary cursor-pointer" />
                        </Tooltip>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="font-body-3-highlight text-green">
                            {`${formatNumberVN(estimateInfo.estimated_profit, { decimals: 0 })}${trans.haybond.currency_unit}`}
                        </span>
                    </div>
                </div>
            </div>
            <button
                type="button"
                disabled={disabled}
                onClick={handleOpenConfirm}
                className={`font-body-3-highlight w-full rounded-full px-4 py-2 ${
                    disabled
                        ? 'bg-disabled text-disabled cursor-not-allowed'
                        : 'bg-highlight text-quaternary'
                }`}
            >
                {trans.haybond.continue}
            </button>
        </div>
    );
};
