'use client';

import { type ChangeEvent, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { DEFAULT_ORDER_INFO, FLEXIBLE_BUY_FLOW_STEPS } from '@/constants/haybond';
import { toast } from '@/hooks/lib/useToast';
import useDebounce from '@/hooks/useDebounce';
import { useTranslate } from '@/hooks/useTranslate';
import { postHayBondDynamicOrdersEstimate } from '@/services/api/bond-enterprise/orders';
import {
    fetchHayBondPackageDynamicBuyPrice,
    fetchHayBondPackageDynamicPreview,
} from '@/services/api/bond-enterprise/packages';
import { useHaybondFlexStore } from '@/stores/haybond/useHaybondFlexStore';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';
import { formatNumberVN } from '@/utils/format';
import { getErrorMessageHaybondEstimate, getErrorMessageHaybondPreview } from '@/utils/haybond';

export const HaybondFlexibleOrderBuy = () => {
    const trans = useTranslate();
    const [disabled, setDisabled] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);
    const {
        setIsOverlayLoading,
        buyPriceDynamic,
        packageDynamic,
        bondDynamicAmount,
        dataPreview,
        setBuyPrice,
        setBondDynamicAmount,
        setDataPreview,
        buyPackageId,
        setBuyStep: setStep,
    } = useHaybondFlexStore();
    const bondDynamicAmountData = useDebounce(bondDynamicAmount, 1000);

    const handleChangeBondAmount = (e: ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        setBondDynamicAmount(Number(rawValue));
    };

    const handleUpdateInfoTransfer = async (amount: number) => {
        setIsOverlayLoading(true);
        try {
            const response = await postHayBondDynamicOrdersEstimate({
                flexible_package_id: packageDynamic.id || buyPackageId,
                amount,
                bond_id: buyPriceDynamic.bondId,
            });
            if (response.data) {
                setDataPreview({ estimateInfo: { ...response.data } });
                setDisabled(false);
            } else {
                getErrorMessageHaybondEstimate(response.error_code, trans, response.message);
                setDisabled(true);
                setDataPreview({ estimateInfo: { ...DEFAULT_ORDER_INFO } });
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.haybond.response_message.system_error));
            setDisabled(true);
            setDataPreview({ estimateInfo: { ...DEFAULT_ORDER_INFO } });
        } finally {
            setIsOverlayLoading(false);
        }
    };

    const handleOpenConfirm = async () => {
        if (disabled) return;
        setIsOverlayLoading(true);
        try {
            const response = await fetchHayBondPackageDynamicPreview({
                flexible_package_id: packageDynamic.id || buyPackageId,
                bond_id: buyPriceDynamic.bondId,
                amount: bondDynamicAmountData,
            });
            if (response.data) {
                setDataPreview({
                    symbol: response.data.symbol,
                    start: response.data.start,
                    has_accepted_tc: response.data.has_accepted_tc,
                    contract: response.data.contract,
                    agreementData: [...response.data.agreement_data],
                });
                setStep(FLEXIBLE_BUY_FLOW_STEPS.CONFIRM);
            } else {
                getErrorMessageHaybondPreview(response.error_code, trans, response.message);
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.haybond.response_message.system_error));
        } finally {
            setIsOverlayLoading(false);
        }
    };

    useEffect(() => {
        const id = packageDynamic.id || buyPackageId;
        if (!id) return;
        fetchHayBondPackageDynamicBuyPrice(id).then((data) => {
            if (isSuccessApi(data.error_code)) {
                setBuyPrice(data.data);
            } else {
                toast.error(data.message);
            }
        });
    }, [packageDynamic.id, buyPackageId]);

    useEffect(() => {
        if (!buyPriceDynamic.bondId) return;
        if (bondDynamicAmountData) {
            handleUpdateInfoTransfer(bondDynamicAmountData);
        } else {
            setDataPreview({ estimateInfo: { ...DEFAULT_ORDER_INFO } });
            setDisabled(true);
        }
    }, [bondDynamicAmountData, buyPriceDynamic.bondId]);

    useLayoutEffect(() => {
        const timer = setTimeout(() => inputRef.current?.focus(), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-tertiary flex flex-col gap-1 rounded-xl px-3 py-2">
                <span className="font-caption text-secondary">{trans.haybond.product_package}</span>
                <span className="font-body-3 text-primary">
                    {`${packageDynamic.name} ~ ${formatNumberVN(packageDynamic.interest_rate * 100, { decimals: 2, trimTrailingZeros: true })}%/${trans.haybond.year}`}
                </span>
            </div>
            <div className="bg-tertiary border-highlight flex flex-col gap-1 rounded-xl border px-3 py-2">
                <label className="font-caption text-highlight" htmlFor="haybond-flex-buy-amount">
                    {trans.haybond.enter_buy_amount}
                </label>
                <input
                    id="haybond-flex-buy-amount"
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    className="font-body-2-highlight text-primary bg-transparent outline-none"
                    onChange={handleChangeBondAmount}
                    value={`${formatNumberVN(bondDynamicAmount, { decimals: 0 })}${trans.haybond.currency_unit}`}
                />
            </div>
            <div className="flex flex-col gap-2">
                <h4 className="font-body-3 text-primary">{trans.haybond.trade_info}</h4>
                <div className="bg-tertiary flex items-center justify-between rounded-xl px-3 py-2">
                    <span className="font-body-3 text-secondary">{trans.haybond.buy_price}</span>
                    <span className="font-body-3-highlight text-primary">
                        {`${formatNumberVN(buyPriceDynamic?.buyPrice, { decimals: 0 })}${trans.haybond.currency_unit}`}
                    </span>
                </div>
                <div className="bg-tertiary flex items-center justify-between rounded-xl px-3 py-2">
                    <span className="font-body-3 text-secondary">{trans.haybond.est_buy_qty}</span>
                    <span className="font-body-3-highlight text-primary">
                        {`${formatNumberVN(dataPreview.estimateInfo.estimated_quantity, { decimals: 0 })}${trans.haybond.bond_abbr}`}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="font-body-3 text-secondary">
                        {trans.haybond.dynamic.total_amount}
                    </span>
                    <span className="font-body-3-highlight text-green">
                        {`${formatNumberVN(dataPreview.estimateInfo.total_amount, { decimals: 0 })}${trans.haybond.currency_unit}`}
                    </span>
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
