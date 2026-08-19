import { useEffect, useState } from 'react';

import { QR_AUTH_CONFIG, QR_CONTEXT, QR_STATUS } from '@/constants/trading';
import { toast } from '@/hooks/lib/useToast';
import { createQrLoginChallenge, pollQrLoginChallengeStatus } from '@/services/api/auth/qr';
import { isSuccessApi } from '@/utils/common';

type Props = {
    onClose: () => void;
    onSuccess: () => void;
};

export const useTradeVerifyQr = ({ onClose, onSuccess }: Props) => {
    const [qrId, setQrId] = useState('');
    const [polling, setPolling] = useState(false);

    const generateQR = async () => {
        try {
            const { error_code, result, message } = await createQrLoginChallenge(
                QR_CONTEXT.TRADING,
            );

            if (isSuccessApi(error_code)) {
                setQrId(result.id);
                setPolling(true);
            } else {
                toast.error(message);
                onClose();
            }
        } catch {
            onClose();
        }
    };

    const pollQrStatus = async (id: string) => {
        const { error_code, result } = await pollQrLoginChallengeStatus(id, QR_CONTEXT.TRADING);

        if (isSuccessApi(error_code) && result.status === QR_STATUS.APPROVED) {
            setPolling(false);
            onSuccess();
        }
    };

    useEffect(() => {
        if (!polling || !qrId) return;

        const interval = setInterval(() => {
            pollQrStatus(qrId);
        }, QR_AUTH_CONFIG.POLL_INTERVAL);

        const timeout = setTimeout(() => {
            setPolling(false);
            generateQR();
        }, QR_AUTH_CONFIG.TIMEOUT);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [polling, qrId]);

    return { qrId, generateQR };
};
