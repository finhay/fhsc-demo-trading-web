'use client';

import { type ReactNode, useLayoutEffect, useRef, useState } from 'react';

import { createPortal } from 'react-dom';

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
type TooltipAlign = 'center' | 'start';
type TooltipVariant = 'dark' | 'light';

type Props = {
    content: ReactNode;
    children: ReactNode;
    placement?: TooltipPlacement;
    align?: TooltipAlign;
    variant?: TooltipVariant;
    className?: string;
    interactive?: boolean;
};

const INTERACTIVE_CLOSE_DELAY_MS = 150;

const TOOLTIP_OFFSET_PX = 8;

const VIEWPORT_MARGIN_PX = 8;

const TRANSFORM_BY_PLACEMENT: Record<TooltipPlacement, Record<TooltipAlign, string>> = {
    top: {
        center: '-translate-x-1/2 -translate-y-full',
        start: '-translate-y-full',
    },
    bottom: {
        center: '-translate-x-1/2',
        start: '',
    },
    left: {
        center: '-translate-x-full -translate-y-1/2',
        start: '-translate-x-full',
    },
    right: {
        center: '-translate-y-1/2',
        start: '',
    },
};

const STYLE_BY_VARIANT: Record<TooltipVariant, string> = {
    dark: 'border border-quaternary bg-tertiary text-primary',
    light: 'bg-quinary text-quaternary',
};

export const Tooltip = ({
    content,
    children,
    placement = 'top',
    align = 'center',
    variant = 'dark',
    className,
    interactive = false,
}: Props) => {
    const triggerRef = useRef<HTMLSpanElement>(null);
    const tooltipRef = useRef<HTMLSpanElement>(null);
    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

    useLayoutEffect(() => {
        if (!coords) return;
        const rect = tooltipRef.current?.getBoundingClientRect();
        if (!rect) return;

        let shift = 0;
        if (rect.right > window.innerWidth - VIEWPORT_MARGIN_PX) {
            shift = window.innerWidth - VIEWPORT_MARGIN_PX - rect.right;
        }
        if (rect.left + shift < VIEWPORT_MARGIN_PX) {
            shift = VIEWPORT_MARGIN_PX - rect.left;
        }

        if (Math.abs(shift) > 1) {
            setCoords((prev) => (prev ? { ...prev, left: prev.left + shift } : prev));
        }
    }, [coords]);

    const showTooltip = () => {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
        const rect = triggerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const startLeft = rect.left;
        const centerLeft = rect.left + rect.width / 2;
        const leftX = align === 'start' ? startLeft : centerLeft;
        const positionByPlacement: Record<TooltipPlacement, { top: number; left: number }> = {
            top: { top: rect.top - TOOLTIP_OFFSET_PX, left: leftX },
            bottom: { top: rect.bottom + TOOLTIP_OFFSET_PX, left: leftX },
            left: {
                top: align === 'start' ? rect.top : rect.top + rect.height / 2,
                left: rect.left - TOOLTIP_OFFSET_PX,
            },
            right: {
                top: align === 'start' ? rect.top : rect.top + rect.height / 2,
                left: rect.right + TOOLTIP_OFFSET_PX,
            },
        };
        setCoords(positionByPlacement[placement]);
    };

    const hideTooltip = () => setCoords(null);

    const hideTooltipWithDelay = () => {
        closeTimerRef.current = setTimeout(() => setCoords(null), INTERACTIVE_CLOSE_DELAY_MS);
    };

    return (
        <span
            ref={triggerRef}
            onMouseEnter={showTooltip}
            onMouseLeave={interactive ? hideTooltipWithDelay : hideTooltip}
            className={className}
        >
            {children}
            {coords &&
                createPortal(
                    <span
                        ref={tooltipRef}
                        role="tooltip"
                        style={{ top: coords.top, left: coords.left }}
                        className={`pointer-events-none fixed z-[1000] whitespace-nowrap rounded-md px-2 py-1 font-caption shadow-lg ${STYLE_BY_VARIANT[variant]} ${TRANSFORM_BY_PLACEMENT[placement][align]}`}
                    >
                        {content}
                    </span>,
                    document.body,
                )}
        </span>
    );
};
