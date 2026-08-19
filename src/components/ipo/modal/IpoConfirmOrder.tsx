'use client';

import { useState } from 'react';

import { FaArrowLeft, FaFileLines, FaSquare, FaSquareCheck, FaXmark } from 'react-icons/fa6';

import { PDFViewer } from '@/components/common/feature/PDFViewer';
import { SUBSCRIPTION_FLOW_STEPS } from '@/constants/ipo';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { previewIpoRegistrationOrder } from '@/services/api/ipo-hunt';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { useSubscriptionStore } from '@/stores/ipo/useSubscriptionStore';
import { isSuccessApi } from '@/utils/common';
import { formatNumberVN } from '@/utils/format';
import { calculateDeposit, calculateTotalValue } from '@/utils/ipo';

export const IpoConfirmOrder = () => {
    const trans = useTranslate();
    const {
        selectedItem,
        registrationInfo,
        quantity,
        price,
        isSubmitting,
        setStep,
        submitRegistration,
        resetStore,
    } = useSubscriptionStore();

    const { contractConditions, deposit_rate } = registrationInfo;

    const [isAgreed, setIsAgreed] = useState<boolean>(false);
    const [isPdfOpen, setIsPdfOpen] = useState<boolean>(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [pdfError, setPdfError] = useState<string | null>(null);
    const [currentPdfTitle, setCurrentPdfTitle] = useState<string>('');
    const { startLoading, stopLoading, isLoading } = useLoadingStore();

    const handleSubmitRegistration = async () => {
        startLoading();
        try {
            await submitRegistration();
        } finally {
            stopLoading();
        }
    };

    const totalValue = calculateTotalValue(quantity, price);
    const deposit = calculateDeposit(totalValue, deposit_rate);

    const handleClosePdf = () => {
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
        }
        setPdfUrl(null);
        setPdfError(null);
        setIsPdfOpen(false);
        setCurrentPdfTitle('');
    };

    const handleViewContract = async (contractType: string, contractName: string) => {
        if (!selectedItem) return;

        startLoading();
        setCurrentPdfTitle(contractName);
        setPdfError(null);
        try {
            const { error_code, data, message } = await previewIpoRegistrationOrder(
                {
                    symbol: selectedItem.symbol,
                    price,
                    quantity,
                },
                contractType,
            );
            if (isSuccessApi(error_code)) {
                const binaryString = atob(data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                setPdfUrl(url);
                setIsPdfOpen(true);
            } else {
                toast.error(message);
            }
        } catch {
        } finally {
            stopLoading();
        }
    };

    if (!selectedItem) return null;

    return (
        <>
            <header className="flex items-start gap-4 relative">
                <button
                    onClick={() => setStep(SUBSCRIPTION_FLOW_STEPS.FORM)}
                    className="text-primary bg-transparent border-none cursor-pointer shrink-0 mt-1"
                    type="button"
                    aria-label={trans.ipo.common.back}
                >
                    <FaArrowLeft size={20} />
                </button>
                <div className="flex flex-col gap-1 flex-1">
                    <h2
                        id="subscription-confirm-title"
                        className="font-body-1-highlight text-primary"
                    >
                        {trans.ipo.modal.confirm.title}
                        {selectedItem.symbol}
                    </h2>
                    <p className="font-body-3 text-secondary">{selectedItem.name}</p>
                </div>
                <button
                    onClick={resetStore}
                    className="absolute top-0 right-0 text-primary bg-transparent border-none cursor-pointer"
                    type="button"
                    aria-label={trans.ipo.common.close}
                >
                    <FaXmark size={20} />
                </button>
            </header>
            <div className="flex gap-3 flex-1 min-h-0">
                <section
                    className="bg-secondary flex-1 flex flex-col gap-6 rounded-xl p-3 overflow-y-auto"
                    aria-labelledby="confirm-important-title"
                >
                    <h3 id="confirm-important-title" className="font-body-3-highlight text-primary">
                        {trans.ipo.modal.confirm.important}
                    </h3>
                    <ul className="list-disc pl-6 flex flex-col gap-1 font-body-2 text-primary">
                        <li>{trans.ipo.modal.confirm.success_note}</li>
                        <li>{trans.ipo.modal.confirm.fail_note}</li>
                    </ul>
                    <div className="flex flex-col gap-3">
                        {contractConditions.map((contract) => (
                            <button
                                key={contract.type}
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleViewContract(contract.type, contract.name)}
                                className="bg-tertiary flex items-center gap-3 p-3 rounded-xl border-none cursor-pointer hover:opacity-80 transition-opacity text-left disabled:opacity-50"
                            >
                                <FaFileLines size={20} className="text-green shrink-0" />
                                <span className="font-body-3-highlight text-green">
                                    {contract.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>
                <section
                    className="bg-secondary flex-1 flex flex-col gap-8 rounded-xl p-3"
                    aria-labelledby="confirm-summary-title"
                >
                    <div className="flex flex-col gap-6">
                        <div className="border border-green rounded-xl p-4 flex items-center justify-between bg-success">
                            <div className="flex items-center gap-2">
                                <span className="font-body-2 text-primary">
                                    {trans.ipo.modal.confirm.deposit}
                                </span>
                                <span className="bg-red text-primary font-caption-highlight px-1.5 py-0.5 rounded-full">
                                    {deposit_rate}%
                                </span>
                            </div>
                            <span className="font-body-2-highlight text-primary">
                                {deposit !== null
                                    ? `${formatNumberVN(deposit, { trimTrailingZeros: true })}đ`
                                    : '--'}
                            </span>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <span className="font-body-2 text-secondary">
                                    {trans.ipo.modal.confirm.quantity}
                                </span>
                                <span className="font-body-2-highlight text-primary">
                                    {formatNumberVN(quantity, { decimals: 0 })}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-body-2 text-secondary">
                                    {trans.ipo.modal.confirm.price}
                                </span>
                                <span className="font-body-2-highlight text-primary">
                                    {formatNumberVN(price)}đ
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-body-2 text-secondary">
                                    {trans.ipo.modal.confirm.total_value}
                                </span>
                                <span className="font-body-2-highlight text-primary">
                                    {totalValue !== null
                                        ? `${formatNumberVN(totalValue, { trimTrailingZeros: true })}đ`
                                        : '--'}
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsAgreed((prev) => !prev)}
                            className="bg-success flex items-start gap-3 p-3 rounded-xl border-none cursor-pointer text-left hover:opacity-90 transition-opacity"
                            aria-pressed={isAgreed}
                        >
                            {isAgreed ? (
                                <FaSquareCheck size={24} className="text-green shrink-0 mt-0.5" />
                            ) : (
                                <FaSquare size={24} className="text-primary shrink-0 mt-0.5" />
                            )}
                            <p className="font-body-3 text-primary">
                                {trans.ipo.modal.confirm.agreement}
                            </p>
                        </button>
                    </div>
                    <button
                        onClick={handleSubmitRegistration}
                        disabled={!isAgreed || isSubmitting || isLoading}
                        className={`${!isAgreed || isSubmitting || isLoading ? 'bg-disabled text-secondary' : 'bg-highlight text-quaternary'} font-body-3-highlight rounded-full px-4 py-2 w-2/3 mx-auto flex items-center justify-center disabled:cursor-not-allowed`}
                        type="button"
                    >
                        {trans.ipo.modal.confirm.confirm_button}
                    </button>
                </section>
            </div>
            <PDFViewer
                isOpen={isPdfOpen}
                pdfUrl={pdfUrl}
                title={currentPdfTitle}
                error={pdfError}
                onClose={handleClosePdf}
            />
        </>
    );
};
