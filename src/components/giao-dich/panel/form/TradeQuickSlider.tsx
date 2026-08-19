'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { TRADING_SLIDER_CONFIG, TRADING_SLIDER_TICKS } from '@/constants/trading';
import { getActiveColor } from '@/utils/trading/panel';

type Props = {
    value: number;
    onChange: (v: number) => void;
    active?: boolean;
};

const { MIN, MAX, STEP_SIZE } = TRADING_SLIDER_CONFIG;

const clampToStep = (raw: number) => {
    const clamped = Math.min(MAX, Math.max(MIN, raw));
    const stepped = Math.round((clamped - MIN) / STEP_SIZE) * STEP_SIZE + MIN;
    return Math.min(MAX, Math.max(MIN, stepped));
};

export const TradeQuickSlider = ({ value, onChange, active }: Props) => {
    const [localValue, setLocalValue] = useState(value);
    const [isDragging, setIsDragging] = useState(false);

    const rangerRef = useRef<HTMLDivElement>(null);
    const draggingRef = useRef(false);
    const latestValueRef = useRef(localValue);

    const activeColor = getActiveColor(active);

    const valueFromClientX = useCallback((clientX: number) => {
        if (!rangerRef.current) return MIN;
        const rect = rangerRef.current.getBoundingClientRect();
        const pct = ((clientX - rect.left) / rect.width) * (MAX - MIN) + MIN;
        return clampToStep(pct);
    }, []);

    const commitValue = useCallback((next: number) => {
        latestValueRef.current = next;
        setLocalValue(next);
    }, []);

    const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const next = valueFromClientX(e.clientX);
        commitValue(next);
        onChange(next);
    };

    const handleTickClick = (e: React.SyntheticEvent, tick: number) => {
        e.stopPropagation();
        commitValue(tick);
        onChange(tick);
    };

    const startDrag = useCallback(
        (clientX: number) => {
            draggingRef.current = true;
            setIsDragging(true);
            const next = valueFromClientX(clientX);
            commitValue(next);
        },
        [valueFromClientX, commitValue],
    );

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        startDrag(e.clientX);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        e.stopPropagation();
        const touch = e.touches[0];
        if (touch) startDrag(touch.clientX);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        let next = latestValueRef.current;
        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowUp':
                next = clampToStep(latestValueRef.current + STEP_SIZE);
                break;
            case 'ArrowLeft':
            case 'ArrowDown':
                next = clampToStep(latestValueRef.current - STEP_SIZE);
                break;
            case 'Home':
                next = MIN;
                break;
            case 'End':
                next = MAX;
                break;
            default:
                return;
        }
        e.preventDefault();
        commitValue(next);
        onChange(next);
    };

    useEffect(() => {
        if (!isDragging) return;

        const onMove = (clientX: number) => {
            const next = valueFromClientX(clientX);
            if (next !== latestValueRef.current) commitValue(next);
        };

        const onMouseMove = (e: MouseEvent) => onMove(e.clientX);
        const onTouchMove = (e: TouchEvent) => {
            const touch = e.touches[0];
            if (touch) onMove(touch.clientX);
        };
        const stop = () => {
            if (!draggingRef.current) return;
            draggingRef.current = false;
            setIsDragging(false);
            onChange(latestValueRef.current);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', stop);
        window.addEventListener('touchmove', onTouchMove);
        window.addEventListener('touchend', stop);
        window.addEventListener('touchcancel', stop);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', stop);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', stop);
            window.removeEventListener('touchcancel', stop);
        };
    }, [isDragging, valueFromClientX, commitValue, onChange]);

    useEffect(() => {
        latestValueRef.current = value;
        setLocalValue(value);
    }, [value]);

    return (
        <div className="flex flex-col gap-1 w-full select-none px-2">
            <div
                className="relative h-5 flex items-center cursor-pointer"
                ref={rangerRef}
                onClick={handleTrackClick}
            >
                <div className="absolute inset-x-0 h-1 rounded-full bg-tertiary" />
                <div
                    className={`absolute h-1 rounded-full ${active !== undefined ? activeColor : 'bg-tertiary'}`}
                    style={{ left: '0%', width: `${localValue}%` }}
                />

                {TRADING_SLIDER_TICKS.map((tick) => {
                    const isFilled = tick <= localValue;
                    return (
                        <span
                            key={tick}
                            role="button"
                            tabIndex={0}
                            onClick={(e) => handleTickClick(e, tick)}
                            onKeyDown={(e) => e.key === 'Enter' && handleTickClick(e, tick)}
                            className={`absolute w-2 h-2 rounded-full cursor-pointer z-10 ${isFilled && active !== undefined ? `${activeColor}` : 'bg-quaternary border border-tertiary'}`}
                            style={{
                                left: `${tick}%`,
                                transform: 'translate(-50%, -50%) rotate(45deg)',
                                top: '50%',
                                display: 'block',
                            }}
                        />
                    );
                })}

                <button
                    type="button"
                    role="slider"
                    aria-valuemin={MIN}
                    aria-valuemax={MAX}
                    aria-valuenow={localValue}
                    onKeyDown={handleKeyDown}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 focus:outline-none z-20"
                    style={{ left: `${localValue}%` }}
                >
                    <span
                        className={`block bg-quinary rounded-full w-3 h-3 border border-quaternary`}
                    />
                </button>
            </div>
            <div className="relative font-tiny-highlight h-5">
                {TRADING_SLIDER_TICKS.map((tick) => {
                    const isSelected = localValue === tick;
                    const translate =
                        tick === MIN
                            ? 'translate-x-0'
                            : tick === MAX
                              ? '-translate-x-full'
                              : '-translate-x-1/2';
                    return (
                        <span
                            key={tick}
                            role="button"
                            tabIndex={0}
                            onClick={(e) => handleTickClick(e, tick)}
                            onKeyDown={(e) => e.key === 'Enter' && handleTickClick(e, tick)}
                            className={`absolute cursor-pointer ${translate} ${isSelected ? 'text-primary' : 'text-disabled'}`}
                            style={{ left: `${tick}%` }}
                        >
                            {tick}%
                        </span>
                    );
                })}
            </div>
        </div>
    );
};
