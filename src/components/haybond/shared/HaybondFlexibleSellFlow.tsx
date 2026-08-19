'use client';

import { OTPVerification } from '@/components/common/feature/OTPVerification';
import { Dialog } from '@/components/common/ui/Dialog';
import { HaybondFlexibleConfirmSell } from '@/components/haybond/shared/HaybondFlexibleConfirmSell';
import { HaybondFlexibleConfirmSellSuccess } from '@/components/haybond/shared/HaybondFlexibleConfirmSellSuccess';
import { HaybondFlexibleFormSell } from '@/components/haybond/shared/HaybondFlexibleFormSell';
import { HaybondFlexibleListCommandSell } from '@/components/haybond/shared/HaybondFlexibleListCommandSell';
import { HaybondFlexibleProcess } from '@/components/haybond/shared/HaybondFlexibleProcess';
import { HaybondFlexibleWarningSell } from '@/components/haybond/shared/HaybondFlexibleWarningSell';
import {
    BTN_ORDERS_HISTORIES,
    BTN_OWNERSHIP_HISTORIES,
    FLEXIBLE_SELL_FLOW_STEPS,
    HAYBOND_OTP_TYPE,
} from '@/constants/haybond';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { postRequestOtpV3, postVerifyOtpV3 } from '@/services/api/auth/otp';
import { updateHayBondDynamicSavingBooksClosing } from '@/services/api/bond-enterprise/saving-books';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useHaybondFlexStore } from '@/stores/haybond/useHaybondFlexStore';
import { useHaybondStore } from '@/stores/haybond/useHaybondStore';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';

export const HaybondFlexibleSellFlow = () => {
    const trans = useTranslate();
    const { profile } = useAuthStore();
    const {
        isSellOpen,
        sellStep,
        setSellStep,
        resetSellFlow,
        bondDynamicSellAmount,
        resetForm,
        setIsOverlayLoading,
    } = useHaybondFlexStore();
    const { fetchOrdersHistories, fetchOwnershipHistories, fetchOwnershipHistoriesDynamic } =
        useHaybondStore();

    const handleClose = () => {
        resetForm();
        resetSellFlow();
    };

    const getDialogMeta = () => {
        switch (sellStep) {
            case FLEXIBLE_SELL_FLOW_STEPS.FORM:
                return { title: trans.haybond.sell_flexible };
            case FLEXIBLE_SELL_FLOW_STEPS.WARNING:
                return { title: undefined, maxWidth: 'max-w-md' };
            case FLEXIBLE_SELL_FLOW_STEPS.CONFIRM:
                return {
                    title: trans.haybond.confirm_trade,
                    onBack: () => setSellStep(FLEXIBLE_SELL_FLOW_STEPS.FORM),
                };
            case FLEXIBLE_SELL_FLOW_STEPS.LIST_COMMAND:
                return {
                    title: trans.haybond.order_list,
                    onBack: () => setSellStep(FLEXIBLE_SELL_FLOW_STEPS.CONFIRM),
                };
            case FLEXIBLE_SELL_FLOW_STEPS.PROCESS:
                return {
                    title: trans.haybond.receive_process,
                    onBack: () => setSellStep(FLEXIBLE_SELL_FLOW_STEPS.CONFIRM),
                };
            case FLEXIBLE_SELL_FLOW_STEPS.OTP:
                return {
                    title: trans.otp_verification.title,
                    onBack: () => setSellStep(FLEXIBLE_SELL_FLOW_STEPS.CONFIRM),
                    maxWidth: 'max-w-md',
                };
            case FLEXIBLE_SELL_FLOW_STEPS.SUCCESS:
                return { title: undefined, maxWidth: 'max-w-md' };
            default:
                return { title: trans.haybond.sell_flexible };
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
            const sellRes = await updateHayBondDynamicSavingBooksClosing(
                bondDynamicSellAmount,
                result.token,
            );
            if (isSuccessApi(sellRes.error_code)) {
                await Promise.all([
                    fetchOrdersHistories({
                        page: 1,
                        status: BTN_ORDERS_HISTORIES.KEY_ALL,
                        isLoadMore: false,
                    }),
                    fetchOwnershipHistoriesDynamic({
                        page: 1,
                        status: BTN_OWNERSHIP_HISTORIES.KEY_HOLDING,
                        isLoadMore: false,
                    }),
                    fetchOwnershipHistories({
                        page: 1,
                        status: BTN_OWNERSHIP_HISTORIES.KEY_HOLDING,
                        isLoadMore: false,
                    }),
                ]);
                setSellStep(FLEXIBLE_SELL_FLOW_STEPS.SUCCESS);
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
            case FLEXIBLE_SELL_FLOW_STEPS.FORM:
                return <HaybondFlexibleFormSell />;
            case FLEXIBLE_SELL_FLOW_STEPS.WARNING:
                return <HaybondFlexibleWarningSell />;
            case FLEXIBLE_SELL_FLOW_STEPS.CONFIRM:
                return <HaybondFlexibleConfirmSell />;
            case FLEXIBLE_SELL_FLOW_STEPS.LIST_COMMAND:
                return <HaybondFlexibleListCommandSell />;
            case FLEXIBLE_SELL_FLOW_STEPS.PROCESS:
                return <HaybondFlexibleProcess />;
            case FLEXIBLE_SELL_FLOW_STEPS.OTP:
                return (
                    <OTPVerification
                        identifier={profile?.email ?? ''}
                        isIndividual={false}
                        onSendOtp={handleSendOtp}
                        onVerifyOtp={handleVerifyOtp}
                    />
                );
            case FLEXIBLE_SELL_FLOW_STEPS.SUCCESS:
                return <HaybondFlexibleConfirmSellSuccess />;
            default:
                return null;
        }
    };

    if (!isSellOpen) return null;

    const meta = getDialogMeta();

    return (
        <Dialog
            title={meta.title}
            maxWidth={meta.maxWidth ?? 'max-w-3xl'}
            onClose={handleClose}
            onBack={meta.onBack}
        >
            {renderStep()}
        </Dialog>
    );
};
