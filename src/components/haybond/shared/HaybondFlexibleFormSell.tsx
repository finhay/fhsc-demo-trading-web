'use client';

import { type ChangeEvent, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { FLEXIBLE_SELL_FLOW_STEPS } from '@/constants/haybond';
import { toast } from '@/hooks/lib/useToast';
import useDebounce from '@/hooks/useDebounce';
import { useTranslate } from '@/hooks/useTranslate';
import {
    getHayBondDynamicSellOrdersEstimate,
    getHayBondSellOrdersPreview,
} from '@/services/api/bond-enterprise/orders';
import { useHaybondFlexStore } from '@/stores/haybond/useHaybondFlexStore';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';
import { formatNumberVN } from '@/utils/format';
import { getErrorMessageHaybondSellPreview } from '@/utils/haybond';

export const HaybondFlexibleFormSell = () => {
    const trans = useTranslate();
    const [disabled, setDisabled] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);
    const {
        setIsOverlayLoading,
        dataSellPreview,
        bondDynamicSellAmount,
        maxSellAmount,
        warningSell,
        setMaxSellAmount,
        setBondDynamicSellAmount,
        setSellData,
        setWarningSell,
        resetForm,
        setSellStep: setStep,
    } = useHaybondFlexStore();
    const bondDynamicSellAmountData = useDebounce(bondDynamicSellAmount, 1000);

    const handleChangeBondAmount = (e: ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        setBondDynamicSellAmount(Number(rawValue));
    };

    const handleContinue = () => {
        if (disabled) return;
        if (warningSell) {
            setStep(FLEXIBLE_SELL_FLOW_STEPS.WARNING);
        } else {
            setStep(FLEXIBLE_SELL_FLOW_STEPS.CONFIRM);
        }
    };

    const handleUpdateInfoTransfer = async () => {
        setIsOverlayLoading(true);
        try {
            const response = await getHayBondSellOrdersPreview(bondDynamicSellAmountData);
            if (response.data) {
                setSellData({
                    agreementData: [...response.data.agreement_data],
                    fee_sell_amount: response.data.fee_sell_amount,
                    receive_sell_amount: response.data.receive_sell_amount,
                    tax_sell_amount: response.data.tax_sell_amount,
                    sell_amount: response.data.sell_amount,
                    avg_sell_price: response.data.avg_sell_price,
                    total_quantity: response.data.total_quantity,
                    is_selling_all: response.data.is_selling_all,
                    total_coupon_received: response.data.total_coupon_received,
                });
                setDisabled(false);
            } else {
                getErrorMessageHaybondSellPreview(response.error_code, trans, response.message);
                setDisabled(true);
                resetForm();
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.haybond.response_message.system_error));
            setDisabled(true);
            resetForm();
        } finally {
            setIsOverlayLoading(false);
        }
    };

    useEffect(() => {
        const warningItem = dataSellPreview.agreementData.find(
            (item) => item.warning_code === 'NEGATIVE_PROFIT',
        );
        if (warningItem) {
            setWarningSell({
                warningSell: true,
                warningMessage: warningItem.warning_message,
            });
        } else {
            setWarningSell({ warningSell: false, warningMessage: '' });
        }
    }, [dataSellPreview.agreementData]);

    useEffect(() => {
        getHayBondDynamicSellOrdersEstimate().then((data) => {
            if (isSuccessApi(data.error_code)) {
                setMaxSellAmount(data.data.maxSellAmount);
            } else {
                toast.error(data.message);
            }
        });
    }, []);

    useEffect(() => {
        if (bondDynamicSellAmountData) {
            handleUpdateInfoTransfer();
        } else {
            resetForm();
            setDisabled(true);
        }
    }, [bondDynamicSellAmountData]);

    useLayoutEffect(() => {
        const timer = setTimeout(() => inputRef.current?.focus(), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="font-body-3 text-secondary">
                    {trans.haybond.receivable_amount}
                </span>
                <span className="font-body-3-highlight text-primary">
                    {formatNumberVN(maxSellAmount, { decimals: 0 })}
                    {trans.haybond.currency_unit}
                </span>
            </div>
            <div className="bg-tertiary border-highlight flex flex-col gap-1 rounded-xl border px-3 py-2">
                <label className="font-caption text-highlight" htmlFor="haybond-flex-sell-amount">
                    {trans.haybond.enter_receive_amount}
                </label>
                <input
                    id="haybond-flex-sell-amount"
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    className="font-body-2-highlight text-primary bg-transparent outline-none"
                    onChange={handleChangeBondAmount}
                    value={`${formatNumberVN(bondDynamicSellAmount, { decimals: 0 })}${trans.haybond.currency_unit}`}
                />
            </div>
            <div className="flex flex-col gap-2">
                <h4 className="font-body-3 text-primary">{trans.haybond.trade_info}</h4>
                <div className="bg-tertiary flex items-center justify-between rounded-xl px-3 py-2">
                    <span className="font-body-3 text-secondary">
                        {trans.haybond.avg_sell_price}
                    </span>
                    <span className="font-body-3-highlight text-primary">
                        {`~ ${formatNumberVN(dataSellPreview.avg_sell_price || 0, { decimals: 0 })}${trans.haybond.currency_unit}`}
                    </span>
                </div>
                <div className="bg-tertiary flex items-center justify-between rounded-xl px-3 py-2">
                    <span className="font-body-3 text-secondary">{trans.haybond.est_sell_qty}</span>
                    <span className="font-body-3-highlight text-primary">
                        {`${formatNumberVN(dataSellPreview.total_quantity || 0, { decimals: 0 })}${trans.haybond.bond_abbr}`}
                    </span>
                </div>
                {dataSellPreview.is_selling_all && (
                    <div className="bg-tertiary flex items-center justify-between rounded-xl px-3 py-2">
                        <span className="font-body-3 text-secondary">
                            {trans.haybond.coupon_deducted}
                        </span>
                        <span className="font-body-3-highlight text-primary">
                            {`${formatNumberVN(dataSellPreview.total_coupon_received || 0, { decimals: 0 })}${trans.haybond.currency_unit}`}
                        </span>
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <span className="font-body-3 text-secondary">
                        {trans.haybond.withdraw_amount}
                    </span>
                    <span className="font-body-3-highlight text-green">
                        {`${formatNumberVN(dataSellPreview.sell_amount, { decimals: 0 })}${trans.haybond.currency_unit}`}
                    </span>
                </div>
            </div>
            <button
                type="button"
                disabled={disabled}
                onClick={handleContinue}
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
