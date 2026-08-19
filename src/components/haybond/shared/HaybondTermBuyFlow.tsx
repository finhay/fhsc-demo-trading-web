'use client';

import { useEffect } from 'react';

import { OTPVerification } from '@/components/common/feature/OTPVerification';
import { Dialog } from '@/components/common/ui/Dialog';
import { HaybondConfirmBuy } from '@/components/haybond/shared/HaybondConfirmBuy';
import { HaybondConfirmBuySuccess } from '@/components/haybond/shared/HaybondConfirmBuySuccess';
import { HaybondListCommand } from '@/components/haybond/shared/HaybondListCommand';
import { HaybondNotTrade } from '@/components/haybond/shared/HaybondNotTrade';
import { HaybondOrderBuy } from '@/components/haybond/shared/HaybondOrderBuy';
import {
    BTN_ORDERS_HISTORIES,
    BTN_OWNERSHIP_HISTORIES,
    HAYBOND_OTP_TYPE,
    TERM_BUY_FLOW_STEPS,
} from '@/constants/haybond';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { postRequestOtpV3, postVerifyOtpV3 } from '@/services/api/auth/otp';
import { fetchHayBondContractsActors } from '@/services/api/bond-enterprise/bonds';
import { postHayBondPackagesBuying } from '@/services/api/bond-enterprise/orders';
import { fetchHayBondPackagesBuyPrice } from '@/services/api/bond-enterprise/packages';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useHaybondStore } from '@/stores/haybond/useHaybondStore';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';
import { getErrorMessageHaybondBuying } from '@/utils/haybond';

export const HaybondTermBuyFlow = () => {
    const trans = useTranslate();
    const { profile } = useAuthStore();
    const {
        isBuyOpen,
        buyStep,
        buyPackageId,
        setBuyStep,
        resetBuyFlow,
        termBuyData,
        setTermBuyData,
        resetTermBuyData,
        setIsOverlayLoading,
        fetchOrdersHistories,
        fetchOwnershipHistories,
    } = useHaybondStore();

    const handleClose = () => {
        resetTermBuyData();
        resetBuyFlow();
    };

    const getDialogMeta = () => {
        switch (buyStep) {
            case TERM_BUY_FLOW_STEPS.ORDER:
                return { title: trans.haybond.buy_haybond };
            case TERM_BUY_FLOW_STEPS.CONFIRM:
                return {
                    title: trans.haybond.confirm_trade,
                    onBack: () => setBuyStep(TERM_BUY_FLOW_STEPS.ORDER),
                };
            case TERM_BUY_FLOW_STEPS.LIST_COMMAND:
                return {
                    title: trans.haybond.order_list,
                    onBack: () => setBuyStep(TERM_BUY_FLOW_STEPS.CONFIRM),
                };
            case TERM_BUY_FLOW_STEPS.OTP:
                return {
                    title: trans.otp_verification.title,
                    onBack: () => setBuyStep(TERM_BUY_FLOW_STEPS.CONFIRM),
                    maxWidth: 'max-w-md',
                };
            case TERM_BUY_FLOW_STEPS.SUCCESS:
            case TERM_BUY_FLOW_STEPS.NOT_TRADE:
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
            const buyRes = await postHayBondPackagesBuying(
                {
                    package_id: termBuyData.packageInfo.id,
                    amount: termBuyData.bondAmount,
                    vendor_id: termBuyData.agreementData[0].vendor_id,
                },
                result.token,
            );
            if (isSuccessApi(buyRes.error_code)) {
                await Promise.all([
                    fetchOrdersHistories({
                        page: 1,
                        status: BTN_ORDERS_HISTORIES.KEY_ALL,
                        isLoadMore: false,
                    }),
                    fetchOwnershipHistories({
                        page: 1,
                        status: BTN_OWNERSHIP_HISTORIES.KEY_HOLDING,
                        isLoadMore: false,
                    }),
                ]);
                setBuyStep(TERM_BUY_FLOW_STEPS.SUCCESS);
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
            case TERM_BUY_FLOW_STEPS.ORDER:
                return <HaybondOrderBuy />;
            case TERM_BUY_FLOW_STEPS.CONFIRM:
                return <HaybondConfirmBuy />;
            case TERM_BUY_FLOW_STEPS.LIST_COMMAND:
                return <HaybondListCommand />;
            case TERM_BUY_FLOW_STEPS.OTP:
                return (
                    <OTPVerification
                        identifier={profile?.email ?? ''}
                        isIndividual={false}
                        onSendOtp={handleSendOtp}
                        onVerifyOtp={handleVerifyOtp}
                    />
                );
            case TERM_BUY_FLOW_STEPS.SUCCESS:
                return <HaybondConfirmBuySuccess />;
            case TERM_BUY_FLOW_STEPS.NOT_TRADE:
                return <HaybondNotTrade />;
            default:
                return null;
        }
    };

    useEffect(() => {
        if (!isBuyOpen || !buyPackageId) return;
        const init = async () => {
            setIsOverlayLoading(true);
            try {
                const actorsRes = await fetchHayBondContractsActors();
                if (actorsRes.data) {
                    setBuyStep(TERM_BUY_FLOW_STEPS.NOT_TRADE);
                    return;
                }
                const priceRes = await fetchHayBondPackagesBuyPrice(buyPackageId);
                if (isSuccessApi(priceRes.error_code)) {
                    setTermBuyData({ price: priceRes.data.price });
                    setBuyStep(TERM_BUY_FLOW_STEPS.ORDER);
                } else {
                    toast.error(priceRes.message);
                    resetBuyFlow();
                }
            } catch (err) {
                toast.error(getApiErrorMessage(err, trans.haybond.response_message.system_error));
                resetBuyFlow();
            } finally {
                setIsOverlayLoading(false);
            }
        };
        init();
    }, [isBuyOpen, buyPackageId]);

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
