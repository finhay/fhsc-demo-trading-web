'use client';

import { UIEvent, useEffect, useRef, useState } from 'react';

import { FaMagnifyingGlass } from 'react-icons/fa6';

import { Skeleton } from '@/components/common/ui/Skeleton';
import { Spinner } from '@/components/common/ui/Spinner';
import { HaypointCard } from '@/components/haypoint/brand/HaypointCard';
import { HaypointEmptyState } from '@/components/haypoint/brand/HaypointEmptyState';
import { useClickOutside } from '@/hooks/lib/useClickOutside';
import { useTranslate } from '@/hooks/useTranslate';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { useBrandStore } from '@/stores/haypoint/useBrandStore';
import { useExchangeFlowStore } from '@/stores/haypoint/useExchangeFlowStore';
import { isNearScrollBottom } from '@/utils/haypoint';

export const HaypointCatalog = () => {
    const trans = useTranslate();

    const [brandSearchQuery, setBrandSearchQuery] = useState<string>('');
    const [isSearchExpanded, setIsSearchExpanded] = useState<boolean>(false);

    const {
        categories,
        selectedCategory,
        brands,
        isLoadingCategories,
        isLoadingBrands,
        isLoadingMore,
        hasMore,
        selectCategory,
        searchBrands,
        loadMoreBrands,
    } = useBrandStore();
    const { startLoading, stopLoading } = useLoadingStore();
    const { openExchangeFlow } = useExchangeFlowStore();

    const handleOpenExchangeFlow = async (brandId: string) => {
        startLoading();
        try {
            await openExchangeFlow(brandId);
        } finally {
            stopLoading();
        }
    };

    const scrollContainerRef = useRef<HTMLUListElement>(null);
    const searchRef = useClickOutside<HTMLDivElement>(
        () => setIsSearchExpanded(false),
        isSearchExpanded,
    );

    const handleScroll = (e: UIEvent<HTMLUListElement>) => {
        if (isNearScrollBottom(e) && hasMore && !isLoadingMore) {
            loadMoreBrands();
        }
    };

    const handleToggleSearch = () => {
        if (isSearchExpanded) {
            scrollContainerRef.current?.scrollTo({ top: 0 });
            searchBrands(brandSearchQuery);
        } else {
            setIsSearchExpanded(true);
        }
    };

    const handleKeyDownSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            scrollContainerRef.current?.scrollTo({ top: 0 });
            searchBrands(brandSearchQuery);
        }
    };

    const handleCategoryClick = (categoryId: string) => {
        setBrandSearchQuery('');
        scrollContainerRef.current?.scrollTo({ top: 0 });
        selectCategory(categoryId);
    };

    useEffect(() => {
        scrollContainerRef.current?.scrollTo({ top: 0 });
    }, [brands]);

    return (
        <section
            className="h-[calc(100vh-116px)] bg-secondary flex flex-col gap-6 rounded-xl py-6 px-4"
            aria-labelledby="all-brands-title"
        >
            <h2 id="all-brands-title" className="font-body-1-highlight text-primary">
                {trans.haypoint.all_brands}
            </h2>
            <nav
                aria-label={trans.haypoint.brand_filter_search}
                className="relative flex items-center justify-between gap-4"
            >
                {isLoadingCategories ? (
                    <Skeleton />
                ) : (
                    <>
                        <div className="flex items-center gap-3" role="tablist">
                            {(categories ?? []).map((category) => (
                                <button
                                    key={`${category.id}-${category.name}`}
                                    role="tab"
                                    className={`rounded-full py-1 px-4 ${
                                        selectedCategory === category.id
                                            ? 'text-primary font-body-3-highlight bg-tertiary'
                                            : 'bg-transparent font-body-3 text-secondary'
                                    }`}
                                    onClick={() => handleCategoryClick(category.id)}
                                    aria-selected={selectedCategory === category.id}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                        <div
                            ref={searchRef}
                            className={`absolute top-0 right-0 bg-tertiary px-3 rounded-xl flex items-center py-2 flex-shrink-0 transition-all duration-500 ease-in-out overflow-hidden ${
                                isSearchExpanded ? 'gap-3 w-64' : 'gap-0 w-11'
                            }`}
                        >
                            <button
                                onClick={handleToggleSearch}
                                className="flex-shrink-0 bg-transparent border-none p-0 cursor-pointer"
                                aria-label={
                                    isSearchExpanded
                                        ? trans.haypoint.search
                                        : trans.haypoint.open_search
                                }
                                type="button"
                            >
                                <FaMagnifyingGlass
                                    size={18}
                                    className="text-secondary"
                                    aria-hidden="true"
                                />
                            </button>
                            <input
                                type="search"
                                placeholder={trans.haypoint.search_voucher_here}
                                value={brandSearchQuery}
                                onChange={(e) => setBrandSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDownSearch}
                                className={`font-body-3 text-primary bg-transparent border-none outline-none transition-all duration-500 ease-in-out ${
                                    isSearchExpanded
                                        ? 'max-w-full opacity-100 flex-1'
                                        : 'max-w-0 opacity-0'
                                }`}
                                aria-label={trans.haypoint.search_voucher_here}
                                name="search-voucher"
                            />
                        </div>
                    </>
                )}
            </nav>
            <ul
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className={`scrollbar grid ${isLoadingCategories || isLoadingBrands || !brands?.length ? 'grid-cols-1 flex-1' : 'grid-cols-5'} gap-6 list-none min-h-0 overflow-y-auto`}
            >
                {isLoadingCategories || isLoadingBrands ? (
                    <Skeleton />
                ) : !brands?.length ? (
                    <HaypointEmptyState
                        title={trans.haypoint.no_brands}
                        imageSize={80}
                        className="h-auto w-full"
                    />
                ) : (
                    <>
                        {(brands ?? []).map((brand) => (
                            <li key={`${brand.id}-${brand.name}`}>
                                <HaypointCard brand={brand} onClick={handleOpenExchangeFlow} />
                            </li>
                        ))}
                        {isLoadingMore && (
                            <li className="col-span-5 flex justify-center py-4">
                                <Spinner isLoading={isLoadingMore} isOverlay={false} />
                            </li>
                        )}
                    </>
                )}
            </ul>
        </section>
    );
};
