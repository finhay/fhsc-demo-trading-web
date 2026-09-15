'use client';

import { Dropdown, type DropdownOption } from '@/components/common/ui/Dropdown';

export type EventTypeOption = {
    eventType: string;
    eventTypeName: string;
};

type Props = {
    eventTypes: EventTypeOption[];
    selectedEventType: string;
    onSelectEventType: (value: string) => void;
    rangeOptions: readonly DropdownOption[];
    rangeValue: string;
    onRangeChange: (value: string) => void;
};

export const StockEventNav = ({
    eventTypes,
    selectedEventType,
    onSelectEventType,
    rangeOptions,
    rangeValue,
    onRangeChange,
}: Props) => {
    const tabs: EventTypeOption[] = [
        { eventType: '', eventTypeName: 'Tất cả sự kiện' },
        ...eventTypes,
    ];

    return (
        <div className="flex items-center justify-between gap-4">
            <ul role="tablist" className="flex list-none items-center gap-1">
                {tabs.map((tab) => {
                    const isSelected = selectedEventType === tab.eventType;

                    return (
                        <li key={tab.eventType || 'all'} role="presentation" className="flex">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={isSelected}
                                onClick={() => onSelectEventType(tab.eventType)}
                                className={`cursor-pointer rounded-full px-3 py-1 whitespace-nowrap transition-colors ${
                                    isSelected
                                        ? 'base-tertiary body-4-highlight text-primary'
                                        : 'body-4 text-secondary'
                                }`}
                            >
                                {tab.eventTypeName}
                            </button>
                        </li>
                    );
                })}
            </ul>
            <Dropdown options={rangeOptions} value={rangeValue} onChange={onRangeChange} />
        </div>
    );
};
