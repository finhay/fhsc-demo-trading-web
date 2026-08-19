'use client';

import { useEffect, useState } from 'react';

import QRCode from 'react-qr-code';

import { Spinner } from '@/components/common/ui/Spinner';
import { TRADE_UI_CONFIG } from '@/constants/trading';
import { useTradeVerifyQr } from '@/hooks/trading/useTradeVerifyQr';

type Props = {
    onClose: () => void;
    onSuccess: () => void;
};

export const TradeVerifyQrPanel = ({ onClose, onSuccess }: Props) => {
    const [isLoading, setIsLoading] = useState(true);
    const { qrId, generateQR } = useTradeVerifyQr({ onClose, onSuccess });

    const fetchQR = async () => {
        setIsLoading(true);
        await generateQR();
        setIsLoading(false);
    };

    useEffect(() => {
        fetchQR();
    }, []);

    return (
        <section className="bg-secondary flex flex-1 min-h-0 w-full flex-col items-center gap-4 rounded-xl p-3">
            {isLoading ? (
                <Spinner isLoading isOverlay={false} />
            ) : (
                <>
                    <h3 className="font-body-2-highlight shrink-0 text-primary">
                        {'Xác thực giao dịch'}
                    </h3>
                    <div className="shrink-0 rounded-xl bg-quinary p-1">
                        <QRCode
                            size={TRADE_UI_CONFIG.QR_SIZE}
                            value={qrId}
                            viewBox="0 0 256 256"
                            className="w-48 h-48"
                            aria-label={'Mã QR xác thực giao dịch'}
                        />
                    </div>
                    <p className="font-body-3 shrink-0 text-center text-primary whitespace-pre-line">
                        {'Mở ứng dụng trên điện thoại,\nquét mã để xác thực.'}
                    </p>
                    <button
                        type="button"
                        onClick={onClose}
                        className="font-body-3-highlight flex w-full shrink-0 items-center justify-center rounded-full bg-error px-4 py-2 text-red"
                    >
                        {'Huỷ'}
                    </button>
                </>
            )}
        </section>
    );
};
