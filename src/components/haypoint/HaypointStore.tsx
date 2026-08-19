'use client';

import { UIEvent, useCallback, useRef, useState } from 'react';

import { FaLocationDot, FaMagnifyingGlass } from 'react-icons/fa6';

import { Spinner } from '@/components/common/ui/Spinner';
import { useTranslate } from '@/hooks/useTranslate';
import { OfficeItem } from '@/types/reward';
import { isNearScrollBottom } from '@/utils/haypoint';

type Props = {
    offices: OfficeItem[];
    onSearchOffice: (keyword: string) => void;
    onLoadMore: () => void;
    isLoadingMore: boolean;
    hasMore: boolean;
    inputId?: string;
};

export const HaypointStore = ({
    offices,
    onSearchOffice,
    onLoadMore,
    isLoadingMore,
    hasMore,
    inputId = 'store-search',
}: Props) => {
    const trans = useTranslate();

    const [searchQuery, setSearchQuery] = useState('');

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleScroll = useCallback(
        (e: UIEvent<HTMLDivElement>) => {
            if (isNearScrollBottom(e) && hasMore && !isLoadingMore) {
                onLoadMore();
            }
        },
        [hasMore, isLoadingMore, onLoadMore],
    );

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        scrollContainerRef.current?.scrollTo({ top: 0 });
        onSearchOffice(searchQuery);
    };

    return (
        <div className="flex flex-col gap-4 flex-1 min-h-0">
            <header className="flex items-center">
                <h3 className="font-body-3-highlight text-primary">
                    {trans.haypoint.stores_apply}
                </h3>
            </header>
            <form role="search" onSubmit={handleSearch}>
                <label htmlFor={inputId} className="sr-only">
                    {trans.haypoint.search_nearby_stores}
                </label>
                <div className="bg-tertiary flex items-center gap-3 p-3 rounded-xl">
                    <FaMagnifyingGlass
                        size={18}
                        className="text-highlight flex-shrink-0"
                        aria-hidden="true"
                    />
                    <input
                        id={inputId}
                        type="search"
                        placeholder={trans.haypoint.search_nearby_stores}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent font-body-3 text-primary placeholder:text-secondary outline-none flex-1 w-full"
                    />
                </div>
            </form>
            <div
                ref={scrollContainerRef}
                className="scrollbar flex-1 overflow-y-auto"
                onScroll={handleScroll}
            >
                <ul className="flex flex-col gap-4 list-none p-0 m-0">
                    {offices.map((office) => (
                        <li
                            key={`${office.id}-${office.address}`}
                            className="flex items-start gap-3"
                        >
                            <FaLocationDot
                                size={18}
                                className="text-primary flex-shrink-0"
                                aria-hidden="true"
                            />
                            <address className="font-body-3 text-primary not-italic">
                                {office.address}
                            </address>
                        </li>
                    ))}
                </ul>
                <Spinner isLoading={isLoadingMore} isOverlay={false} />
            </div>
        </div>
    );
};
