'use client';

import { useEffect } from 'react';

import QRCode from 'react-qr-code';

import { useClickOutside } from '@/hooks/lib/useClickOutside';
import { useTradeVerifyQr } from '@/hooks/trading/useTradeVerifyQr';
import { useTranslate } from '@/hooks/useTranslate';
import { useLoadingStore } from '@/stores/common/useLoadingStore';

type Props = {
    onClose: () => void;
    onSuccess: () => void;
};

export const TradeVerifyQrCard = ({ onClose, onSuccess }: Props) => {
    const trans = useTranslate();
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
                        {trans.trading.qr_card.title}
                    </h3>
                    <p className="font-body-3 whitespace-pre-line text-primary">
                        {trans.trading.qr_card.description}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="font-body-3-highlight flex w-full shrink-0 items-center justify-center rounded-full bg-highlight px-4 py-2 text-quaternary"
                >
                    {trans.trading.qr_card.btn_later}
                </button>
            </div>
        </article>
    );
};
