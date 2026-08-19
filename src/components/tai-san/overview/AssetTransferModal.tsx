'use client';

import { useForm, useStore } from '@tanstack/react-form';

import { useState } from 'react';

import { FaArrowDown, FaChevronDown } from 'react-icons/fa6';

import { Dialog } from '@/components/common/ui/Dialog';
import { ASSET_TRANSFER_MODAL_STEPS } from '@/constants/assets';
import { SUB_ACCOUNT_PERMISSION } from '@/constants/common';
import { useClickOutside } from '@/hooks/lib/useClickOutside';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { calculateTransferFee, transferMoney } from '@/services/api/payments';
import { useAssetStore } from '@/stores/assets/useAssetStore';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { formatSubAccountLabel, sanitizeQuantityInput } from '@/utils/assets';
import { getApiErrorMessage, hasSubAccountPermission, isSuccessApi } from '@/utils/common';
import { formatNumberVN } from '@/utils/format';

type Props = {
    availableBalance: number;
    onClose: () => void;
    onConfirm?: (amount: string, fromAccountId: string, toAccountId: string) => void;
};

export const AssetTransferModal = ({ availableBalance, onClose, onConfirm }: Props) => {
    const trans = useTranslate();
    const { startLoading, stopLoading, isLoading } = useLoadingStore();
    const [step, setStep] = useState<number>(ASSET_TRANSFER_MODAL_STEPS.amount);
    const [feeData, setFeeData] = useState<{ fee: number; vat: number }>({ fee: 0, vat: 0 });
    const { activeSubAccount, subAccounts } = useAuthStore();
    const { refetchTransactions } = useAssetStore();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const fromSubAccount = activeSubAccount;
    const toSubAccounts = subAccounts.filter(
        (acc) =>
            acc.sub_account_id !== fromSubAccount?.sub_account_id &&
            hasSubAccountPermission(acc, SUB_ACCOUNT_PERMISSION.TRANSFER_CASH),
    );
    const [selectedToAccountId, setSelectedToAccountId] = useState(
        toSubAccounts[0]?.sub_account_id ?? '',
    );
    const toSubAccount =
        toSubAccounts.find((acc) => acc.sub_account_id === selectedToAccountId) ?? toSubAccounts[0];

    const dropdownRef = useClickOutside<HTMLDivElement>(() => {
        setIsDropdownOpen(false);
    }, isDropdownOpen);

    const fromAccount = formatSubAccountLabel(fromSubAccount ?? undefined);
    const toAccount = formatSubAccountLabel(toSubAccount);

    const handleSelectToAccount = (id: string) => {
        setSelectedToAccountId(id);
        setIsDropdownOpen(false);
    };

    const form = useForm({
        defaultValues: {
            amount: '',
        },
        onSubmit: async ({ value }) => {
            if (step === ASSET_TRANSFER_MODAL_STEPS.amount) {
                if (fromSubAccount && toSubAccount && value.amount) {
                    startLoading();
                    try {
                        const { error_code, result, message } = await calculateTransferFee(
                            fromSubAccount.sub_account_id,
                            Number(value.amount),
                            toSubAccount.sub_account_id,
                        );
                        if (isSuccessApi(error_code)) {
                            setFeeData({ fee: result.fee, vat: result.vat });
                            setStep(ASSET_TRANSFER_MODAL_STEPS.confirm);
                        } else {
                            toast.error(message);
                        }
                    } catch (err) {
                        toast.error(getApiErrorMessage(err, trans.common.try_again_error));
                    } finally {
                        stopLoading();
                    }
                }
            } else if (value.amount && fromSubAccount && toSubAccount) {
                startLoading();
                try {
                    const { error_code, message } = await transferMoney(
                        fromSubAccount.sub_account_id,
                        Number(value.amount),
                        toSubAccount.sub_account_id,
                    );
                    if (isSuccessApi(error_code)) {
                        toast.success(trans.assets.modals.transfer.success);
                        refetchTransactions(fromSubAccount.sub_account_id);
                        if (onConfirm) {
                            onConfirm(
                                value.amount,
                                fromSubAccount.sub_account_id,
                                toSubAccount.sub_account_id,
                            );
                        }
                        onClose();
                    } else {
                        toast.error(message);
                    }
                } catch (err) {
                    toast.error(getApiErrorMessage(err, trans.common.try_again_error));
                } finally {
                    stopLoading();
                }
            }
        },
    });

    const amount = useStore(form.store, (state) => state.values.amount);
    const canSubmit = useStore(form.store, (state) => state.canSubmit && !state.isSubmitting);

    const handleAmountChange = (value: string, fieldOnChange: (val: string) => void) => {
        fieldOnChange(sanitizeQuantityInput(value));
    };

    const handleBack = () => {
        setStep(ASSET_TRANSFER_MODAL_STEPS.amount);
    };

    const validateAmount = (value: string) => {
        if (!value || value === '0') {
            return trans.assets.modals.transfer.err_amount_required;
        }
        const numValue = Number(value);
        if (numValue <= 0) {
            return trans.assets.modals.transfer.err_amount_positive;
        }
        if (numValue > availableBalance) {
            return trans.assets.modals.transfer.err_amount_exceeds;
        }
        return undefined;
    };

    const formattedAmount = amount
        ? formatNumberVN(amount, { trimTrailingZeros: true }) + trans.assets.modals.common.currency
        : `0${trans.assets.modals.common.currency}`;
    const fee =
        formatNumberVN(feeData.fee, { trimTrailingZeros: true }) +
        trans.assets.modals.common.currency;
    const received = amount
        ? formatNumberVN(Number(amount) - feeData.fee, { trimTrailingZeros: true }) +
          trans.assets.modals.common.currency
        : `0${trans.assets.modals.common.currency}`;

    let dialogTitle: string;
    let dialogOnBack: (() => void) | undefined;

    switch (step) {
        case ASSET_TRANSFER_MODAL_STEPS.amount:
            dialogTitle = trans.assets.modals.transfer.title_amount;
            break;
        case ASSET_TRANSFER_MODAL_STEPS.confirm:
            dialogTitle = trans.assets.modals.transfer.title_confirm;
            dialogOnBack = handleBack;
            break;
        default:
            dialogTitle = trans.assets.modals.transfer.title_amount;
    }

    return (
        <>
            <Dialog title={dialogTitle} maxWidth="max-w-lg" onClose={onClose} onBack={dialogOnBack}>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                >
                    {step === ASSET_TRANSFER_MODAL_STEPS.amount ? (
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-2 items-center">
                                <span className="font-body-3 text-secondary">
                                    {trans.assets.modals.transfer.direction_to}
                                </span>
                                {toSubAccounts.length > 1 ? (
                                    <div ref={dropdownRef} className="relative">
                                        <button
                                            type="button"
                                            className="flex justify-between items-center gap-2 w-64 bg-tertiary rounded-xl px-3 py-2 cursor-pointer select-none"
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            aria-expanded={isDropdownOpen}
                                            aria-haspopup="listbox"
                                        >
                                            <span className="font-body-3-highlight text-primary">
                                                {toAccount}
                                            </span>
                                            <FaChevronDown
                                                className={`text-secondary shrink-0 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                                                aria-hidden="true"
                                                size={14}
                                            />
                                        </button>
                                        {isDropdownOpen && (
                                            <ul
                                                className="absolute top-full left-0 right-0 mt-1 bg-tertiary rounded-xl z-10 shadow-lg overflow-hidden list-none m-0 p-0"
                                                role="listbox"
                                            >
                                                {toSubAccounts.map((account) => {
                                                    const isSelected =
                                                        account.sub_account_id ===
                                                        selectedToAccountId;
                                                    return (
                                                        <li
                                                            key={account.sub_account_id}
                                                            role="option"
                                                            aria-selected={isSelected}
                                                            className={`p-4 font-body-3-highlight cursor-pointer hover:bg-quaternary transition-colors ${isSelected ? 'text-green' : 'text-primary'}`}
                                                            onClick={() =>
                                                                handleSelectToAccount(
                                                                    account.sub_account_id,
                                                                )
                                                            }
                                                        >
                                                            {formatSubAccountLabel(account)}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </div>
                                ) : (
                                    <span className="font-body-3-highlight text-primary">
                                        {toAccount}
                                    </span>
                                )}
                            </div>

                            <form.Field
                                name="amount"
                                validators={{
                                    onChange: ({ value }) => validateAmount(value),
                                    onBlur: ({ value }) => validateAmount(value),
                                }}
                            >
                                {(field) => (
                                    <div className="flex flex-col gap-2">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={
                                                    field.state.value
                                                        ? formatNumberVN(field.state.value, {
                                                              trimTrailingZeros: true,
                                                          })
                                                        : ''
                                                }
                                                onChange={(e) =>
                                                    handleAmountChange(
                                                        e.target.value,
                                                        field.handleChange,
                                                    )
                                                }
                                                onBlur={field.handleBlur}
                                                placeholder={
                                                    trans.assets.modals.transfer.placeholder_amount
                                                }
                                                className="w-full bg-tertiary rounded-xl px-4 py-3 font-body-3 text-primary placeholder:text-secondary border border-transparent focus:border-highlight focus:outline-none transition-colors pr-8"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-body-2 text-secondary">
                                                {trans.assets.modals.common.currency}
                                            </span>
                                        </div>
                                        {field.state.meta.errors.length > 0 && (
                                            <span className="font-caption text-red">
                                                {field.state.meta.errors[0]}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </form.Field>

                            <div className="flex items-center justify-between">
                                <span className="font-body-3 text-secondary">
                                    {trans.assets.modals.transfer.available}
                                </span>
                                <span className="font-body-3 text-primary">
                                    {formatNumberVN(availableBalance, { trimTrailingZeros: true })}
                                    {trans.assets.modals.common.currency}
                                </span>
                            </div>

                            <button
                                type="submit"
                                disabled={!canSubmit || !amount || isLoading}
                                className={`w-full py-3 rounded-xl font-body-3-highlight transition-colors ${
                                    canSubmit && amount && !isLoading
                                        ? 'bg-highlight text-quaternary hover:opacity-90'
                                        : 'bg-disabled text-disabled cursor-not-allowed'
                                }`}
                            >
                                {trans.assets.modals.transfer.continue}
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <div className="bg-tertiary rounded-xl overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-caption text-secondary">
                                            {trans.assets.modals.transfer.from}
                                        </span>
                                        <span className="font-body-2-highlight text-primary">
                                            {fromAccount}
                                        </span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-highlight flex items-center justify-center shrink-0">
                                        <span className="font-body-3-highlight text-quaternary">
                                            #
                                        </span>
                                    </div>
                                </div>

                                <div className="relative flex justify-center">
                                    <div className="absolute inset-x-0 top-1/2 h-px bg-quaternary" />
                                    <div className="relative z-10 w-7 h-7 rounded-full bg-quaternary flex items-center justify-center">
                                        <FaArrowDown className="text-secondary" size={14} />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between px-4 py-3">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-caption text-secondary">
                                            {trans.assets.modals.transfer.to}
                                        </span>
                                        <span className="font-body-2-highlight text-primary">
                                            {toAccount}
                                        </span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-highlight flex items-center justify-center shrink-0">
                                        <span className="font-body-3-highlight text-quaternary">
                                            #
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-tertiary rounded-xl px-4 py-3 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-body-3 text-secondary">
                                        {trans.assets.modals.transfer.amount_label}
                                    </span>
                                    <span className="font-body-3 text-primary">
                                        {formattedAmount}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-body-3 text-secondary">
                                        {trans.assets.modals.transfer.fee}
                                    </span>
                                    <span className="font-body-3 text-primary">{fee}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-body-3 text-secondary">
                                        {trans.assets.modals.transfer.received}
                                    </span>
                                    <span className="font-body-3 text-primary">{received}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 rounded-xl bg-highlight font-body-3-highlight text-quaternary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {trans.assets.modals.transfer.confirm}
                            </button>
                        </div>
                    )}
                </form>
            </Dialog>
        </>
    );
};
