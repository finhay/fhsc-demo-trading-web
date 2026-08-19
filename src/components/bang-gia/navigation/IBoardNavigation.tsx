'use client';

import { useEffect, useMemo, useRef } from 'react';

import { RiFullscreenExitLine, RiFullscreenLine } from 'react-icons/ri';

import { IBoardExchangeTab } from '@/components/bang-gia/navigation/IBoardExchangeTab';
import { DropdownWatchlist } from '@/components/common/feature/DropdownWatchlist';
import { InputSearch } from '@/components/common/feature/InputSearch';
import { DEFAULT_EXCHANGE } from '@/constants/common';
import { PRICE_BOARD_TABS } from '@/constants/iboard';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { useMarketIndexStore } from '@/stores/common/useMarketIndexStore';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';
import { isOwnedWatchlist, useWatchlistStore } from '@/stores/common/useWatchlistStore';
import type { StocksInfoV2Item } from '@/types/datafeed/stock-info';

type IBoardNavigationProps = {
    isIndexSliderVisible: boolean;
    toggleIndexSlider: () => void;
};

export const IBoardNavigation = ({
    isIndexSliderVisible,
    toggleIndexSlider,
}: IBoardNavigationProps) => {
    const { activeSubAccount } = useAuthStore();
    const { exchange, setExchange } = useMarketIndexStore();
    const { selectedSearchStock, setSelectedSearchStock, fetchStockInfo } = useStockInfoStore();
    const { startLoading, stopLoading } = useLoadingStore();
    const { currentWatchList, setCurrentWatchList, fetchOwnedPortfolio } = useWatchlistStore();

    const hasOwned = Boolean(activeSubAccount);
    const isOwnedActive = isOwnedWatchlist(currentWatchList);

    const previousExchangeRef = useRef<string>(exchange);
    const previousWatchListRef = useRef<number | null>(currentWatchList?.id ?? null);

    const tabs = useMemo(() => PRICE_BOARD_TABS, []);

    const handleSelectExchange = (value: string) => {
        setSelectedSearchStock(null);
        setExchange(value);
    };

    const handleSelectOwned = () => {
        fetchOwnedPortfolio();
    };

    const handleSelectSearchStock = async (stock: StocksInfoV2Item) => {
        startLoading();
        try {
            await fetchStockInfo(stock.symbol, true);
        } finally {
            stopLoading();
        }
        setExchange('');
        setCurrentWatchList(null);
    };

    const handleClearSearch = () => {
        setSelectedSearchStock(null);
        setExchange(DEFAULT_EXCHANGE);
    };

    useEffect(() => {
        if (exchange !== previousExchangeRef.current && exchange !== '') {
            previousExchangeRef.current = exchange;
            setCurrentWatchList(null);
        } else if (exchange !== previousExchangeRef.current) {
            previousExchangeRef.current = exchange;
        }
    }, [exchange, setCurrentWatchList]);

    useEffect(() => {
        const currentWatchListId = currentWatchList?.id ?? null;
        if (currentWatchListId !== previousWatchListRef.current && currentWatchListId !== null) {
            previousWatchListRef.current = currentWatchListId;
            setExchange('');
            setSelectedSearchStock(null);
        } else if (currentWatchListId !== previousWatchListRef.current) {
            previousWatchListRef.current = currentWatchListId;
        }
    }, [currentWatchList, setExchange, setSelectedSearchStock]);

    useEffect(() => {
        return () => {
            setSelectedSearchStock(null);
            setExchange(DEFAULT_EXCHANGE);
            setCurrentWatchList(null);
        };
    }, [setSelectedSearchStock, setExchange, setCurrentWatchList]);

    useEffect(() => {
        const hasSearch = Boolean(selectedSearchStock?.symbol);
        const hasWatchlist = Boolean(currentWatchList);
        if (!hasSearch && !hasWatchlist && exchange === '') {
            setExchange(DEFAULT_EXCHANGE);
        }
    }, [exchange, selectedSearchStock, currentWatchList, setExchange]);

    return (
        <>
            <section
                aria-label={'Điều hướng bảng giá'}
                className="flex min-h-0 min-w-0 w-full flex-1 items-center"
            >
                <div className="flex min-h-0 w-full min-w-0 items-center justify-between gap-3">
                    <div className="flex min-h-0 min-w-0 flex-wrap items-center gap-2">
                        <DropdownWatchlist
                            showOwnedOption={hasOwned}
                            isOwnedActive={isOwnedActive}
                            onSelectOwned={handleSelectOwned}
                        />
                        <IBoardExchangeTab
                            tabs={tabs}
                            exchange={exchange}
                            onSelectExchange={handleSelectExchange}
                        />
                        <InputSearch
                            value={selectedSearchStock?.symbol ?? ''}
                            onSelectStock={handleSelectSearchStock}
                            onClear={handleClearSearch}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={toggleIndexSlider}
                        aria-pressed={!isIndexSliderVisible}
                        className="cursor-pointer"
                    >
                        {isIndexSliderVisible ? (
                            <RiFullscreenLine size={20} className="flex-shrink-0 text-primary" />
                        ) : (
                            <RiFullscreenExitLine
                                size={20}
                                className="flex-shrink-0 text-primary"
                            />
                        )}
                    </button>
                </div>
            </section>
        </>
    );
};
