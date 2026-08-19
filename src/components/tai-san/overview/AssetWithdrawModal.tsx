'use client';

import { useForm, useStore } from '@tanstack/react-form';

import { useState } from 'react';

import { OTPVerification } from '@/components/common/feature/OTPVerification';
import { Dialog } from '@/components/common/ui/Dialog';
import { ASSET_WITHDRAW_MODAL_STEPS, MIN_WITHDRAW_AMOUNT } from '@/constants/assets';
import { toast } from '@/hooks/lib/useToast';
import { postSendOtpPublic } from '@/services/api/auth/otp';
import { withdrawToDefaultBank } from '@/services/api/payments';
import { useAssetStore } from '@/stores/assets/useAssetStore';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { sanitizeQuantityInput } from '@/utils/assets';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';
import { formatNumberVN } from '@/utils/format';

const MODALS_WITHDRAW = {
    title_amount: 'Bạn muốn rút bao nhiêu tiền?',
    title_confirm: 'Xác nhận yêu cầu rút tiền',
    withdraw_amount: 'Số tiền rút',
    placeholder_amount: '0',
    available: 'Tiền khả dụng',
    continue: 'Tiếp tục',
    source: 'Nguồn tiền',
    withdraw_fee: 'Phí rút',
    received: 'Thực nhận',
    destination_account: 'Tài khoản nhận',
    confirm: 'Xác nhận',
    success: 'Rút tiền thành công',
    err_amount_required: 'Vui lòng nhập số tiền cần rút',
    err_amount_positive: 'Số tiền phải lớn hơn 0',
    err_amount_exceeds: 'Số tiền vượt quá số dư khả dụng',
    err_min_withdraw: 'Số tiền rút tối thiểu là {amount}',
    otp_send_failed: 'Không thể gửi OTP',
};

type Props = {
    availableBalance: number;
    onClose: () => void;
};

export const AssetWithdrawModal = ({ availableBalance, onClose }: Props) => {
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
                        'Số tiền rút tối thiểu là {amount}'.replace(
                            '{amount}',
                            `${formatNumberVN(MIN_WITHDRAW_AMOUNT, { trimTrailingZeros: true })}${'đ'}`,
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
            return 'Vui lòng nhập số tiền cần rút';
        }
        const numValue = Number(value);
        if (numValue <= 0) {
            return 'Số tiền phải lớn hơn 0';
        }
        if (numValue > availableBalance) {
            return 'Số tiền vượt quá số dư khả dụng';
        }
        if (numValue < MIN_WITHDRAW_AMOUNT) {
            return 'Số tiền rút tối thiểu là {amount}'.replace(
                '{amount}',
                `${formatNumberVN(MIN_WITHDRAW_AMOUNT, { trimTrailingZeros: true })}${'đ'}`,
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

            toast.error(message || 'Không thể gửi OTP');
            return { success: false };
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Không thể gửi OTP'));
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

                toast.success('Rút tiền thành công');
                onClose();
                return true;
            }

            toast.error(message);
            return false;
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Có lỗi xảy ra, vui lòng thử lại'));
            return false;
        } finally {
            stopLoading();
        }
    };

    const formattedAmount = amount
        ? formatNumberVN(amount, { trimTrailingZeros: true }) + 'đ'
        : `0${'đ'}`;
    const fee = `0${'đ'}`;
    const received = formattedAmount;

    let dialogTitle: string;
    let dialogOnBack: (() => void) | undefined;

    switch (step) {
        case ASSET_WITHDRAW_MODAL_STEPS.amount:
            dialogTitle = 'Bạn muốn rút bao nhiêu tiền?';
            break;
        case ASSET_WITHDRAW_MODAL_STEPS.confirm:
            dialogTitle = 'Xác nhận yêu cầu rút tiền';
            dialogOnBack = handleBack;
            break;
        case ASSET_WITHDRAW_MODAL_STEPS.otp:
            dialogTitle = 'Xác thực OTP';
            dialogOnBack = handleBack;
            break;
        default:
            dialogTitle = 'Bạn muốn rút bao nhiêu tiền?';
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
                                                {'Số tiền rút'}
                                            </label>
                                            <div className="bg-tertiary rounded-xl px-4 py-0.5 border border-transparent focus-within:border-highlight transition-colors">
                                                <span className="font-caption text-secondary">
                                                    {'Số tiền rút'}
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
                                                    placeholder={MODALS_WITHDRAW.placeholder_amount}
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
                                    {'Tiền khả dụng'}
                                </span>
                                <span className="font-body-3 text-primary">
                                    {formatNumberVN(availableBalance, { trimTrailingZeros: true })}
                                    {'đ'}
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
                                {'Tiếp tục'}
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <div className="bg-tertiary rounded-xl px-4 py-3 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-body-3 text-secondary">
                                        {'Nguồn tiền'}
                                    </span>
                                    <span className="font-body-3 text-primary text-right">
                                        {sourceAccount}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-body-3 text-secondary">
                                        {'Số tiền rút'}
                                    </span>
                                    <span className="font-body-3 text-primary">
                                        {formattedAmount}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-body-3 text-secondary">{'Phí rút'}</span>
                                    <span className="font-body-3 text-primary">{fee}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-body-3 text-secondary">
                                        {'Thực nhận'}
                                    </span>
                                    <span className="font-body-3 text-primary">{received}</span>
                                </div>
                            </div>

                            <div className="bg-tertiary rounded-xl px-4 py-3 flex flex-col gap-1">
                                <div className="flex items-start justify-between gap-4">
                                    <span className="font-body-3 text-secondary shrink-0">
                                        {'Tài khoản nhận'}
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
                                {'Xác nhận'}
                            </button>
                        </div>
                    )}
                </form>
            )}
        </Dialog>
    );
};
