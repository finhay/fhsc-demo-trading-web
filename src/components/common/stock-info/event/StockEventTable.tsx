'use client';

import { useState } from 'react';

import { RiArrowRightSLine } from 'react-icons/ri';

import { Dialog } from '@/components/common/ui/Dialog';
import { useTranslate } from '@/hooks/useTranslate';
import type { StockEvent } from '@/types/datafeed/stock-event';
import { formatDate } from '@/utils/format';

type Props = {
    events: StockEvent[];
};

export const StockEventTable = ({ events }: Props) => {
    const trans = useTranslate();
    const [selectedEvent, setSelectedEvent] = useState<StockEvent | null>(null);

    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-tertiary p-3">
            <div className="flex items-start gap-8 overflow-hidden font-body-3 text-secondary">
                <span className="min-w-0 flex-1">{trans.stockInfo.events.col_event}</span>
                <span className="w-40 shrink-0">{trans.stockInfo.events.col_event_type}</span>
                <span className="w-32 shrink-0">{trans.stockInfo.events.col_record_date}</span>
                <span className="w-32 shrink-0">{trans.stockInfo.events.col_ex_right_date}</span>
                <span className="w-12 shrink-0" aria-hidden />
            </div>
            <div className="flex flex-col gap-6">
                {events.map((event, index) => (
                    <div
                        key={event.id ?? `${event.title}-${index}`}
                        className="flex items-start gap-8 overflow-hidden"
                    >
                        <p className="min-w-0 flex-1 font-body-3 text-primary">{event.title}</p>
                        <p className="w-40 shrink-0 font-body-3 text-primary">
                            {event.eventTypeName}
                        </p>
                        <p className="w-32 shrink-0 font-body-3 text-primary">
                            <time dateTime={event.actionDate}>{formatDate(event.actionDate)}</time>
                        </p>
                        <p className="w-32 shrink-0 font-body-3 text-primary">
                            <time dateTime={event.gdkhqDate}>{formatDate(event.gdkhqDate)}</time>
                        </p>
                        <button
                            type="button"
                            onClick={() => setSelectedEvent(event)}
                            className="flex w-12 shrink-0 items-start justify-center text-secondary transition-opacity hover:opacity-80"
                            aria-label={trans.stockInfo.events.view_detail_aria}
                        >
                            <RiArrowRightSLine size={20} aria-hidden />
                        </button>
                    </div>
                ))}
            </div>
            {selectedEvent && (
                <Dialog
                    title={selectedEvent.title}
                    maxWidth="max-w-3xl"
                    maxHeight="max-h-[90vh]"
                    onClose={() => setSelectedEvent(null)}
                >
                    <div
                        className="font-body-3 leading-relaxed text-primary [&_.item-info]:inline [&_.item-info-main]:font-body-3-highlight [&_.row]:mb-2"
                        dangerouslySetInnerHTML={{ __html: selectedEvent.body ?? '' }}
                    />
                </Dialog>
            )}
        </div>
    );
};
