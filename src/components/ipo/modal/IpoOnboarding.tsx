'use client';

import { useState } from 'react';

import Image from 'next/image';

import { PDFViewer } from '@/components/common/feature/PDFViewer';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { fetchIpoHuntTermsViewHtml } from '@/services/api/ipo-hunt';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { useIpoStore } from '@/stores/ipo/useIpoStore';
import { isSuccessApi } from '@/utils/common';

export const IpoOnboarding = () => {
    const trans = useTranslate();
    const { isOnboardingVisible, confirmOnboarding } = useIpoStore();
    const { startLoading, stopLoading, isLoading } = useLoadingStore();

    const [isPdfOpen, setIsPdfOpen] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [pdfError, setPdfError] = useState<string | null>(null);

    const handleClosePdf = () => {
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
        }
        setPdfUrl(null);
        setPdfError(null);
        setIsPdfOpen(false);
    };

    const handleViewTerms = async () => {
        startLoading();
        setPdfError(null);
        try {
            const { error_code, data, message } = await fetchIpoHuntTermsViewHtml();
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

    const handleConfirmOnboarding = async () => {
        startLoading();
        try {
            await confirmOnboarding();
        } finally {
            stopLoading();
        }
    };

    if (!isOnboardingVisible) return null;

    return (
        <>
            <div className="w-full fixed inset-0 z-10 backdrop-blur-sm bg-overlay flex items-center justify-center">
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="onboarding-title"
                    className="relative max-w-5xl w-full flex flex-col items-center gap-6 rounded-xl p-6"
                    style={{
                        background: 'linear-gradient(to bottom, #1e6701ff, #000000)',
                    }}
                >
                    <h2 id="onboarding-title" className="font-heading-3 text-primary text-center">
                        {trans.ipo.modal.onboarding.title}
                    </h2>
                    <div className="relative w-64 h-64">
                        <Image
                            src="https://cdn1.finhay.com.vn/vnsc-prod/1771922402732.911-ipo-hunt.png"
                            alt="IPO Hunt"
                            width={260}
                            height={260}
                            className="w-64 h-auto object-contain"
                        />
                    </div>
                    <div className="text-center">
                        <p className="font-body-2 text-primary">
                            {trans.ipo.modal.onboarding.agreement}
                        </p>
                        <button
                            onClick={handleViewTerms}
                            disabled={isLoading}
                            className="font-body-2 text-green hover:underline cursor-pointer bg-transparent border-none disabled:opacity-50"
                            type="button"
                        >
                            {trans.ipo.modal.onboarding.terms}
                        </button>
                    </div>
                    <button
                        className="bg-highlight text-quaternary font-body-3-highlight px-32 py-2 rounded-full hover:opacity-90 transition-opacity cursor-pointer border-none disabled:opacity-50"
                        onClick={handleConfirmOnboarding}
                        disabled={isLoading}
                        type="button"
                    >
                        {trans.ipo.modal.onboarding.start_button}
                    </button>
                </div>
            </div>
            <PDFViewer
                isOpen={isPdfOpen}
                pdfUrl={pdfUrl}
                title={trans.ipo.modal.onboarding.terms}
                error={pdfError}
                onClose={handleClosePdf}
            />
        </>
    );
};
