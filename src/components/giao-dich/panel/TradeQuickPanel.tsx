'use client';

import { useEffect, useRef, useState } from 'react';

import { createPortal } from 'react-dom';

import { TradePanel } from '@/components/giao-dich/panel/TradePanel';
import { useHotkeys } from '@/hooks/lib/useHotkeys';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';

type Props = {
    anchorRect: DOMRect;
    side: string;
    price: number;
    onClose: () => void;
};

export const TradeQuickPanel = ({ anchorRect, side, price, onClose }: Props) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const { setSelectedStock } = useStockInfoStore();
    const [position, setPosition] = useState<{ top: number; left: number; maxHeight: number }>({
        top: anchorRect.top,
        left: anchorRect.right + 8,
        maxHeight: window.innerHeight - 16,
    });
    const handleClose = () => {
        setSelectedStock(null);
        onClose();
    };

    useHotkeys('Escape', handleClose);

    useEffect(() => {
        const panel = panelRef.current;
        if (!panel) return;

        const { width: panelW, height: panelH } = panel.getBoundingClientRect();
        const { innerWidth, innerHeight } = window;

        const fitsRight = anchorRect.right + 8 + panelW <= innerWidth - 8;
        const left = fitsRight ? anchorRect.right + 8 : Math.max(8, anchorRect.left - 8 - panelW);

        const maxTop = innerHeight - panelH - 8;
        const top = Math.min(Math.max(8, anchorRect.top), Math.max(8, maxTop)) - 80;
        const maxHeight = innerHeight - top + 64;

        setPosition({ top, left, maxHeight });
    }, [anchorRect]);

    return createPortal(
        <div
            className="fixed inset-0 z-50 bg-transparent backdrop-blur-sm"
            onClick={(event) => {
                if (event.target === event.currentTarget) handleClose();
            }}
        >
            <div
                ref={panelRef}
                style={{
                    position: 'fixed',
                    top: position.top,
                    left: position.left,
                    maxHeight: position.maxHeight,
                }}
                className="flex w-80 min-h-0 overflow-visible rounded-xl border border-quaternary base-primary p-1 shadow-lg"
                onClick={(event) => event.stopPropagation()}
            >
                <TradePanel initialSide={side} initialPrice={price} />
            </div>
        </div>,
        document.body,
    );
};
