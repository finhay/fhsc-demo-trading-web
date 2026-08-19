'use client';

import { useEffect, useMemo, useState } from 'react';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { AssetRightsRow } from '@/components/tai-san/rights/AssetRightsRow';
import { RIGHT_EVENT_TYPES } from '@/constants/assets';
import { SUB_ACCOUNT_TYPE } from '@/constants/common';
import { ORDER_SIDE } from '@/constants/trading';
import { useTranslate } from '@/hooks/useTranslate';
import { getSubAccountWithdrawalAvailableBalance } from '@/services/api/payments';
import { fetchSubAccountAvailableTrade } from '@/services/api/trade/orders';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import type { UserRightItem } from '@/types/trade/user-rights';
import {
    calculateMaxCanBuy,
    calculatePaymentAmount,
    getRightLabel,
    sanitizeQuantityInput,
} from '@/utils/assets';
import { isSuccessApi } from '@/utils/common';
import { formatDateOrDash, formatNumberVN, isDateInRange } from '@/utils/format';

type Props = {
    rights: UserRightItem[];
    selectedRightId: string;
    quantity: string;
    onQuantityChange: (quantity: string) => void;
    onOpenRegisterModal: () => void;
};

export const AssetRightsDetail = ({
    rights,
    selectedRightId,
    quantity,
    onQuantityChange,
    onOpenRegisterModal,
}: Props) => {
    const trans = useTranslate();
    const [error, setError] = useState('');

    const { activeSubAccount } = useAuthStore();
    const [availableBalance, setAvailableBalance] = useState(0);

    const isMarginAccount = activeSubAccount?.account_type === SUB_ACCOUNT_TYPE.MARGIN;

    const selectedRight = useMemo(
        () => rights.find((item) => item.caMastId === selectedRightId),
        [rights, selectedRightId],
    );

    const isStockRight = selectedRight?.type === RIGHT_EVENT_TYPES.STOCK_RIGHT;

    const isValidDate = isStockRight
        ? isDateInRange(selectedRight?.startDate, selectedRight?.finishDate)
        : true;

    const maxCanBuy = useMemo(() => {
        if (!isStockRight || !selectedRight) return 0;
        return calculateMaxCanBuy(
            availableBalance,
            selectedRight.buyPrice,
            selectedRight.totalStocksCanBuy,
            selectedRight.numberOfWaitingStock,
        );
    }, [
        isStockRight,
        availableBalance,
        selectedRight?.buyPrice,
        selectedRight?.totalStocksCanBuy,
        selectedRight?.numberOfWaitingStock,
        selectedRight,
    ]);

    const paymentAmount = calculatePaymentAmount(quantity, selectedRight?.buyPrice);

    const isValidQuantity = (() => {
        const qty = Number(quantity) || 0;
        return qty > 0 && qty <= maxCanBuy;
    })();

    const canRegister = isStockRight && isValidDate && isValidQuantity;

    const isValuePresent = (val: string | number | null | undefined): boolean =>
        val !== null && val !== undefined && val !== '' && val !== 0 && val !== '0';

    const eventTypeLabel = selectedRight
        ? getRightLabel(trans.assets.rights.event_types, selectedRight.type)
        : '';

    const handleQuantityChange = (value: string) => {
        const rawValue = sanitizeQuantityInput(value);
        if (!isValidDate) {
            setError(trans.assets.rights.err_not_in_register_period);
            return;
        }
        if (Number(rawValue) > maxCanBuy) {
            setError(trans.assets.rights.err_quantity_exceeds);
            onQuantityChange(rawValue);
            return;
        }
        setError('');
        onQuantityChange(rawValue);
    };

    const fetchAvailableBalance = async () => {
        const subAccountId = activeSubAccount?.sub_account_id;
        if (!subAccountId) return;

        if (isMarginAccount) {
            if (!selectedRight?.symbol) return;
            const { error_code, result } = await fetchSubAccountAvailableTrade(
                subAccountId,
                ORDER_SIDE.BUY,
                selectedRight.symbol,
                selectedRight.buyPrice,
            );
            if (isSuccessApi(error_code)) {
                setAvailableBalance(result.ppse);
            }
            return;
        }

        const { error_code, result } = await getSubAccountWithdrawalAvailableBalance(subAccountId);
        if (isSuccessApi(error_code)) {
            setAvailableBalance(result.availableBalance);
        }
    };

    useEffect(() => {
        fetchAvailableBalance();
    }, [
        activeSubAccount?.sub_account_id,
        isMarginAccount,
        selectedRight?.symbol,
        selectedRight?.buyPrice,
    ]);

    useEffect(() => {
        setError('');
        onQuantityChange('');
    }, [selectedRightId]);

    return (
        <section className="flex h-full flex-1 flex-col rounded-xl bg-secondary">
            {selectedRight ? (
                <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
                    <div className="flex flex-col gap-2">
                        <AssetRightsRow
                            label={trans.assets.rights.event_type}
                            value={eventTypeLabel}
                        />
                        <AssetRightsRow
                            label={trans.assets.rights.last_register_date}
                            value={formatDateOrDash(selectedRight.reportDate)}
                        />
                        {isStockRight ? (
                            <>
                                <AssetRightsRow
                                    label={trans.assets.rights.start_register_date}
                                    value={formatDateOrDash(selectedRight.startDate)}
                                />
                                <AssetRightsRow
                                    label={trans.assets.rights.end_register_date}
                                    value={formatDateOrDash(selectedRight.finishDate)}
                                />
                            </>
                        ) : null}
                        <AssetRightsRow
                            label={trans.assets.rights.expected_action_date}
                            value={formatDateOrDash(selectedRight.actionDate)}
                        />
                    </div>
                    {isStockRight ? (
                        <>
                            <div className="flex flex-col gap-2 border-b border-tertiary">
                                {isValuePresent(selectedRight.ratio) && (
                                    <AssetRightsRow
                                        label={trans.assets.rights.ratio}
                                        value={selectedRight.ratio}
                                    />
                                )}
                                {isValuePresent(selectedRight.buyPrice) && (
                                    <AssetRightsRow
                                        label={trans.assets.rights.price}
                                        value={`${formatNumberVN(selectedRight.buyPrice, { trimTrailingZeros: true })} ${trans.assets.modals.common.currency}`}
                                    />
                                )}
                                {isValuePresent(selectedRight.totalStocksCanBuy) && (
                                    <AssetRightsRow
                                        label={trans.assets.rights.max_register_quantity}
                                        value={`${formatNumberVN(selectedRight.totalStocksCanBuy, { decimals: 0 })} ${trans.assets.modals.common.unit_shares}`}
                                    />
                                )}
                                {isValuePresent(selectedRight.numberOfWaitingStock) && (
                                    <AssetRightsRow
                                        label={trans.assets.rights.registered_quantity}
                                        value={`${formatNumberVN(selectedRight.numberOfWaitingStock, { decimals: 0 })} ${trans.assets.modals.common.unit_shares}`}
                                    />
                                )}
                            </div>
                            <div className="flex max-w-sm flex-col gap-2">
                                <div className="flex flex-col gap-2">
                                    <label className="font-body-3 text-secondary">
                                        {trans.assets.rights.register_quantity}
                                    </label>
                                    <input
                                        type="text"
                                        value={
                                            quantity
                                                ? formatNumberVN(Number(quantity), { decimals: 0 })
                                                : ''
                                        }
                                        onChange={(e) => handleQuantityChange(e.target.value)}
                                        placeholder={trans.assets.rights.quantity_placeholder}
                                        disabled={!isValidDate}
                                        className="w-full rounded-xl border border-quaternary bg-tertiary px-3 py-2 font-body-3 text-primary focus:border-highlight focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    {error && <p className="font-body-3 text-red">{error}</p>}
                                </div>
                                <dl className="flex flex-col gap-2 rounded-xl bg-tertiary p-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <dt className="font-body-3 text-secondary">
                                            {trans.assets.rights.available_balance}
                                        </dt>
                                        <dd className="font-body-3-highlight text-primary">
                                            {formatNumberVN(availableBalance, {
                                                trimTrailingZeros: true,
                                            })}{' '}
                                            {trans.assets.modals.common.currency}
                                        </dd>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <dt className="font-body-3 text-secondary">
                                            {trans.assets.rights.payment_amount}
                                        </dt>
                                        <dd className="font-body-3-highlight text-green">
                                            {formatNumberVN(paymentAmount, {
                                                trimTrailingZeros: true,
                                            })}{' '}
                                            {trans.assets.modals.common.currency}
                                        </dd>
                                    </div>
                                </dl>
                                <button
                                    type="button"
                                    onClick={onOpenRegisterModal}
                                    disabled={!canRegister}
                                    className={`w-full rounded-xl px-4 py-3 font-body-2-highlight transition-opacity ${
                                        !canRegister
                                            ? 'cursor-not-allowed bg-disabled text-disabled'
                                            : 'bg-highlight text-quaternary hover:opacity-90'
                                    }`}
                                >
                                    {trans.assets.rights.register_buy}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {isValuePresent(selectedRight.ratio) && (
                                <AssetRightsRow
                                    label={trans.assets.rights.ratio}
                                    value={selectedRight.ratio}
                                />
                            )}
                            {isValuePresent(selectedRight.ownNumberOfShare) && (
                                <AssetRightsRow
                                    label={trans.assets.rights.own_shares}
                                    value={`${formatNumberVN(selectedRight.ownNumberOfShare, { decimals: 0 })} ${trans.assets.modals.common.unit_shares}`}
                                />
                            )}
                            {isValuePresent(selectedRight.numberOfWaitingStock) &&
                                selectedRight.type === RIGHT_EVENT_TYPES.STOCK_DIVIDEND && (
                                    <AssetRightsRow
                                        label={trans.assets.rights.dividend_stock}
                                        value={`${formatNumberVN(selectedRight.numberOfWaitingStock, { decimals: 0 })} ${trans.assets.modals.common.unit_shares}`}
                                    />
                                )}
                            {isValuePresent(selectedRight.amount) &&
                                selectedRight.type === RIGHT_EVENT_TYPES.CASH_DIVIDEND && (
                                    <AssetRightsRow
                                        label={trans.assets.rights.dividend_cash}
                                        value={`${formatNumberVN(selectedRight.amount, { trimTrailingZeros: true })} ${trans.assets.modals.common.currency}`}
                                    />
                                )}
                        </div>
                    )}
                </div>
            ) : (
                <EmptyState />
            )}
        </section>
    );
};
