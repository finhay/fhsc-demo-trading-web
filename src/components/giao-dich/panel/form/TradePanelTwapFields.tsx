'use client';

import { useState } from 'react';

import dayjs from 'dayjs';
import { RiCalendarLine } from 'react-icons/ri';

import Calendar from '@/components/common/ui/Calendar';
import { TWAP_LO_URGENCY, TWAP_LO_URGENCY_OPTIONS } from '@/constants/trading';
import { useClickOutside } from '@/hooks/lib/useClickOutside';
import type { TwapLoUrgency } from '@/types/trade/twap-lo';
import { formatDateTime } from '@/utils/format';
import { getTradingFieldBg } from '@/utils/trading/panel';

const CALENDAR_WIDTH = 256;
const CALENDAR_HEIGHT = 140;
const DROPDOWN_HEIGHT = 84;
const TRADING_SESSIONS = [
    { start: { hour: 9, minute: 15 }, end: { hour: 11, minute: 30 } },
    { start: { hour: 13, minute: 0 }, end: { hour: 14, minute: 30 } },
];

const toMinutes = (h: number, mi: number) => h * 60 + mi;

const isWithinTradingTime = (h: number, mi: number) =>
    TRADING_SESSIONS.some(
        ({ start, end }) =>
            toMinutes(h, mi) >= toMinutes(start.hour, start.minute) &&
            toMinutes(h, mi) <= toMinutes(end.hour, end.minute),
    );

const isTradingHour = (h: number) =>
    TRADING_SESSIONS.some(({ start, end }) => h >= start.hour && h <= end.hour);

type Props = {
    startAt: string;
    urgency: TwapLoUrgency;
    side: 'buy' | 'sell';
    onStartAtChange: (value: string) => void;
    onUrgencyChange: (value: TwapLoUrgency) => void;
};

export const TradePanelTwapFields = ({
    startAt,
    urgency,
    side,
    onStartAtChange,
    onUrgencyChange,
}: Props) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isDropUp, setIsDropUp] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [calendarValue, setCalendarValue] = useState<Date | null>(null);
    const [calendarPos, setCalendarPos] = useState<{ top: number; left: number } | null>(null);
    const dropdownRef = useClickOutside<HTMLDivElement>(() => {
        setIsDropdownOpen(false);
        setIsCalendarOpen(false);
    }, isDropdownOpen || isCalendarOpen);

    const hasStartAt = !!startAt;
    const displayValue = hasStartAt ? formatDateTime(startAt) : 'Ngay sau khi đặt lệnh';

    const now = dayjs();
    const selectedDay = dayjs(calendarValue ?? undefined);

    const clampToTradingTime = (d: dayjs.Dayjs) => {
        const t = toMinutes(d.hour(), d.minute());
        for (const { start, end } of TRADING_SESSIONS) {
            if (t < toMinutes(start.hour, start.minute)) {
                return d.hour(start.hour).minute(start.minute);
            }
            if (t <= toMinutes(end.hour, end.minute)) {
                return d;
            }
        }
        const { end } = TRADING_SESSIONS[TRADING_SESSIONS.length - 1];
        return d.hour(end.hour).minute(end.minute);
    };

    const getUrgencyLabel = (key: TwapLoUrgency) => {
        if (key === TWAP_LO_URGENCY.SLOW) return 'Chậm';
        if (key === TWAP_LO_URGENCY.FAST) return 'Nhanh';
        return 'Bình thường';
    };

    const handleOpenDropdown = () => {
        setIsCalendarOpen(false);
        const el = dropdownRef.current;
        if (el) {
            const rect = el.getBoundingClientRect();
            const scrollParent = el.closest('.overflow-y-auto');
            const boundBottom = scrollParent
                ? Math.min(scrollParent.getBoundingClientRect().bottom, window.innerHeight)
                : window.innerHeight;
            setIsDropUp(boundBottom - rect.bottom < DROPDOWN_HEIGHT);
        }
        setIsDropdownOpen((prev) => !prev);
    };

    const handleSelectImmediate = () => {
        onStartAtChange('');
        setIsDropdownOpen(false);
    };

    const handleOpenCalendar = () => {
        const base = startAt ? dayjs(startAt) : dayjs();
        setCalendarValue(
            clampToTradingTime(dayjs().hour(base.hour()).minute(base.minute())).toDate(),
        );
        setIsDropdownOpen(false);
        const rect = dropdownRef.current?.getBoundingClientRect();
        if (rect) {
            setCalendarPos({
                top: Math.max(8, Math.min(rect.top, window.innerHeight - CALENDAR_HEIGHT - 8)),
                left: Math.max(8, rect.left - CALENDAR_WIDTH - 8),
            });
        }
        setIsCalendarOpen(true);
    };

    const handleConfirmDateTime = (date: Date) => {
        const d = dayjs(date);
        if (d.isBefore(dayjs(), 'minute')) return;
        if (!isWithinTradingTime(d.hour(), d.minute())) return;
        onStartAtChange(d.format('YYYY-MM-DDTHH:mm'));
        setIsCalendarOpen(false);
    };

    return (
        <div className="flex w-full flex-col gap-2">
            <div ref={dropdownRef} className="relative flex w-full flex-col gap-1">
                <button
                    type="button"
                    onClick={handleOpenDropdown}
                    aria-haspopup="listbox"
                    aria-expanded={isDropdownOpen}
                    className={`flex w-full items-center justify-between rounded-xl p-2 transition-colors ${getTradingFieldBg(true, side)}`}
                >
                    <span className="flex items-center justify-center px-1">
                        <RiCalendarLine size={14} className="text-primary" />
                    </span>
                    <span className="flex flex-1 flex-col items-center justify-center">
                        <span className="font-caption text-tertiary">{'Thời gian bắt đầu'}</span>
                        <span className="font-body-3-highlight text-primary">{displayValue}</span>
                    </span>
                    <span className="w-5 px-1" aria-hidden />
                </button>
                {isDropdownOpen && (
                    <ul
                        role="listbox"
                        aria-label={'Thời gian bắt đầu'}
                        className={`absolute left-0 right-0 z-20 overflow-hidden rounded-xl border border-tertiary bg-secondary ${
                            isDropUp ? 'bottom-full mb-1' : 'top-full mt-1'
                        }`}
                    >
                        <li>
                            <button
                                type="button"
                                role="option"
                                aria-selected={!hasStartAt}
                                onClick={handleSelectImmediate}
                                className={`flex w-full items-center px-3 py-2 text-left font-caption transition-colors ${
                                    !hasStartAt
                                        ? 'bg-tertiary text-primary'
                                        : 'text-secondary hover:bg-tertiary hover:text-primary'
                                }`}
                            >
                                {'Ngay sau khi đặt lệnh'}
                            </button>
                        </li>
                        <li>
                            <button
                                type="button"
                                role="option"
                                aria-selected={hasStartAt}
                                onClick={handleOpenCalendar}
                                className={`flex w-full items-center px-3 py-2 text-left font-caption transition-colors ${
                                    hasStartAt
                                        ? 'bg-tertiary text-primary'
                                        : 'text-secondary hover:bg-tertiary hover:text-primary'
                                }`}
                            >
                                {hasStartAt ? formatDateTime(startAt) : 'Tự chọn'}
                            </button>
                        </li>
                    </ul>
                )}
                {isCalendarOpen && calendarPos && (
                    <div
                        className="fixed z-50"
                        style={{ top: calendarPos.top, left: calendarPos.left }}
                    >
                        <Calendar
                            value={calendarValue}
                            onChange={setCalendarValue}
                            onConfirm={handleConfirmDateTime}
                            timeOnly
                            disableHour={(h) => !isTradingHour(h) || h < now.hour()}
                            disableMinute={(mi) =>
                                !isWithinTradingTime(selectedDay.hour(), mi) ||
                                (selectedDay.hour() === now.hour() && mi < now.minute())
                            }
                        />
                    </div>
                )}
            </div>
            <div className="flex w-full flex-col gap-1">
                <p className="font-caption text-secondary">{'Tốc độ phi lệnh'}</p>
                <div
                    className="flex w-full items-start gap-3"
                    role="radiogroup"
                    aria-label={'Chọn tốc độ phi lệnh'}
                >
                    {TWAP_LO_URGENCY_OPTIONS.map((option) => {
                        const isSelected = urgency === option;
                        return (
                            <button
                                key={option}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() => onUrgencyChange(option)}
                                className={`flex flex-1 items-center justify-center rounded-full py-0.5 font-caption transition-colors ${
                                    isSelected
                                        ? 'bg-highlight text-quaternary'
                                        : 'text-tertiary hover:text-secondary'
                                }`}
                            >
                                {getUrgencyLabel(option)}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
