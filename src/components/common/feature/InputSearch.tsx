'use client';

import { type MouseEvent as ReactMouseEvent, useEffect, useMemo, useRef, useState } from 'react';

import { FiSearch } from 'react-icons/fi';

import { MARKET_INDEX_LIST } from '@/constants/market';
import { useClickOutside } from '@/hooks/lib/useClickOutside';
import { useHotkeys } from '@/hooks/lib/useHotkeys';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';
import type { StocksInfoV2Item } from '@/types/datafeed/stock-info';
import { sortSearchResults } from '@/utils/common';

export type SearchResultItem =
    | { kind: 'index'; symbol: string }
    | { kind: 'stock'; symbol: string; stock: StocksInfoV2Item };

type Props = {
    onSelectStock?: (stock: StocksInfoV2Item, event?: ReactMouseEvent) => void;
    onSelectIndex?: (index: string) => void;
    onClear?: () => void;
    value?: string;
    className?: string;
    inputClassName?: string;
    placeholder?: string;
    includeIndices?: boolean;
    variant?: 'default' | 'pill';
    inputId?: string;
};

export const InputSearch = ({
    onSelectStock,
    onSelectIndex,
    onClear,
    value,
    className = 'w-48',
    inputClassName,
    placeholder,
    includeIndices = false,
    variant = 'default',
    inputId = 'stock-search',
}: Props) => {
    const resolvedPlaceholder = placeholder ?? 'Tìm kiếm';
    const { allStocks, fetchAllStocks } = useStockInfoStore();
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isSearchDropdownVisible, setIsSearchDropdownVisible] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const dropdownRef = useRef<HTMLUListElement | null>(null);

    const searchResults = useMemo<SearchResultItem[]>(() => {
        const normalizedKeyword = searchKeyword.trim();
        const searchKey = normalizedKeyword.toUpperCase();

        const indexItems: SearchResultItem[] = includeIndices
            ? MARKET_INDEX_LIST.filter((index) => !searchKey || index.includes(searchKey)).map(
                  (index) => ({ kind: 'index', symbol: index }),
              )
            : [];

        const stockItems: SearchResultItem[] = allStocks
            .filter((stock) => !searchKey || stock.symbol.toUpperCase().includes(searchKey))
            .map((stock) => ({ kind: 'stock', symbol: stock.symbol, stock }));

        const merged = [...indexItems, ...stockItems];
        if (!normalizedKeyword) {
            return merged.sort((a, b) => a.symbol.localeCompare(b.symbol));
        }

        return sortSearchResults(normalizedKeyword, merged);
    }, [searchKeyword, allStocks, includeIndices]);

    const wrapperRef = useClickOutside<HTMLDivElement>(() => {
        setIsSearchDropdownVisible(false);
    });

    const selectItem = (item: SearchResultItem, event?: ReactMouseEvent) => {
        event?.stopPropagation();
        setSearchKeyword(item.symbol);
        setIsSearchDropdownVisible(false);
        setFocusedIndex(-1);
        if (item.kind === 'index') {
            onSelectIndex?.(item.symbol);
            return;
        }
        onSelectStock?.(item.stock, event);
    };

    const handleSearchChange = (nextValue: string) => {
        setSearchKeyword(nextValue);
        setIsSearchDropdownVisible(true);
        if (!nextValue.trim()) {
            onClear?.();
        }
    };

    const renderHighlightedText = (text: string) => {
        const trimmedKeyword = searchKeyword.trim();
        if (!trimmedKeyword) {
            return text;
        }

        const escapedKeyword = trimmedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const parts = text.split(new RegExp(`(${escapedKeyword})`, 'gi'));

        return parts.map((part, index) =>
            part.toUpperCase() === trimmedKeyword.toUpperCase() ? (
                <span key={`${text}-${part}-${index}`} className="text-highlight">
                    {part}
                </span>
            ) : (
                part
            ),
        );
    };

    const handleSelectFocused = () => {
        if (!isSearchDropdownVisible || searchResults.length === 0) {
            return;
        }

        const focusedItem = searchResults[focusedIndex];
        if (focusedItem) {
            selectItem(focusedItem);
        }
    };

    useHotkeys(
        'ArrowDown',
        () => {
            if (searchResults.length === 0) {
                return;
            }
            setIsSearchDropdownVisible(true);
            setFocusedIndex((prev) => (prev < 0 ? 0 : (prev + 1) % searchResults.length));
        },
        { enabled: isInputFocused, ignoreInputs: false },
    );

    useHotkeys(
        'ArrowUp',
        () => {
            if (searchResults.length === 0) {
                return;
            }
            setIsSearchDropdownVisible(true);
            setFocusedIndex((prev) => (prev <= 0 ? searchResults.length - 1 : prev - 1));
        },
        { enabled: isInputFocused, ignoreInputs: false },
    );

    useHotkeys(
        'Enter',
        () => {
            handleSelectFocused();
        },
        { enabled: isInputFocused, ignoreInputs: false },
    );

    useEffect(() => {
        if (isSearchDropdownVisible && searchResults.length > 0) {
            setFocusedIndex(0);
            return;
        }
        setFocusedIndex(-1);
    }, [isSearchDropdownVisible, searchResults]);

    useEffect(() => {
        if (!isSearchDropdownVisible || focusedIndex < 0) {
            return;
        }

        const focusedElement = dropdownRef.current?.querySelector<HTMLElement>(
            `[data-option-index="${focusedIndex}"]`,
        );
        focusedElement?.scrollIntoView({ block: 'nearest' });
    }, [focusedIndex, isSearchDropdownVisible]);

    useEffect(() => {
        if (value !== undefined) {
            setSearchKeyword(value);
        }
    }, [value]);

    useEffect(() => {
        fetchAllStocks();
    }, [fetchAllStocks]);

    const isPill = variant === 'pill';

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            <form onSubmit={(event) => event.preventDefault()}>
                <div
                    className={`relative flex items-center gap-2 px-3 py-1.5 border border-quaternary ${
                        isPill ? 'rounded-full bg-transparent' : 'rounded-xl bg-secondary'
                    }`}
                >
                    <FiSearch size={16} className="flex-shrink-0 text-primary" aria-hidden="true" />
                    <input
                        type="search"
                        id={inputId}
                        name={inputId}
                        role="combobox"
                        aria-expanded={isSearchDropdownVisible && searchResults.length > 0}
                        aria-controls={`${inputId}-listbox`}
                        aria-autocomplete="list"
                        aria-activedescendant={
                            focusedIndex >= 0 ? `${inputId}-option-${focusedIndex}` : undefined
                        }
                        aria-label={resolvedPlaceholder}
                        value={searchKeyword.toUpperCase()}
                        onChange={(event) => handleSearchChange(event.target.value)}
                        onFocus={(event) => {
                            event.target.select();
                            setIsInputFocused(true);
                            setIsSearchDropdownVisible(true);
                        }}
                        onBlur={() => setIsInputFocused(false)}
                        placeholder={resolvedPlaceholder}
                        className={`min-w-0 flex-1 bg-transparent text-primary outline-none placeholder:text-secondary ${
                            inputClassName ?? 'font-body-3'
                        }`}
                    />
                </div>
                {isSearchDropdownVisible && searchResults.length > 0 && (
                    <ul
                        ref={dropdownRef}
                        id={`${inputId}-listbox`}
                        role="listbox"
                        aria-label={'Kết quả tìm kiếm'}
                        className="scrollbar absolute top-full left-0 right-0 bg-secondary border border-tertiary rounded-xl overflow-hidden z-50 shadow-lg max-h-60 overflow-y-auto"
                    >
                        {searchResults.map((item, index) => (
                            <li
                                id={`${inputId}-option-${index}`}
                                data-option-index={index}
                                key={`${item.kind}-${item.symbol}`}
                                role="option"
                                aria-selected={focusedIndex === index}
                            >
                                <button
                                    type="button"
                                    onClick={(event) => selectItem(item, event)}
                                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-tertiary ${
                                        focusedIndex === index ? 'bg-tertiary' : ''
                                    }`}
                                >
                                    <span className="font-caption-highlight text-primary">
                                        {renderHighlightedText(item.symbol)}
                                    </span>
                                    <span className="font-caption text-secondary">
                                        {item.kind === 'index' ? 'Chỉ số' : item.stock.exchange}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </form>
        </div>
    );
};
