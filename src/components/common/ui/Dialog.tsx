'use client';

import { ReactNode, useEffect, useState } from 'react';

import { createPortal } from 'react-dom';
import { FaArrowLeft, FaXmark } from 'react-icons/fa6';

import { useHotkeys } from '@/hooks/lib/useHotkeys';
import { useTranslate } from '@/hooks/useTranslate';

let openDialogCount = 0;

type Props = {
    children: ReactNode;
    title?: string;
    headerContent?: ReactNode;
    maxWidth?: string;
    maxHeight?: string;
    panelClassName?: string;
    headerClassName?: string;
    bodyClassName?: string;
    onClose: () => void;
    onBack?: () => void;
};

export const Dialog = ({
    children,
    title,
    headerContent,
    maxWidth,
    maxHeight,
    panelClassName,
    headerClassName,
    bodyClassName,
    onClose,
    onBack,
}: Props) => {
    const trans = useTranslate();
    const [isMounted, setIsMounted] = useState(false);

    useHotkeys('Escape', () => {
        onClose();
    });

    useEffect(() => {
        setIsMounted(true);
        openDialogCount++;
        document.body.style.overflow = 'hidden';

        return () => {
            openDialogCount--;
            if (openDialogCount === 0) {
                document.body.style.overflow = '';
            }
            setIsMounted(false);
        };
    }, []);

    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    if (!isMounted) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm flex items-center justify-center px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title && !headerContent ? 'dialog-title' : undefined}
            onClick={handleBackdropClick}
        >
            <section
                className={`w-full ${maxWidth || 'max-w-lg'} ${maxHeight} flex flex-col overflow-hidden rounded-xl ${
                    panelClassName ?? 'bg-secondary gap-4 p-4'
                }`}
            >
                {(title || headerContent) && (
                    <header
                        className={`flex shrink-0 items-center justify-between gap-4 ${headerClassName}`}
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    className="text-primary hover:text-highlight transition-colors flex-shrink-0"
                                    aria-label={trans.dialog.back}
                                    type="button"
                                >
                                    <FaArrowLeft size={20} />
                                </button>
                            )}
                            {headerContent ?? (
                                <h2
                                    id="dialog-title"
                                    className="font-body-1-highlight text-primary truncate"
                                >
                                    {title}
                                </h2>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-primary hover:text-highlight transition-colors flex-shrink-0"
                            aria-label={trans.dialog.close}
                            type="button"
                        >
                            <FaXmark size={20} />
                        </button>
                    </header>
                )}
                <div
                    className={bodyClassName ?? 'flex min-h-0 flex-1 flex-col gap-4 overflow-auto'}
                >
                    {children}
                </div>
            </section>
        </div>,
        document.body,
    );
};
