'use client';

import { useState } from 'react';

import { RiArrowRightSLine } from 'react-icons/ri';

import { Dialog } from '@/components/common/ui/Dialog';
import type { StockEvent } from '@/types/datafeed/stock-event';
import { formatDate } from '@/utils/format';

type Props = {
    events: StockEvent[];
};

export const StockEventTable = ({ events }: Props) => {
    const [selectedEvent, setSelectedEvent] = useState<StockEvent | null>(null);

    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-tertiary p-3">
            <div className="flex items-start gap-8 overflow-hidden body-4 text-secondary">
                <span className="min-w-0 flex-1">{'Sự kiện'}</span>
                <span className="w-40 shrink-0">{'Loại sự kiện'}</span>
                <span className="w-32 shrink-0">{'Ngày chốt'}</span>
                <span className="w-32 shrink-0">{'Ngày GDKHQ'}</span>
                <span className="w-12 shrink-0" aria-hidden />
            </div>
            <div className="flex flex-col gap-6">
                {events.map((event, index) => (
                    <div
                        key={event.id ?? `${event.title}-${index}`}
                        className="flex items-start gap-8 overflow-hidden"
                    >
                        <p className="min-w-0 flex-1 body-4 text-primary">{event.title}</p>
                        <p className="w-40 shrink-0 body-4 text-primary">
                            {event.eventTypeName}
                        </p>
                        <p className="w-32 shrink-0 body-4 text-primary">
                            <time dateTime={event.actionDate}>{formatDate(event.actionDate)}</time>
                        </p>
                        <p className="w-32 shrink-0 body-4 text-primary">
                            <time dateTime={event.gdkhqDate}>{formatDate(event.gdkhqDate)}</time>
                        </p>
                        <button
                            type="button"
                            onClick={() => setSelectedEvent(event)}
                            className="flex w-12 shrink-0 items-start justify-center text-secondary transition-opacity hover:opacity-80"
                            aria-label={'Xem chi tiết sự kiện'}
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
                        className="body-4 leading-relaxed text-primary [&_.item-info]:inline [&_.item-info-main]:body-4-highlight [&_.row]:mb-2"
                        dangerouslySetInnerHTML={{ __html: selectedEvent.body ?? '' }}
                    />
                </Dialog>
            )}
        </div>
    );
};
