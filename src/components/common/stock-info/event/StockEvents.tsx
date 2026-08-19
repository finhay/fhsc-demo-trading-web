'use client';

import { useEffect, useMemo, useState } from 'react';

import {
    type EventTypeOption,
    StockEventNav,
} from '@/components/common/stock-info/event/StockEventNav';
import { StockEventTable } from '@/components/common/stock-info/event/StockEventTable';
import type { DropdownOption } from '@/components/common/ui/Dropdown';
import { Spinner } from '@/components/common/ui/Spinner';
import { useTranslate } from '@/hooks/useTranslate';
import { fetchStockNews } from '@/services/api/datafeed/stock-event';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';
import type { StockEvent } from '@/types/datafeed/stock-event';
import { isSuccessApi } from '@/utils/common';
import { formatDate, getYearRange } from '@/utils/format';

export const StockEvents = () => {
    const trans = useTranslate();
    const { selectedStock } = useStockInfoStore();

    const [range, setRange] = useState('1');
    const [selectedEventType, setSelectedEventType] = useState('');
    const [events, setEvents] = useState<StockEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const rangeOptions: readonly DropdownOption[] = useMemo(
        () => [
            { value: '1', label: trans.stockInfo.events.range_1y },
            { value: '3', label: trans.stockInfo.events.range_3y },
            { value: '5', label: trans.stockInfo.events.range_5y },
        ],
        [trans],
    );

    const eventTypes: EventTypeOption[] = useMemo(() => {
        const seen = new Set<string>();
        const unique: EventTypeOption[] = [];
        events.forEach((event) => {
            if (event.eventType && !seen.has(event.eventType)) {
                seen.add(event.eventType);
                unique.push({ eventType: event.eventType, eventTypeName: event.eventTypeName });
            }
        });
        return unique;
    }, [events]);

    const filteredEvents = useMemo(
        () =>
            selectedEventType
                ? events.filter((event) => event.eventType === selectedEventType)
                : events,
        [events, selectedEventType],
    );

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const { fromDate, toDate } = getYearRange(Number(range));
            const { error_code, result } = await fetchStockNews({
                stock: selectedStock?.symbol ?? '',
                fromDate: formatDate(fromDate),
                toDate: formatDate(toDate),
            });
            if (isSuccessApi(error_code)) {
                setEvents(result ?? []);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!selectedStock?.symbol) return;
        fetchEvents();
    }, [selectedStock?.symbol, range]);

    return (
        <section className="flex flex-col gap-2" aria-busy={isLoading}>
            <StockEventNav
                eventTypes={eventTypes}
                selectedEventType={selectedEventType}
                onSelectEventType={setSelectedEventType}
                rangeOptions={rangeOptions}
                rangeValue={range}
                onRangeChange={setRange}
            />
            {isLoading ? (
                <div className="flex items-center justify-center py-8" role="status">
                    <Spinner isLoading isOverlay={false} />
                </div>
            ) : filteredEvents.length === 0 ? (
                <p className="font-body-3 text-secondary">{trans.stockInfo.events.empty}</p>
            ) : (
                <StockEventTable events={filteredEvents} />
            )}
        </section>
    );
};
