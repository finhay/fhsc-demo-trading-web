'use client';

import { useState } from 'react';

import dayjs from 'dayjs';
import { RiCalendarLine } from 'react-icons/ri';

import Calendar from '@/components/common/ui/Calendar';
import { TRADE_UI_CONFIG } from '@/constants/trading';
import { useClickOutside } from '@/hooks/lib/useClickOutside';
import { addMonths, formatApiDate, formatDate, isDateAfterDay } from '@/utils/format';

const CALENDAR_WIDTH = 256;
const CALENDAR_HEIGHT = 340;

type DateField = 'executionDate' | 'expiredDate';

type Props = {
    form: {
        Field: (props: {
            name: DateField;
            children: (field: {
                state: { value: string };
                handleChange: (value: string) => void;
                handleBlur: () => void;
            }) => React.ReactNode;
        }) => React.ReactNode | Promise<React.ReactNode>;
        getFieldValue: (name: DateField) => string;
        setFieldValue: (name: DateField, value: string) => void;
    };
    isBuySide: boolean;
    isExecutionDateReadonly?: boolean;
};

export const Trade247DateRange = ({ form, isBuySide, isExecutionDateReadonly = false }: Props) => {
    const [openField, setOpenField] = useState<DateField | null>(null);
    const [calendarValue, setCalendarValue] = useState<Date | null>(null);
    const [calendarPos, setCalendarPos] = useState<{ top: number; left: number } | null>(null);
    const containerRef = useClickOutside<HTMLDivElement>(
        () => setOpenField(null),
        openField !== null,
    );

    const maxDate = addMonths(TRADE_UI_CONFIG.MAX_247_MONTH_OFFSET);
    const sideBgClass = isBuySide ? 'bg-green/20' : 'bg-red/20';

    const openCalendar = (which: DateField, anchor: HTMLElement) => {
        if (openField === which) {
            setOpenField(null);
            return;
        }
        const current = form.getFieldValue(which);
        setCalendarValue(current ? dayjs(current).toDate() : new Date());
        const rect = anchor.getBoundingClientRect();
        const fitsBelow = rect.bottom + 4 + CALENDAR_HEIGHT <= window.innerHeight;
        setCalendarPos({
            top: fitsBelow ? rect.bottom + 4 : Math.max(8, rect.top - CALENDAR_HEIGHT - 4),
            left: Math.min(Math.max(8, rect.left), window.innerWidth - CALENDAR_WIDTH - 8),
        });
        setOpenField(which);
    };

    const handleConfirm = (date: Date) => {
        if (!openField) return;
        const value = formatApiDate(date);
        form.setFieldValue(openField, value);
        if (openField === 'executionDate') {
            const expired = form.getFieldValue('expiredDate');
            if (expired && isDateAfterDay(value, expired)) {
                form.setFieldValue('expiredDate', value);
            }
        }
        setOpenField(null);
    };

    const calendarMinDate =
        openField === 'expiredDate' && form.getFieldValue('executionDate')
            ? dayjs(form.getFieldValue('executionDate')).toDate()
            : new Date();

    return (
        <div ref={containerRef} className="flex flex-col gap-1 w-full">
            <div className="flex gap-1 items-center w-full">
                <form.Field name="executionDate">
                    {(field) => {
                        const hasVal = !!field.state.value;
                        const bgClass = hasVal ? sideBgClass : 'bg-tertiary';
                        return (
                            <button
                                type="button"
                                disabled={isExecutionDateReadonly}
                                onClick={(e) => openCalendar('executionDate', e.currentTarget)}
                                onBlur={field.handleBlur}
                                className={`flex items-center justify-between rounded-xl px-3 py-2 flex-1 ${bgClass} ${
                                    isExecutionDateReadonly ? 'cursor-not-allowed' : ''
                                }`}
                            >
                                <span
                                    className={`font-caption ${
                                        isExecutionDateReadonly ? 'text-secondary' : 'text-primary'
                                    }`}
                                >
                                    {formatDate(field.state.value) || 'DD/MM/YYYY'}
                                </span>
                                <span className="flex items-center justify-center px-1">
                                    <RiCalendarLine
                                        size={14}
                                        className={
                                            isExecutionDateReadonly
                                                ? 'text-secondary'
                                                : 'text-primary'
                                        }
                                    />
                                </span>
                            </button>
                        );
                    }}
                </form.Field>
                <span className="font-caption text-secondary">-</span>
                <form.Field name="expiredDate">
                    {(field) => {
                        const hasVal = !!field.state.value;
                        const bgClass = hasVal ? sideBgClass : 'bg-tertiary';
                        return (
                            <button
                                type="button"
                                onClick={(e) => openCalendar('expiredDate', e.currentTarget)}
                                onBlur={field.handleBlur}
                                className={`flex items-center justify-between rounded-xl px-3 py-2 flex-1 ${bgClass}`}
                            >
                                <span className="font-caption text-primary">
                                    {formatDate(field.state.value) || 'DD/MM/YYYY'}
                                </span>
                                <span className="flex items-center justify-center px-1">
                                    <RiCalendarLine size={14} className="text-primary" />
                                </span>
                            </button>
                        );
                    }}
                </form.Field>
            </div>
            {openField && calendarPos && (
                <div
                    className="fixed z-50"
                    style={{ top: calendarPos.top, left: calendarPos.left }}
                >
                    <Calendar
                        value={calendarValue}
                        onChange={setCalendarValue}
                        onConfirm={handleConfirm}
                        minDate={calendarMinDate}
                        maxDate={maxDate}
                    />
                </div>
            )}
        </div>
    );
};
