'use client';

import { type RefObject } from 'react';

import { RiArrowDownSLine } from 'react-icons/ri';

import { EXCHANGE_SESSION, ORDER_MODE_KEY } from '@/constants/trading';
import type { OrderModeOption } from '@/types/pages/trading';

type Props = {
    dropdownRef: RefObject<HTMLDivElement>;
    exchangeSession: string | null;
    orderMode: string;
    selectedOrderModeLabel: string;
    availableOrderModes: OrderModeOption[];
    isDropdownOpen: boolean;
    onToggleDropdown: () => void;
    onSelectMode: (key: string) => void;
};

export const TradePanelOrderMode = ({
    dropdownRef,
    exchangeSession,
    orderMode,
    selectedOrderModeLabel,
    availableOrderModes,
    isDropdownOpen,
    onToggleDropdown,
    onSelectMode,
}: Props) => {
    return (
        <div ref={dropdownRef} className="relative w-full">
            {exchangeSession === EXCHANGE_SESSION.CLOSED ? (
                <div className="flex w-full items-center justify-between gap-2 rounded-xl border border-quaternary bg-transparent px-3 py-2">
                    <span className="font-caption-highlight text-primary">
                        {selectedOrderModeLabel}
                    </span>
                </div>
            ) : (
                <>
                    <div
                        role="button"
                        className="flex w-full items-center justify-between gap-2 rounded-xl border border-quaternary bg-transparent px-3 py-2"
                        aria-haspopup="listbox"
                        aria-expanded={isDropdownOpen}
                        aria-label={'Chọn chế độ đặt lệnh'}
                        onClick={onToggleDropdown}
                    >
                        <span className="font-caption-highlight text-primary">
                            {selectedOrderModeLabel}
                        </span>
                        <RiArrowDownSLine
                            className={`h-5 w-5 text-secondary transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                        />
                    </div>
                    {isDropdownOpen && (
                        <ul
                            role="listbox"
                            aria-label={'Chọn chế độ đặt lệnh'}
                            className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-tertiary bg-secondary"
                        >
                            {availableOrderModes.map(({ key }) => {
                                const isSelected = orderMode === key;
                                const optionLabel =
                                    key === ORDER_MODE_KEY.TAB_247
                                        ? 'Lệnh 24/7'
                                        : key === ORDER_MODE_KEY.ICEBERG
                                          ? 'Lệnh Iceberg'
                                          : key === ORDER_MODE_KEY.TWAP_LO
                                            ? 'Lệnh CD LO'
                                            : 'Lệnh thường';
                                return (
                                    <li key={key}>
                                        <button
                                            type="button"
                                            role="option"
                                            aria-selected={isSelected}
                                            onClick={() => onSelectMode(key)}
                                            className={`flex w-full items-center px-3 py-2 text-left font-caption transition-colors ${
                                                isSelected
                                                    ? 'bg-tertiary text-primary'
                                                    : 'text-secondary hover:bg-tertiary hover:text-primary'
                                            }`}
                                        >
                                            {optionLabel}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </>
            )}
        </div>
    );
};
