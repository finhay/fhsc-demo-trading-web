'use client';

import { useEffect } from 'react';

import QRCode from 'react-qr-code';

import { useClickOutside } from '@/hooks/lib/useClickOutside';
import { useTradeVerifyQr } from '@/hooks/trading/useTradeVerifyQr';
import { useLoadingStore } from '@/stores/common/useLoadingStore';

type Props = {
    onClose: () => void;
    onSuccess: () => void;
};

export const TradeVerifyQrCard = ({ onClose, onSuccess }: Props) => {
    const { startLoading, stopLoading } = useLoadingStore();
    const cardRef = useClickOutside<HTMLElement>(onClose);
    const { qrId, generateQR } = useTradeVerifyQr({ onClose, onSuccess });

    const fetchQR = async () => {
        startLoading();
        await generateQR();
        stopLoading();
    };

    useEffect(() => {
        fetchQR();
    }, []);

    return (
        <article
            ref={cardRef}
            className="bg-success fixed bottom-4 right-4 z-50 flex items-stretch gap-4 rounded-xl p-4"
        >
            <div className="h-full shrink-0 rounded-xl bg-quinary p-1">
                <QRCode value={qrId} viewBox="0 0 256 256" className="h-48 w-48" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-start justify-between gap-8 self-stretch">
                <div className="flex w-full flex-col gap-1">
                    <h3 className="font-body-2-highlight text-primary">
                        {'Ngày giao dịch bùng nổ?'}
                    </h3>
                    <p className="font-body-3 whitespace-pre-line text-primary">
                        {
                            'Không làm gián đoạn giao dịch,\nxác thực 1 lần cho tất cả các lệnh.\nMở ứng dụng trên điện thoại,\nquét mã để xác thực.'
                        }
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="font-body-3-highlight flex w-full shrink-0 items-center justify-center rounded-full bg-highlight px-4 py-2 text-quaternary"
                >
                    {'Để sau'}
                </button>
            </div>
        </article>
    );
};
