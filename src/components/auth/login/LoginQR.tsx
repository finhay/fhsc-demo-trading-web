'use client';

import { useEffect, useState } from 'react';

import QRCode from 'react-qr-code';

import { AUTH_TIME, STATUS_QR } from '@/constants/auth';
import { toast } from '@/hooks/lib/useToast';
import { createQrLoginChallenge, pollQrLoginChallengeStatus } from '@/services/api/auth/qr';
import { getCustId, getRefreshToken } from '@/services/localStorage';
import { useAuthFlowStore } from '@/stores/auth/useAuthFlowStore';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';

export const LoginQR = () => {
    const [qrCodeId, setQrCodeId] = useState<string>('');
    const { closeAuthDialog } = useAuthFlowStore();
    const { setAuth, initialize } = useAuthStore();

    const handleGenerateQRCode = async () => {
        try {
            const { result, error_code, message } = await createQrLoginChallenge();
            if (isSuccessApi(error_code)) {
                setQrCodeId(result.id);
            } else {
                toast.error(message);
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Có lỗi xảy ra, vui lòng thử lại'));
        }
    };

    const handleVerifyAuthQR = async () => {
        try {
            const { error_code, result } = await pollQrLoginChallengeStatus(qrCodeId, 'LOGIN');
            if (isSuccessApi(error_code) && result.status === STATUS_QR.APPROVED) {
                setAuth({
                    accessToken: result.access_token!,
                    accessKey: result.access_key!,
                    refreshToken: result.refresh_token || getRefreshToken() || '',
                    userId: result.uid || result.user_id || '',
                    custId: result.cust_id || getCustId() || '',
                });

                await initialize();

                toast.success('Đăng nhập thành công!');
                closeAuthDialog();
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Có lỗi xảy ra, vui lòng thử lại'));
        }
    };

    useEffect(() => {
        handleGenerateQRCode();
    }, []);

    useEffect(() => {
        let timeoutVerifyQr: NodeJS.Timeout | undefined;
        let timeoutClear: NodeJS.Timeout | undefined;

        if (qrCodeId) {
            timeoutVerifyQr = setInterval(handleVerifyAuthQR, AUTH_TIME.VERIFY_QR);

            timeoutClear = setTimeout(() => {
                if (timeoutVerifyQr) {
                    clearInterval(timeoutVerifyQr);
                }
                closeAuthDialog();
            }, AUTH_TIME.CLEAR);
        }

        return () => {
            if (timeoutVerifyQr) clearInterval(timeoutVerifyQr);
            if (timeoutClear) clearTimeout(timeoutClear);
        };
    }, [qrCodeId]);

    return (
        <aside className="hidden sm:flex w-1/2 flex-col items-center justify-center gap-4 text-center text-primary bg-[#54545433] p-4 rounded-xl">
            <p className="font-body-3">{'Đăng nhập bằng mã QR'}</p>
            <QRCode
                className="h-auto w-60 border-8 border-quinary rounded-xl"
                value={qrCodeId}
                viewBox="0 0 256 256"
            />
            <p className="font-body-3 whitespace-pre-line">
                {'Mở ứng dụng Finhay trên thiết bị của bạn\nvà quét mã QR để đăng nhập Finhay.'}
            </p>
        </aside>
    );
};
