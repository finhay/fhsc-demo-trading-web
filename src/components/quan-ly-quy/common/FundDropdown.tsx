import { useCallback, useRef, useState } from 'react';

import { FaChevronDown } from 'react-icons/fa6';

import { useClickOutside } from '@/hooks/lib/useClickOutside';
import type { FundSelectOption } from '@/types/pages/fund';

type Props = {
    options: FundSelectOption[];
    value: string;
    onChange: (value: string) => void;
    allLabel: string;
    ariaLabel?: string;
};

export const FundDropdown = ({ options, value, onChange, allLabel, ariaLabel }: Props) => {
    const [open, setOpen] = useState(false);
    const listRef = useRef<HTMLUListElement>(null);

    const dropdownRef = useClickOutside<HTMLDivElement>(() => setOpen(false), open);

    const displayLabel = !value
        ? allLabel
        : (options.find((o) => o.value === value)?.label ?? allLabel);

    const selectAndClose = useCallback(
        (val: string) => {
            onChange(val);
            setOpen(false);
        },
        [onChange],
    );

    const navigateListByKey = useCallback((e: React.KeyboardEvent<HTMLUListElement>) => {
        const items = listRef.current?.querySelectorAll<HTMLLIElement>('[role="option"]');
        if (!items?.length) return;
        const focused = document.activeElement as HTMLLIElement;
        const idx = Array.from(items).indexOf(focused);

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            items[Math.min(idx + 1, items.length - 1)]?.focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            items[Math.max(idx - 1, 0)]?.focus();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setOpen(false);
        }
    }, []);

    return (
        <div ref={dropdownRef} className="relative w-64">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center gap-2 rounded-xl border border-quaternary bg-secondary px-3 py-2 font-body-3 text-primary outline-none transition-colors"
                aria-expanded={open}
                aria-haspopup="listbox"
                aria-label={ariaLabel ?? displayLabel}
            >
                <span className="min-w-0 flex-1 truncate text-left">{displayLabel}</span>
                <FaChevronDown
                    className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                    size={12}
                />
            </button>
            {open && (
                <ul
                    ref={listRef}
                    className="scrollbar absolute top-full right-0 z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-quaternary bg-secondary p-1 shadow-2xl"
                    role="listbox"
                    aria-label={ariaLabel ?? displayLabel}
                    onKeyDown={navigateListByKey}
                >
                    <li
                        role="option"
                        tabIndex={0}
                        aria-selected={!value}
                        onClick={() => selectAndClose('')}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                selectAndClose('');
                            }
                        }}
                        className={`cursor-pointer rounded-xl px-3 py-2 font-body-3 transition-colors hover:bg-tertiary ${
                            !value ? 'text-highlight' : 'text-secondary'
                        }`}
                    >
                        {allLabel}
                    </li>
                    {options.map((o) => {
                        const selected = o.value === value;
                        return (
                            <li
                                key={o.value}
                                role="option"
                                tabIndex={0}
                                aria-selected={selected}
                                onClick={() => selectAndClose(o.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        selectAndClose(o.value);
                                    }
                                }}
                                className={`cursor-pointer truncate rounded-xl px-3 py-2 font-body-3 transition-colors hover:bg-tertiary ${
                                    selected ? 'text-highlight' : 'text-primary'
                                }`}
                            >
                                {o.label}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};
