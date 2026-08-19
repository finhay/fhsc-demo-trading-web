'use client';

import { useState } from 'react';

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { Dialog } from '@/components/common/ui/Dialog';
import { Spinner } from '@/components/common/ui/Spinner';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

export type PDFViewerProps = {
    isOpen: boolean;
    pdfUrl: string | null;
    title?: string;
    error?: string | null;
    onClose: () => void;
};

export const PDFViewerContent = ({ isOpen, pdfUrl, title, error, onClose }: PDFViewerProps) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [loadError, setLoadError] = useState<string | null>(null);

    const handleDocumentLoadSuccess = (numPages: number) => {
        setNumPages(numPages);
        setLoadError(null);
    };

    const handleDocumentLoadError = (err: Error) => {
        setLoadError(err.message);
    };

    const handleClose = () => {
        setNumPages(0);
        setLoadError(null);
        onClose();
    };

    if (!isOpen || !pdfUrl) return null;

    const displayError = error || loadError;

    return (
        <Dialog title={title} maxWidth="max-w-4xl" maxHeight="h-[80vh]" onClose={handleClose}>
            <div>
                {displayError ? (
                    <div className="flex flex-col justify-center items-center h-full gap-4">
                        <p className="text-red font-body-2">
                            {'Không thể tải PDF: '}
                            {displayError}
                        </p>
                        <button
                            onClick={handleClose}
                            className="bg-highlight px-6 py-2 rounded-full"
                            type="button"
                        >
                            {'Quay lại'}
                        </button>
                    </div>
                ) : (
                    <Document
                        file={pdfUrl}
                        onLoadSuccess={({ numPages }) => handleDocumentLoadSuccess(numPages)}
                        onLoadError={handleDocumentLoadError}
                        loading={<Spinner isLoading={true} isOverlay={false} />}
                    >
                        {Array.from(new Array(numPages), (_, index) => (
                            <Page key={`page_${index + 1}`} pageNumber={index + 1} width={750} />
                        ))}
                    </Document>
                )}
            </div>
        </Dialog>
    );
};
