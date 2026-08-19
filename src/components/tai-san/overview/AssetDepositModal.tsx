'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';

import { DepositGuideModal } from '@/components/common/modal/DepositGuideModal';
import { Dialog } from '@/components/common/ui/Dialog';
import { useTranslate } from '@/hooks/useTranslate';
import { generateVietQrTransferImage } from '@/services/api/vietqr';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import type { DepositBankAccountItem } from '@/types/accounts/bank';

type Props = {
    bankAccount: DepositBankAccountItem | null;
    onClose: () => void;
};

export const AssetDepositModal = ({ bankAccount, onClose }: Props) => {
    const trans = useTranslate();
    const { startLoading, stopLoading } = useLoadingStore();
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [showGuide, setShowGuide] = useState(false);

    const generateDepositQr = async () => {
        if (!bankAccount) {
            stopLoading();
            return;
        }

        try {
            startLoading();

            const { bank_account, bank_account_name, vietqr_bank_id } = bankAccount;

            const qrData = await generateVietQrTransferImage(
                bank_account,
                bank_account_name,
                vietqr_bank_id,
            );

            setQrCodeUrl(qrData.qrDataURL);
        } finally {
            stopLoading();
        }
    };

    useEffect(() => {
        startLoading();
        generateDepositQr();
    }, []);

    return (
        <Dialog title={trans.assets.modals.deposit.title} maxWidth="max-w-xl" onClose={onClose}>
            <div className="flex flex-col gap-4">
                <p className="font-body-3 text-primary">
                    {trans.assets.modals.deposit.description}
                </p>
                <div className="bg-tertiary rounded-xl p-4 flex items-center gap-4">
                    <div className="flex flex-col gap-4 flex-1">
                        <div className="flex flex-col gap-1">
                            <span className="font-body-3 text-primary">
                                {trans.assets.modals.deposit.bank_receiver}
                            </span>
                            <span className="font-body-2-highlight text-primary">
                                {bankAccount?.bank_name}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="font-body-3 text-primary">
                                {trans.assets.modals.deposit.recipient}
                            </span>
                            <span className="font-body-2-highlight text-primary">
                                {bankAccount?.bank_account_name}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="font-body-3 text-primary">
                                {trans.assets.modals.deposit.account_number}
                            </span>
                            <span className="font-body-2-highlight text-primary">
                                {bankAccount?.bank_account}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-4 shrink-0">
                        <p className="font-body-3 text-primary text-center">
                            {trans.assets.modals.deposit.qr_hint_line1}
                            <br />
                            {trans.assets.modals.deposit.qr_hint_line2}
                        </p>
                        {qrCodeUrl ? (
                            <Image
                                src={qrCodeUrl}
                                alt={trans.assets.modals.deposit.qr_alt}
                                width={150}
                                height={150}
                            />
                        ) : (
                            <div
                                className="w-20 h-20 bg-quaternary rounded-xl"
                                aria-label={trans.assets.modals.deposit.qr_empty_aria}
                            />
                        )}
                    </div>
                </div>
                <button
                    onClick={() => setShowGuide(true)}
                    className="font-body-3-highlight text-highlight text-center hover:opacity-80 transition-opacity"
                >
                    {trans.assets.modals.deposit.view_guide}
                </button>
            </div>
            {showGuide && <DepositGuideModal onClose={() => setShowGuide(false)} />}
        </Dialog>
    );
};
