'use client';

import { useState } from 'react';

import { FaChevronDown } from 'react-icons/fa6';

export type DropdownOption = { value: string; label: string };

type Props = {
    options: readonly DropdownOption[];
    value: string;
    onChange: (value: string) => void;
};

export const Dropdown = ({ options, value, onChange }: Props) => {
    const [isOpen, setIsOpen] = useState(false);

    const selectedLabel = options.find((option) => option.value === value)?.label ?? value;

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button
                type="button"
                className="flex items-center gap-2 body-4 text-primary"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <span>{selectedLabel}</span>
                <FaChevronDown
                    size={14}
                    aria-hidden="true"
                    className={`text-secondary shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                />
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 z-10 pt-2">
                    <ul
                        role="listbox"
                        className="flex w-max min-w-full flex-col gap-4 rounded-xl base-quaternary p-4"
                    >
                        {options.map((option) => {
                            const isSelected = value === option.value;

                            return (
                                <li
                                    key={option.value || 'all'}
                                    role="option"
                                    aria-selected={isSelected}
                                >
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onChange(option.value);
                                            setIsOpen(false);
                                        }}
                                        className="flex w-full cursor-pointer items-center justify-between gap-4 text-left"
                                    >
                                        <span
                                            className={
                                                isSelected
                                                    ? 'body-4-highlight text-primary'
                                                    : 'body-4 text-primary'
                                            }
                                        >
                                            {option.label}
                                        </span>
                                        <span
                                            className={
                                                isSelected ? 'shrink-0' : 'shrink-0 opacity-0'
                                            }
                                        >
                                            <span
                                                aria-hidden="true"
                                                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-highlight"
                                            >
                                                <span className="h-3 w-3 rounded-full base-highlight" />
                                            </span>
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};
