'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/router';

import { OTPVerification } from '@/components/common/feature/OTPVerification';
import { Dialog } from '@/components/common/ui/Dialog';
import { HaybondConfirmSell } from '@/components/haybond/shared/HaybondConfirmSell';
import { HaybondConfirmSellSuccess } from '@/components/haybond/shared/HaybondConfirmSellSuccess';
import { HaybondWarningSell } from '@/components/haybond/shared/HaybondWarningSell';
import { HAYBOND_OTP_TYPE, TERM_SELL_FLOW_STEPS } from '@/constants/haybond';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { postRequestOtpV3, postVerifyOtpV3 } from '@/services/api/auth/otp';
import {
    fetchHayBondSavingBooksClosing,
    fetchHayBondSavingBooksClosingPreview,
    fetchHayBondSavingBooksDetail,
    updateHayBondSavingBooksClosing,
} from '@/services/api/bond-enterprise/saving-books';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useHaybondStore } from '@/stores/haybond/useHaybondStore';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';

export const HaybondTermSellFlow = () => {
    const trans = useTranslate();
    const router = useRouter();
    const { profile } = useAuthStore();
    const {
        isSellOpen,
        sellStep,
        sellSavingBookId,
        setSellStep,
        resetSellFlow,
        setDataClosing,
        setDataDetailSaving,
        setIsOverlayLoading,
    } = useHaybondStore();

    const getDialogMeta = () => {
        switch (sellStep) {
            case TERM_SELL_FLOW_STEPS.WARNING:
                return { title: undefined, maxWidth: 'max-w-md' };
            case TERM_SELL_FLOW_STEPS.CONFIRM:
                return {
                    title: trans.haybond.confirm_early_sell,
                    onBack: () => setSellStep(TERM_SELL_FLOW_STEPS.WARNING),
                    maxWidth: 'max-w-3xl',
                };
            case TERM_SELL_FLOW_STEPS.OTP:
                return {
                    title: trans.otp_verification.title,
                    onBack: () => setSellStep(TERM_SELL_FLOW_STEPS.CONFIRM),
                    maxWidth: 'max-w-md',
                };
            case TERM_SELL_FLOW_STEPS.SUCCESS:
                return { title: undefined, maxWidth: 'max-w-md' };
            default:
                return { title: undefined };
        }
    };

    const handleSendOtp = async (
        captchaToken: string,
    ): Promise<{ success: boolean; remainSecond?: number }> => {
        const email = profile?.email ?? '';
        if (!captchaToken || !email) {
            toast.error(trans.haybond.email_not_found);
            return { success: false };
        }
        setIsOverlayLoading(true);
        try {
            const { error_code, message, result } = await postRequestOtpV3({
                email,
                type: HAYBOND_OTP_TYPE,
            });
            if (isSuccessApi(error_code)) {
                return { success: true, remainSecond: result.remain_second };
            }
            toast.error(message);
            return { success: false };
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.haybond.response_message.system_error));
            return { success: false };
        } finally {
            setIsOverlayLoading(false);
        }
    };

    const handleVerifyOtp = async (otp: string): Promise<boolean> => {
        const email = profile?.email ?? '';
        if (!email || otp.length !== 6) return false;
        setIsOverlayLoading(true);
        try {
            const { error_code, result, message } = await postVerifyOtpV3({
                email,
                type: HAYBOND_OTP_TYPE,
                otp,
            });
            if (!isSuccessApi(error_code)) {
                toast.error(message);
                return false;
            }
            const sellRes = await updateHayBondSavingBooksClosing(sellSavingBookId, result.token);
            if (isSuccessApi(sellRes.error_code)) {
                const [dataDetail, dataClosing] = await Promise.all([
                    fetchHayBondSavingBooksDetail(sellSavingBookId),
                    fetchHayBondSavingBooksClosing(sellSavingBookId),
                ]);
                if (isSuccessApi(dataDetail.error_code)) {
                    setDataDetailSaving({
                        ...dataDetail.data,
                        allow_close: dataClosing.data?.allow_close ?? false,
                    });
                    setDataClosing({
                        id: sellSavingBookId,
                        profit: dataDetail.data.interest_rate,
                    });
                } else {
                    router.push('/haybond');
                    toast.error(dataDetail.message);
                }
                setSellStep(TERM_SELL_FLOW_STEPS.SUCCESS);
                return true;
            }
            toast.error(sellRes.message);
            return false;
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.haybond.response_message.system_error));
            return false;
        } finally {
            setIsOverlayLoading(false);
        }
    };

    const renderStep = () => {
        switch (sellStep) {
            case TERM_SELL_FLOW_STEPS.WARNING:
                return <HaybondWarningSell />;
            case TERM_SELL_FLOW_STEPS.CONFIRM:
                return <HaybondConfirmSell />;
            case TERM_SELL_FLOW_STEPS.OTP:
                return (
                    <OTPVerification
                        identifier={profile?.email ?? ''}
                        isIndividual={false}
                        onSendOtp={handleSendOtp}
                        onVerifyOtp={handleVerifyOtp}
                    />
                );
            case TERM_SELL_FLOW_STEPS.SUCCESS:
                return <HaybondConfirmSellSuccess />;
            default:
                return null;
        }
    };

    useEffect(() => {
        if (!isSellOpen || !sellSavingBookId) return;
        const init = async () => {
            setIsOverlayLoading(true);
            try {
                const [previewRes, detailRes] = await Promise.all([
                    fetchHayBondSavingBooksClosingPreview(sellSavingBookId),
                    fetchHayBondSavingBooksDetail(sellSavingBookId),
                ]);
                if (!isSuccessApi(previewRes.error_code)) {
                    toast.error(previewRes.message);
                    resetSellFlow();
                    return;
                }
                const { data } = previewRes;
                setDataClosing({
                    id: sellSavingBookId,
                    name: data.package_info.name,
                    start_date: data.start,
                    execute_date: data.agreement_data.execute_date,
                    amount: data.agreement_data.amount,
                    early_profit: data.end_early_interest_rate,
                    profit: isSuccessApi(detailRes.error_code) ? detailRes.data.interest_rate : 0,
                    trading_fee: data.agreement_data.fee,
                    net_amount: data.agreement_data.net_amount,
                    symbol: data.symbol,
                    quantity: data.agreement_data.quantity,
                    price: data.agreement_data.price,
                });
                setSellStep(TERM_SELL_FLOW_STEPS.WARNING);
            } catch (err) {
                toast.error(getApiErrorMessage(err, trans.haybond.response_message.system_error));
                resetSellFlow();
            } finally {
                setIsOverlayLoading(false);
            }
        };
        init();
    }, [isSellOpen, sellSavingBookId]);

    if (!isSellOpen) return null;

    const meta = getDialogMeta();

    return (
        <Dialog
            title={meta.title}
            maxWidth={meta.maxWidth ?? 'max-w-3xl'}
            onClose={resetSellFlow}
            onBack={meta.onBack}
        >
            {renderStep()}
        </Dialog>
    );
};
