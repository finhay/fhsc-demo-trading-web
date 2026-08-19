'use client';

import { useState } from 'react';

import { FaChevronDown, FaChevronUp } from 'react-icons/fa6';

import { useTranslate } from '@/hooks/useTranslate';
import type { ExchangeTab } from '@/types/pages/iboard';
import { getDropdownActiveLabel, getExchangeTabClass, isDropdownActive } from '@/utils/iboard';

type Props = {
    tabs: ExchangeTab[];
    exchange: string;
    onSelectExchange: (value: string) => void;
};

export const IBoardExchangeTab = ({ tabs, exchange, onSelectExchange }: Props) => {
    const trans = useTranslate();
    const [openDropdownKey, setOpenDropdownKey] = useState<string | null>(null);

    return (
        <nav
            aria-label={trans.iboard.exchange_board_filter_nav}
            className="flex min-w-0 items-center"
        >
            <ul
                role="tablist"
                aria-label={trans.iboard.exchange_group_tablist}
                className="flex items-center gap-2 list-none p-0 m-0"
            >
                {tabs.map((tab) => {
                    if (tab.type === 'single') {
                        return (
                            <li key={tab.key} role="presentation">
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={exchange === tab.option.value}
                                    onClick={() => onSelectExchange(tab.option.value)}
                                    className={getExchangeTabClass(exchange === tab.option.value)}
                                >
                                    {tab.option.label}
                                </button>
                            </li>
                        );
                    }

                    const isOpen = openDropdownKey === tab.key;
                    const activeLabel = getDropdownActiveLabel(tab, exchange);
                    const active = isDropdownActive(tab, exchange);

                    return (
                        <li
                            key={tab.key}
                            role="presentation"
                            className="relative"
                            onMouseEnter={() => setOpenDropdownKey(tab.key)}
                            onMouseLeave={() => setOpenDropdownKey(null)}
                        >
                            <button
                                type="button"
                                role="tab"
                                aria-haspopup="listbox"
                                aria-expanded={isOpen}
                                aria-selected={active}
                                className={`${getExchangeTabClass(active)} gap-2`}
                            >
                                <span>{activeLabel}</span>
                                {isOpen ? (
                                    <FaChevronUp
                                        aria-hidden="true"
                                        size={12}
                                        className="shrink-0 text-secondary"
                                    />
                                ) : (
                                    <FaChevronDown
                                        aria-hidden="true"
                                        size={12}
                                        className="shrink-0 text-secondary"
                                    />
                                )}
                            </button>

                            {isOpen && (
                                <div className="absolute left-0 top-full z-50 pt-1">
                                    <ul
                                        role="listbox"
                                        aria-label={trans.iboard.exchange_options_list_for.replace(
                                            '{name}',
                                            tab.defaultLabel,
                                        )}
                                        className="w-32 list-none overflow-hidden rounded-xl bg-tertiary p-0 m-0 shadow-lg"
                                    >
                                        {tab.options.map((option) => (
                                            <li
                                                key={option.value}
                                                role="option"
                                                aria-selected={exchange === option.value}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        onSelectExchange(option.value);
                                                        setOpenDropdownKey(null);
                                                    }}
                                                    className={`w-full p-2 text-left font-body-3 transition-colors ${
                                                        exchange === option.value
                                                            ? 'text-highlight'
                                                            : 'text-secondary hover:text-primary'
                                                    }`}
                                                >
                                                    {option.label}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};
