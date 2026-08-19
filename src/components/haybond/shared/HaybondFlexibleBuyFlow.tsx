'use client';

import { OTPVerification } from '@/components/common/feature/OTPVerification';
import { Dialog } from '@/components/common/ui/Dialog';
import { HaybondFlexibleConfirmBuy } from '@/components/haybond/shared/HaybondFlexibleConfirmBuy';
import { HaybondFlexibleConfirmBuySuccess } from '@/components/haybond/shared/HaybondFlexibleConfirmBuySuccess';
import { HaybondFlexibleListCommand } from '@/components/haybond/shared/HaybondFlexibleListCommand';
import { HaybondFlexibleOrderBuy } from '@/components/haybond/shared/HaybondFlexibleOrderBuy';
import {
    BTN_ORDERS_HISTORIES,
    BTN_OWNERSHIP_HISTORIES,
    FLEXIBLE_BUY_FLOW_STEPS,
    HAYBOND_OTP_TYPE,
} from '@/constants/haybond';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { postRequestOtpV3, postVerifyOtpV3 } from '@/services/api/auth/otp';
import { postHayBondDynamicPackagesBuying } from '@/services/api/bond-enterprise/orders';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useHaybondFlexStore } from '@/stores/haybond/useHaybondFlexStore';
import { useHaybondStore } from '@/stores/haybond/useHaybondStore';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';
import { getErrorMessageHaybondBuying } from '@/utils/haybond';

export const HaybondFlexibleBuyFlow = () => {
    const trans = useTranslate();
    const { profile } = useAuthStore();
    const {
        isBuyOpen,
        buyStep,
        setBuyStep,
        resetBuyFlow,
        packageDynamic,
        buyPriceDynamic,
        bondDynamicAmount,
        dataPreview,
        setDataBuyingSuccess,
        resetForm,
        setIsOverlayLoading,
    } = useHaybondFlexStore();
    const { fetchOrdersHistories, fetchOwnershipHistories, fetchOwnershipHistoriesDynamic } =
        useHaybondStore();

    const handleClose = () => {
        resetForm();
        resetBuyFlow();
    };

    const getDialogMeta = () => {
        switch (buyStep) {
            case FLEXIBLE_BUY_FLOW_STEPS.ORDER:
                return { title: trans.haybond.buy_haybond };
            case FLEXIBLE_BUY_FLOW_STEPS.CONFIRM:
                return {
                    title: trans.haybond.confirm_trade,
                    onBack: () => setBuyStep(FLEXIBLE_BUY_FLOW_STEPS.ORDER),
                };
            case FLEXIBLE_BUY_FLOW_STEPS.LIST_COMMAND:
                return {
                    title: trans.haybond.order_list,
                    onBack: () => setBuyStep(FLEXIBLE_BUY_FLOW_STEPS.CONFIRM),
                };
            case FLEXIBLE_BUY_FLOW_STEPS.OTP:
                return {
                    title: trans.otp_verification.title,
                    onBack: () => setBuyStep(FLEXIBLE_BUY_FLOW_STEPS.CONFIRM),
                    maxWidth: 'max-w-md',
                };
            case FLEXIBLE_BUY_FLOW_STEPS.SUCCESS:
                return { title: undefined, maxWidth: 'max-w-md' };
            default:
                return { title: trans.haybond.buy_haybond };
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
            const buyRes = await postHayBondDynamicPackagesBuying(
                {
                    flexible_package_id: packageDynamic.id,
                    amount: bondDynamicAmount,
                    vendor_id: dataPreview.agreementData[0].vendor_id,
                    bond_id: buyPriceDynamic.bondId,
                },
                result.token,
            );
            if (isSuccessApi(buyRes.error_code)) {
                setDataBuyingSuccess(buyRes.data);
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
                setBuyStep(FLEXIBLE_BUY_FLOW_STEPS.SUCCESS);
                return true;
            }
            getErrorMessageHaybondBuying(buyRes.error_code, trans, buyRes.message);
            return false;
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.haybond.response_message.system_error));
            return false;
        } finally {
            setIsOverlayLoading(false);
        }
    };

    const renderStep = () => {
        switch (buyStep) {
            case FLEXIBLE_BUY_FLOW_STEPS.ORDER:
                return <HaybondFlexibleOrderBuy />;
            case FLEXIBLE_BUY_FLOW_STEPS.CONFIRM:
                return <HaybondFlexibleConfirmBuy />;
            case FLEXIBLE_BUY_FLOW_STEPS.LIST_COMMAND:
                return <HaybondFlexibleListCommand />;
            case FLEXIBLE_BUY_FLOW_STEPS.OTP:
                return (
                    <OTPVerification
                        identifier={profile?.email ?? ''}
                        isIndividual={false}
                        onSendOtp={handleSendOtp}
                        onVerifyOtp={handleVerifyOtp}
                    />
                );
            case FLEXIBLE_BUY_FLOW_STEPS.SUCCESS:
                return <HaybondFlexibleConfirmBuySuccess />;
            default:
                return null;
        }
    };

    if (!isBuyOpen) return null;

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
