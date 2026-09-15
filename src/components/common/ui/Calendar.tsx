'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type CalendarProps = {
    value: Date | null;
    onChange: (date: Date | null) => void;
    onConfirm?: (date: Date) => void;
    showTime?: boolean;
    timeOnly?: boolean;
    minDate?: Date;
    maxDate?: Date;
    disablePast?: boolean;
    disableFuture?: boolean;
    disableDate?: (date: Date) => boolean;
    minHour?: number;
    maxHour?: number;
    minuteStep?: number;
    disableHour?: (hour: number) => boolean;
    disableMinute?: (minute: number) => boolean;
    className?: string;
};

const MONTHS = [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
];
const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const pad = (n: number) => String(n).padStart(2, '0');
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const TIME_LIST_HEIGHT = 168;

export default function Calendar({
    value,
    onChange,
    onConfirm,
    showTime = false,
    timeOnly = false,
    minDate,
    maxDate,
    disablePast = false,
    disableFuture = false,
    disableDate,
    minHour = 0,
    maxHour = 23,
    minuteStep = 1,
    disableHour,
    disableMinute,
    className = '',
}: CalendarProps) {
    const selected = value ?? new Date();
    const [view, setView] = useState<Date>(
        () => new Date(selected.getFullYear(), selected.getMonth(), 1),
    );
    const [open, setOpen] = useState<'hour' | 'minute' | null>(null);
    const [timeDropUp, setTimeDropUp] = useState(false);
    const [monthOpen, setMonthOpen] = useState(false);
    const [pickerYear, setPickerYear] = useState(() => selected.getFullYear());
    const timeRef = useRef<HTMLDivElement>(null);
    const monthRef = useRef<HTMLDivElement>(null);

    const y = view.getFullYear();
    const m = view.getMonth();
    const firstDow = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const today = startOfDay(new Date());

    const isHourDisabled = (h: number) =>
        h < minHour || h > maxHour || (disableHour ? disableHour(h) : false);
    const isMinuteDisabled = (mi: number) => (disableMinute ? disableMinute(mi) : false);

    const hourOptions = Array.from({ length: 24 }, (_, h) => h).filter((h) => !isHourDisabled(h));
    const minuteOptions = Array.from(
        { length: Math.ceil(60 / minuteStep) },
        (_, i) => i * minuteStep,
    ).filter((mi) => !isMinuteDisabled(mi));

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const isDisabled = useMemo(() => {
        const todayStart = startOfDay(new Date());
        const min = minDate ? startOfDay(minDate) : null;
        const max = maxDate ? startOfDay(maxDate) : null;
        return (day: Date) => {
            const d = startOfDay(day);
            if (disablePast && d < todayStart) return true;
            if (disableFuture && d > todayStart) return true;
            if (min && d < min) return true;
            if (max && d > max) return true;
            if (disableDate && disableDate(d)) return true;
            return false;
        };
    }, [minDate, maxDate, disablePast, disableFuture, disableDate]);

    const toggleTimeDropdown = (
        which: 'hour' | 'minute',
        e: React.MouseEvent<HTMLButtonElement>,
    ) => {
        if (open === which) {
            setOpen(null);
            return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        setTimeDropUp(window.innerHeight - rect.bottom < TIME_LIST_HEIGHT);
        setOpen(which);
    };

    const pickHour = (h: number) => {
        if (isHourDisabled(h)) return;
        const n = new Date(selected);
        n.setHours(h);
        onChange(n);
        setOpen(null);
    };

    const pickMinute = (mi: number) => {
        if (isMinuteDisabled(mi)) return;
        const n = new Date(selected);
        n.setMinutes(mi);
        onChange(n);
        setOpen(null);
    };

    const selectDay = (d: number) => {
        const next = new Date(y, m, d, selected.getHours(), selected.getMinutes());
        if (isDisabled(next)) return;
        onChange(next);
    };

    const shiftMonth = (delta: number) => setView(new Date(y, m + delta, 1));

    const goToday = () => {
        const t = new Date();
        const next = new Date(
            t.getFullYear(),
            t.getMonth(),
            t.getDate(),
            selected.getHours(),
            selected.getMinutes(),
        );
        setView(new Date(t.getFullYear(), t.getMonth(), 1));
        if (!isDisabled(next)) onChange(next);
    };

    useEffect(() => {
        if (!open && !monthOpen) return;
        const onDoc = (e: MouseEvent) => {
            if (open && timeRef.current && !timeRef.current.contains(e.target as Node))
                setOpen(null);
            if (monthOpen && monthRef.current && !monthRef.current.contains(e.target as Node))
                setMonthOpen(false);
        };
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, [open, monthOpen]);

    return (
        <div
            className={`w-64 rounded-xl base-secondary border border-tertiary p-3 flex flex-col gap-2.5 ${className}`}
        >
            {!timeOnly && (
                <>
                    <div ref={monthRef} className="relative flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => shiftMonth(-1)}
                            className="w-7 h-7 flex items-center justify-center base-tertiary hover:bg-(--base-quaternary) rounded-lg text-primary text-base leading-none transition-colors"
                        >
                            ‹
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setPickerYear(y);
                                setMonthOpen((o) => !o);
                            }}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-(--base-tertiary) transition-colors"
                        >
                            <span className="flex flex-col items-center">
                                <span className="body-4-highlight text-primary">
                                    {MONTHS[m]}
                                </span>
                                <span className="body-5 text-tertiary">{y}</span>
                            </span>
                            <span className="text-tertiary text-[10px]">▾</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => shiftMonth(1)}
                            className="w-7 h-7 flex items-center justify-center base-tertiary hover:bg-(--base-quaternary) rounded-lg text-primary text-base leading-none transition-colors"
                        >
                            ›
                        </button>
                        {monthOpen && (
                            <div className="absolute top-full mt-1.5 left-0 right-0 z-30 base-quaternary border border-tertiary rounded-xl p-2 shadow-2xl flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setPickerYear((yr) => yr - 1)}
                                        className="w-6 h-6 flex items-center justify-center base-tertiary rounded-md text-primary text-xs"
                                    >
                                        ‹
                                    </button>
                                    <span className="body-4-highlight text-primary tabular-nums">
                                        {pickerYear}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setPickerYear((yr) => yr + 1)}
                                        className="w-6 h-6 flex items-center justify-center base-tertiary rounded-md text-primary text-xs"
                                    >
                                        ›
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-1">
                                    {MONTHS.map((label, idx) => {
                                        const active = idx === m && pickerYear === y;
                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => {
                                                    setView(new Date(pickerYear, idx, 1));
                                                    setMonthOpen(false);
                                                }}
                                                className={`h-7 flex items-center justify-center rounded-md body-5 transition-colors ${active ? 'base-highlight text-quaternary body-5-highlight' : 'text-primary hover:bg-(--base-tertiary)'}`}
                                            >
                                                {label.replace('Tháng ', 'Th')}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-7 gap-0.5">
                        {WEEKDAYS.map((wd) => (
                            <span
                                key={wd}
                                className="text-center body-5-highlight text-tertiary py-0.5"
                            >
                                {wd}
                            </span>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-0.5">
                        {cells.map((d, i) => {
                            if (d === null) return <span key={`e${i}`} className="h-7" />;
                            const day = new Date(y, m, d);
                            const isSel =
                                selected.getFullYear() === y &&
                                selected.getMonth() === m &&
                                selected.getDate() === d;
                            const isToday = today.getTime() === day.getTime();
                            const disabled = isDisabled(day);
                            const base =
                                'h-7 flex items-center justify-center rounded-md body-5 transition-colors';
                            let cls = 'text-primary hover:bg-(--base-tertiary)';
                            if (disabled) cls = 'text-disabled cursor-not-allowed';
                            else if (isSel)
                                cls = 'base-highlight text-quaternary body-5-highlight';
                            else if (isToday) cls = 'border border-highlight text-highlight';
                            return (
                                <button
                                    key={d}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => selectDay(d)}
                                    className={`${base} ${cls}`}
                                >
                                    {d}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
            {(showTime || timeOnly) && (
                <>
                    {!timeOnly && <div className="h-px base-tertiary" />}
                    <div ref={timeRef} className="flex items-center justify-between gap-2">
                        <span className="body-5 text-secondary">Giờ</span>
                        <div className="flex items-center gap-1.5">
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={(e) => toggleTimeDropdown('hour', e)}
                                    className={`w-16 h-7 flex items-center justify-between px-2 base-tertiary rounded-lg text-primary body-5-highlight tabular-nums border ${open === 'hour' ? 'border-highlight' : 'border-quaternary'}`}
                                >
                                    {pad(selected.getHours())}
                                    <span className="text-tertiary text-[10px]">▾</span>
                                </button>
                                {open === 'hour' && (
                                    <div
                                        className={`absolute left-0 z-20 w-16 max-h-40 overflow-y-auto base-quaternary border border-tertiary rounded-lg p-1 shadow-2xl flex flex-col gap-0.5 ${timeDropUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}
                                    >
                                        {hourOptions.map((h) => {
                                            const active = h === selected.getHours();
                                            const cls = active
                                                ? 'base-highlight text-quaternary body-5-highlight'
                                                : 'text-primary hover:bg-(--base-tertiary)';
                                            return (
                                                <button
                                                    key={h}
                                                    type="button"
                                                    onClick={() => pickHour(h)}
                                                    className={`h-6 flex items-center justify-center rounded-md body-5 tabular-nums transition-colors ${cls}`}
                                                >
                                                    {pad(h)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            <span className="body-5-highlight text-tertiary">:</span>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={(e) => toggleTimeDropdown('minute', e)}
                                    className={`w-16 h-7 flex items-center justify-between px-2 base-tertiary rounded-lg text-primary body-5-highlight tabular-nums border ${open === 'minute' ? 'border-highlight' : 'border-quaternary'}`}
                                >
                                    {pad(selected.getMinutes())}
                                    <span className="text-tertiary text-[10px]">▾</span>
                                </button>
                                {open === 'minute' && (
                                    <div
                                        className={`absolute left-0 z-20 w-16 max-h-40 overflow-y-auto base-quaternary border border-tertiary rounded-lg p-1 shadow-2xl flex flex-col gap-0.5 ${timeDropUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}
                                    >
                                        {minuteOptions.map((mi) => {
                                            const active = mi === selected.getMinutes();
                                            const cls = active
                                                ? 'base-highlight text-quaternary body-5-highlight'
                                                : 'text-primary hover:bg-(--base-tertiary)';
                                            return (
                                                <button
                                                    key={mi}
                                                    type="button"
                                                    onClick={() => pickMinute(mi)}
                                                    className={`h-6 flex items-center justify-center rounded-md body-5 tabular-nums transition-colors ${cls}`}
                                                >
                                                    {pad(mi)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
            <div className="flex gap-2">
                {!timeOnly && (
                    <button
                        type="button"
                        onClick={goToday}
                        className="flex-1 h-8 base-tertiary hover:bg-(--base-quaternary) rounded-lg text-primary body-5-highlight transition-colors"
                    >
                        Hôm nay
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => onConfirm?.(selected)}
                    className="flex-1 h-8 base-highlight rounded-lg text-quaternary body-5-highlight"
                >
                    Chọn
                </button>
            </div>
        </div>
    );
}
