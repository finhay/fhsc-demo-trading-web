'use client';

import { useForm, useStore } from '@tanstack/react-form';

import { useState } from 'react';

import { OTPVerification } from '@/components/common/feature/OTPVerification';
import { Dialog } from '@/components/common/ui/Dialog';
import { ASSET_WITHDRAW_MODAL_STEPS, MIN_WITHDRAW_AMOUNT } from '@/constants/assets';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { postSendOtpPublic } from '@/services/api/auth/otp';
import { withdrawToDefaultBank } from '@/services/api/payments';
import { useAssetStore } from '@/stores/assets/useAssetStore';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { sanitizeQuantityInput } from '@/utils/assets';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';
import { formatNumberVN } from '@/utils/format';

type Props = {
    availableBalance: number;
    onClose: () => void;
};

export const AssetWithdrawModal = ({ availableBalance, onClose }: Props) => {
    const trans = useTranslate();
    const { startLoading, stopLoading, isLoading: isGlobalLoading } = useLoadingStore();
    const [step, setStep] = useState<number>(ASSET_WITHDRAW_MODAL_STEPS.amount);

    const { activeSubAccount, profile } = useAuthStore();
    const { refetchTransactions } = useAssetStore();

    const sourceAccount = activeSubAccount?.sub_account_ext || '';
    const bankName = profile?.bank_name || '';
    const accountHolder = profile?.bank_account_name || '';
    const accountNumber = profile?.bank_account_number || '';
    const userPhone = profile?.phone || '';
    const userEmail = profile?.email || '';
    const isIndividual = profile?.user_type === 'INDIVIDUAL';

    const phone = isIndividual ? userPhone : '';
    const email = isIndividual ? '' : userEmail;

    const form = useForm({
        defaultValues: {
            amount: '',
        },
        onSubmit: async ({ value }) => {
            if (step === ASSET_WITHDRAW_MODAL_STEPS.amount) {
                setStep(ASSET_WITHDRAW_MODAL_STEPS.confirm);
            } else if (step === ASSET_WITHDRAW_MODAL_STEPS.confirm) {
                const numAmount = Number(value.amount);
                if (numAmount < MIN_WITHDRAW_AMOUNT) {
                    toast.error(
                        trans.assets.modals.withdraw.err_min_withdraw.replace(
                            '{amount}',
                            `${formatNumberVN(MIN_WITHDRAW_AMOUNT, { trimTrailingZeros: true })}${trans.assets.modals.common.currency}`,
                        ),
                    );
                    return;
                }
                setStep(ASSET_WITHDRAW_MODAL_STEPS.otp);
            }
        },
    });

    const amount = useStore(form.store, (state) => state.values.amount);
    const canSubmit = useStore(form.store, (state) => state.canSubmit && !state.isSubmitting);
    const isLoading = useStore(form.store, (state) => state.isSubmitting) || isGlobalLoading;

    const handleAmountChange = (value: string, fieldOnChange: (val: string) => void) => {
        fieldOnChange(sanitizeQuantityInput(value));
    };

    const handleBack = () => {
        if (step === ASSET_WITHDRAW_MODAL_STEPS.confirm) setStep(ASSET_WITHDRAW_MODAL_STEPS.amount);
        else if (step === ASSET_WITHDRAW_MODAL_STEPS.otp)
            setStep(ASSET_WITHDRAW_MODAL_STEPS.confirm);
    };

    const validateAmount = (value: string) => {
        if (!value || value === '0') {
            return trans.assets.modals.withdraw.err_amount_required;
        }
        const numValue = Number(value);
        if (numValue <= 0) {
            return trans.assets.modals.withdraw.err_amount_positive;
        }
        if (numValue > availableBalance) {
            return trans.assets.modals.withdraw.err_amount_exceeds;
        }
        if (numValue < MIN_WITHDRAW_AMOUNT) {
            return trans.assets.modals.withdraw.err_min_withdraw.replace(
                '{amount}',
                `${formatNumberVN(MIN_WITHDRAW_AMOUNT, { trimTrailingZeros: true })}${trans.assets.modals.common.currency}`,
            );
        }
        return undefined;
    };

    const handleSendOtp = async (
        captchaToken: string,
    ): Promise<{ success: boolean; remainSecond?: number }> => {
        if (!captchaToken) return { success: false };

        startLoading();
        try {
            const { error_code, message, result } = await postSendOtpPublic(
                'TRADING_OTP',
                captchaToken,
                phone,
                email,
            );

            if (isSuccessApi(error_code)) {
                return { success: true, remainSecond: result.remain_second };
            }

            toast.error(message || trans.assets.modals.withdraw.otp_send_failed);
            return { success: false };
        } catch (error) {
            toast.error(getApiErrorMessage(error, trans.assets.modals.withdraw.otp_send_failed));
            return { success: false };
        } finally {
            stopLoading();
        }
    };

    const handleVerifyOtp = async (otp: string): Promise<boolean> => {
        if (!otp || otp.length !== 6 || !activeSubAccount) return false;

        startLoading();
        try {
            const { error_code, message } = await withdrawToDefaultBank(
                activeSubAccount.sub_account_id,
                amount,
                otp,
                phone,
                email,
            );

            if (isSuccessApi(error_code)) {
                await new Promise((resolve) => setTimeout(resolve, 2000));

                if (activeSubAccount) {
                    refetchTransactions(activeSubAccount.sub_account_id);
                }

                toast.success(trans.assets.modals.withdraw.success);
                onClose();
                return true;
            }

            toast.error(message);
            return false;
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.common.try_again_error));
            return false;
        } finally {
            stopLoading();
        }
    };

    const formattedAmount = amount
        ? formatNumberVN(amount, { trimTrailingZeros: true }) + trans.assets.modals.common.currency
        : `0${trans.assets.modals.common.currency}`;
    const fee = `0${trans.assets.modals.common.currency}`;
    const received = formattedAmount;

    let dialogTitle: string;
    let dialogOnBack: (() => void) | undefined;

    switch (step) {
        case ASSET_WITHDRAW_MODAL_STEPS.amount:
            dialogTitle = trans.assets.modals.withdraw.title_amount;
            break;
        case ASSET_WITHDRAW_MODAL_STEPS.confirm:
            dialogTitle = trans.assets.modals.withdraw.title_confirm;
            dialogOnBack = handleBack;
            break;
        case ASSET_WITHDRAW_MODAL_STEPS.otp:
            dialogTitle = trans.otp_verification.title;
            dialogOnBack = handleBack;
            break;
        default:
            dialogTitle = trans.assets.modals.withdraw.title_amount;
    }

    return (
        <Dialog
            title={dialogTitle}
            maxWidth={step === ASSET_WITHDRAW_MODAL_STEPS.otp ? 'max-w-md' : 'max-w-lg'}
            onClose={onClose}
            onBack={dialogOnBack}
        >
            {step === ASSET_WITHDRAW_MODAL_STEPS.otp ? (
                <OTPVerification
                    identifier={isIndividual ? userPhone : userEmail}
                    isIndividual={isIndividual}
                    onClose={onClose}
                    onSendOtp={handleSendOtp}
                    onVerifyOtp={handleVerifyOtp}
                />
            ) : (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                >
                    {step === ASSET_WITHDRAW_MODAL_STEPS.amount ? (
                        <div className="flex flex-col gap-4">
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
                                            <label htmlFor="withdraw-input" className="sr-only">
                                                {trans.assets.modals.withdraw.withdraw_amount}
                                            </label>
                                            <div className="bg-tertiary rounded-xl px-4 py-0.5 border border-transparent focus-within:border-highlight transition-colors">
                                                <span className="font-caption text-secondary">
                                                    {trans.assets.modals.withdraw.withdraw_amount}
                                                </span>
                                                <input
                                                    id="withdraw-input"
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
                                                        trans.assets.modals.withdraw
                                                            .placeholder_amount
                                                    }
                                                    className="w-full bg-transparent font-body-3 text-primary placeholder:text-secondary focus:outline-none"
                                                />
                                            </div>
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
                                    {trans.assets.modals.withdraw.available}
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
                                {trans.assets.modals.withdraw.continue}
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <div className="bg-tertiary rounded-xl px-4 py-3 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-body-3 text-secondary">
                                        {trans.assets.modals.withdraw.source}
                                    </span>
                                    <span className="font-body-3 text-primary text-right">
                                        {sourceAccount}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-body-3 text-secondary">
                                        {trans.assets.modals.withdraw.withdraw_amount}
                                    </span>
                                    <span className="font-body-3 text-primary">
                                        {formattedAmount}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-body-3 text-secondary">
                                        {trans.assets.modals.withdraw.withdraw_fee}
                                    </span>
                                    <span className="font-body-3 text-primary">{fee}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-body-3 text-secondary">
                                        {trans.assets.modals.withdraw.received}
                                    </span>
                                    <span className="font-body-3 text-primary">{received}</span>
                                </div>
                            </div>

                            <div className="bg-tertiary rounded-xl px-4 py-3 flex flex-col gap-1">
                                <div className="flex items-start justify-between gap-4">
                                    <span className="font-body-3 text-secondary shrink-0">
                                        {trans.assets.modals.withdraw.destination_account}
                                    </span>
                                    <div className="flex flex-col items-end gap-0.5">
                                        <span className="font-body-3-highlight text-primary text-right">
                                            {bankName}
                                        </span>
                                        <span className="font-body-3 text-primary">
                                            {accountHolder}
                                        </span>
                                        <span className="font-body-3 text-primary">
                                            {accountNumber}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 rounded-xl bg-highlight font-body-3-highlight text-quaternary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {trans.assets.modals.withdraw.confirm}
                            </button>
                        </div>
                    )}
                </form>
            )}
        </Dialog>
    );
};
