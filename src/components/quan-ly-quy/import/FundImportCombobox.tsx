import { useId, useState } from 'react';

import { FaChevronDown } from 'react-icons/fa6';

import { useClickOutside } from '@/hooks/lib/useClickOutside';
import { useTranslate } from '@/hooks/useTranslate';

type Props = {
    value: string;
    options: string[];
    onChange: (value: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    inputClassName: string;
    ariaLabel?: string;
};

export const FundImportCombobox = ({
    value,
    options,
    onChange,
    onBlur,
    placeholder,
    inputClassName,
    ariaLabel,
}: Props) => {
    const trans = useTranslate();
    const resolvedAriaLabel = ariaLabel ?? trans.fund.import.sector_list_aria;
    const [open, setOpen] = useState(false);
    const dropdownRef = useClickOutside<HTMLDivElement>(() => setOpen(false), open);
    const listboxId = useId();

    const normalizedValue = value.trim().toLowerCase();
    const filteredOptions = !normalizedValue
        ? options
        : options.filter((sector) => sector.toLowerCase().includes(normalizedValue));

    const toggleListByInputKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setOpen(false);
        } else if (e.key === 'ArrowDown' && open) {
            e.preventDefault();
            const first = dropdownRef.current?.querySelector<HTMLElement>('[role="option"]');
            first?.focus();
        }
    };

    const selectOptionByKey = (e: React.KeyboardEvent, sector: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onChange(sector);
            setOpen(false);
        } else if (e.key === 'Escape') {
            setOpen(false);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            (e.currentTarget.nextElementSibling as HTMLElement)?.focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            (e.currentTarget.previousElementSibling as HTMLElement)?.focus();
        }
    };

    return (
        <div ref={dropdownRef} className="relative">
            <input
                type="text"
                role="combobox"
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onBlur={onBlur}
                onKeyDown={toggleListByInputKey}
                placeholder={placeholder}
                aria-expanded={open}
                aria-autocomplete="list"
                aria-controls={open ? listboxId : undefined}
                aria-label={resolvedAriaLabel}
                className={`${inputClassName} pr-9`}
            />
            <button
                type="button"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setOpen((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-1 text-secondary transition-colors hover:text-primary"
                aria-label={resolvedAriaLabel}
                aria-expanded={open}
                aria-haspopup="listbox"
            >
                <FaChevronDown
                    size={12}
                    aria-hidden="true"
                    className={`transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </button>
            {open && filteredOptions.length > 0 && (
                <ul
                    id={listboxId}
                    role="listbox"
                    aria-label={resolvedAriaLabel}
                    className="scrollbar absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-quaternary bg-secondary p-1 shadow-2xl"
                >
                    {filteredOptions.map((sector) => (
                        <li
                            key={sector}
                            role="option"
                            tabIndex={-1}
                            aria-selected={sector === value}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                                onChange(sector);
                                setOpen(false);
                            }}
                            onKeyDown={(e) => selectOptionByKey(e, sector)}
                            className="w-full cursor-pointer rounded-xl px-3 py-2 text-left font-body-3 text-primary transition-colors hover:bg-tertiary"
                        >
                            {sector}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
