'use client';

import { useEffect, useState } from 'react';

import { createPortal } from 'react-dom';

type Props = {
    isLoading: boolean;
    isOverlay?: boolean;
};

export const Spinner = ({ isLoading, isOverlay = true }: Props) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    if (!isLoading) return null;

    if (!isOverlay) {
        return (
            <div className="flex items-center justify-center py-3">
                <span
                    className='relative inline-block h-8 w-8 rounded-full animate-spin before:absolute before:inset-0 before:box-border before:rounded-full before:border-4 before:border-(--text-highlight) before:content-[""] before:animate-prixClipFix'
                    aria-hidden
                />
            </div>
        );
    }

    if (!isMounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
            <span
                className='relative inline-block h-8 w-8 rounded-full animate-spin before:absolute before:inset-0 before:box-border before:rounded-full before:border-4 before:border-(--text-highlight) before:content-[""] before:animate-prixClipFix'
                aria-hidden
            />
        </div>,
        document.body,
    );
};
