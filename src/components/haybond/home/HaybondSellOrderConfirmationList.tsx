'use client';

import { useEffect, useRef, useState } from 'react';

import { FaTriangleExclamation } from 'react-icons/fa6';
import { RiPictureInPicture2Line } from 'react-icons/ri';

import { OTPVerification } from '@/components/common/feature/OTPVerification';
import { Dialog } from '@/components/common/ui/Dialog';
import { HaybondNewSellOrderSummary } from '@/components/haybond/shared/HaybondNewSellOrderSummary';
import { HAYBOND_OTP_TYPE } from '@/constants/haybond';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { postRequestOtpV3, postVerifyOtpV3 } from '@/services/api/auth/otp';
import {
    getPreviewChange,
    getPreviewChangeById,
    updateSellOrder,
} from '@/services/api/bond-enterprise/saving-books';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useHaybondStore } from '@/stores/haybond/useHaybondStore';
import type { PreviewChangeDataItem } from '@/types/bond-enterprise/saving-books';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';
import { formatDate, formatNumberVN } from '@/utils/format';

type AgreementItem = {
    id: string;
    savingBookName: string;
    newSellDate: string;
    newSellAmount: number;
};

export const HaybondSellOrderConfirmationList = () => {
    const trans = useTranslate();
    const { profile } = useAuthStore();
    const { setIsOverlayLoading } = useHaybondStore();
    const [agreements, setAgreements] = useState<AgreementItem[]>([]);
    const [agreementData, setAgreementData] = useState<PreviewChangeDataItem[]>([]);
    const [isShowSellOrder, setIsShowSellOrder] = useState(false);
    const [isShowOtp, setIsShowOtp] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [successCount, setSuccessCount] = useState(0);
    const currentId = useRef<string | null>(null);
    const isFetching = useRef(false);
    const apiParams = useRef({
        newSellDate: '',
        newSellAmount: 0,
    });

    const handleConfirmSellOrder = () => {
        setIsShowSellOrder(false);
        setIsShowOtp(true);
    };

    const fetchAgreements = async () => {
        try {
            const { data } = await getPreviewChange();
            if (Array.isArray(data)) {
                setAgreements(data as unknown as AgreementItem[]);
            } else if (
                data &&
                Array.isArray((data as { agreements?: AgreementItem[] }).agreements)
            ) {
                setAgreements((data as { agreements: AgreementItem[] }).agreements);
            }
        } catch {
            return;
        }
    };

    const handlePreviewChange = async (id: string) => {
        if (isFetching.current) return;
        setIsOverlayLoading(true);
        if (currentId.current === id) {
            setIsShowSellOrder(true);
            setIsOverlayLoading(false);
            return;
        }
        setAgreementData([]);
        currentId.current = id;
        isFetching.current = true;
        try {
            const { data } = await getPreviewChangeById(id);
            const preview = data as { agreement_data?: PreviewChangeDataItem[] } | null;
            if (preview?.agreement_data) {
                setAgreementData(preview.agreement_data);
            }
            setIsShowSellOrder(true);
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.haybond.response_message.system_error));
        } finally {
            isFetching.current = false;
            setIsOverlayLoading(false);
        }
    };

    const handleSendOtp = async (captchaToken: string) => {
        try {
            const { error_code, message, result } = await postRequestOtpV3({
                email: profile?.email ?? '',
                type: HAYBOND_OTP_TYPE,
            });
            if (isSuccessApi(error_code)) {
                return { success: true, remainSecond: result.remain_second };
            }
            toast.error(message);
            return { success: false };
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.common.try_again_error));
            return { success: false };
        }
    };

    const handleVerifyOtp = async (otp: string) => {
        if (!currentId.current) return false;
        setIsOverlayLoading(true);
        try {
            const verifyRes = await postVerifyOtpV3({
                email: profile?.email ?? '',
                type: HAYBOND_OTP_TYPE,
                otp,
            });
            if (!isSuccessApi(verifyRes.error_code)) {
                toast.error(verifyRes.message);
                return false;
            }
            const { error_code, message } = await updateSellOrder(
                currentId.current,
                {
                    newSellDate: apiParams.current.newSellDate,
                    newSellAmount: apiParams.current.newSellAmount,
                },
                verifyRes.result.token,
            );
            if (isSuccessApi(error_code)) {
                setSuccessCount((prev) => prev + 1);
                setIsShowOtp(false);
                toast.success(trans.haybond.sell_confirm.confirm_success_msg);
                return true;
            }
            toast.error(message);
            return false;
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.haybond.response_message.system_error));
            return false;
        } finally {
            setIsOverlayLoading(false);
        }
    };

    useEffect(() => {
        fetchAgreements();
    }, []);

    useEffect(() => {
        if (successCount > 0) {
            fetchAgreements();
        }
    }, [successCount]);

    if (agreements.length === 0) return null;

    return (
        <>
            <div className="bg-tertiary border-highlight fixed right-4 bottom-4 z-40 flex w-full max-w-lg flex-col gap-4 rounded border p-3">
                <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                            <FaTriangleExclamation size={24} className="text-orange shrink-0" />
                            <span className="font-body-2-highlight text-primary">
                                {trans.haybond.sell_confirm.title}
                            </span>
                        </div>
                        <button
                            type="button"
                            className="text-highlight font-body-2-highlight flex shrink-0 cursor-pointer items-center gap-2"
                            onClick={() => setIsCollapsed((prev) => !prev)}
                        >
                            <span>
                                {isCollapsed
                                    ? trans.haybond.sell_confirm.expand
                                    : trans.haybond.sell_confirm.collapse}
                            </span>
                            <RiPictureInPicture2Line size={20} className="text-highlight" />
                        </button>
                    </div>
                    <p className="font-caption text-secondary whitespace-pre-line">
                        {trans.haybond.sell_confirm.disclaimer}
                    </p>
                </div>
                {!isCollapsed && (
                    <div className="flex max-h-48 min-h-0 flex-col gap-2 overflow-y-auto">
                        <div className="flex items-start gap-3">
                            <span className="font-tiny text-secondary min-w-0 flex-1">
                                {trans.haybond.sell_confirm.package}
                            </span>
                            <span className="font-tiny text-secondary shrink-0 text-right">
                                {trans.haybond.sell_confirm.new_amount}
                                <br />
                                {trans.haybond.sell_confirm.new_sell_date}
                            </span>
                            <span className="w-28 shrink-0" aria-hidden />
                        </div>
                        <div className="flex flex-col gap-4">
                            {agreements.map((item) => (
                                <div key={item.id} className="flex items-center gap-3">
                                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                                        <span className="font-body-3 text-primary">
                                            {item.savingBookName}
                                        </span>
                                        <button
                                            type="button"
                                            className="text-highlight font-caption-highlight cursor-pointer text-left"
                                            onClick={() => {
                                                apiParams.current = {
                                                    newSellDate: item.newSellDate,
                                                    newSellAmount: item.newSellAmount,
                                                };
                                                handlePreviewChange(item.id);
                                            }}
                                        >
                                            {trans.haybond.sell_confirm.view_order}
                                        </button>
                                    </div>
                                    <div className="flex shrink-0 flex-col items-end gap-1">
                                        <span className="font-body-3-highlight text-primary">
                                            {formatNumberVN(item.newSellAmount, {
                                                decimals: 0,
                                            })}
                                            đ
                                        </span>
                                        <span className="font-caption text-secondary">
                                            {formatDate(item.newSellDate)}
                                        </span>
                                    </div>
                                    <div className="flex w-28 shrink-0 justify-end">
                                        <button
                                            type="button"
                                            className="bg-success text-highlight font-body-3-highlight cursor-pointer rounded-full px-4 py-1.5"
                                            onClick={() => {
                                                apiParams.current = {
                                                    newSellDate: item.newSellDate,
                                                    newSellAmount: item.newSellAmount,
                                                };
                                                currentId.current = item.id;
                                                setIsShowOtp(true);
                                            }}
                                        >
                                            {trans.haybond.sell_confirm.confirm}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {isShowSellOrder && (
                <Dialog
                    title={trans.haybond.sell_confirm.title}
                    maxWidth="max-w-lg"
                    onClose={() => setIsShowSellOrder(false)}
                >
                    <HaybondNewSellOrderSummary
                        agreementData={agreementData}
                        onConfirm={handleConfirmSellOrder}
                        onClose={() => setIsShowSellOrder(false)}
                    />
                </Dialog>
            )}
            {isShowOtp && (
                <Dialog
                    title={trans.otp_verification.title}
                    maxWidth="max-w-md"
                    onClose={() => setIsShowOtp(false)}
                >
                    <OTPVerification
                        identifier={profile?.email ?? ''}
                        isIndividual={false}
                        onSendOtp={handleSendOtp}
                        onVerifyOtp={handleVerifyOtp}
                    />
                </Dialog>
            )}
        </>
    );
};
