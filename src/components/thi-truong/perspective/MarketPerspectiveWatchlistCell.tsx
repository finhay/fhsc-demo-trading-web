'use client';

import { useMemo } from 'react';

import { IoHeart, IoHeartOutline } from 'react-icons/io5';

import { useTranslate } from '@/hooks/useTranslate';
import {
    getOrderedWatchlistSymbols,
    isOwnedWatchlist,
    useWatchlistStore,
} from '@/stores/common/useWatchlistStore';
import type { TopStockPriceChangeItem } from '@/types/datafeed/trading-data';
import { makeWatchlistItem } from '@/utils/common';

export const MarketPerspectiveWatchlistCell = ({ stock }: { stock: TopStockPriceChangeItem }) => {
    const trans = useTranslate();
    const { currentWatchList, addStockToWatchlist, removeStockFromWatchlist } = useWatchlistStore();

    const isWatchlisted = useMemo(
        () =>
            currentWatchList && !isOwnedWatchlist(currentWatchList)
                ? getOrderedWatchlistSymbols(currentWatchList).includes(stock.symbol)
                : false,
        [currentWatchList, stock.symbol],
    );

    const handleToggleWatchlist = async () => {
        if (isWatchlisted) {
            await removeStockFromWatchlist(stock.symbol);
            return;
        }

        await addStockToWatchlist(
            makeWatchlistItem({
                symbol: stock.symbol,
                name: stock.name,
                price: stock.price,
                change: stock.change,
                changePercent: stock.changePercent,
                reference: stock.reference,
                ceiling: stock.ceiling,
                floor: stock.floor,
            }),
        );
    };

    return (
        <button
            type="button"
            aria-label={
                isWatchlisted
                    ? trans.market.perspective.aria_remove
                    : trans.market.perspective.aria_add
            }
            onClick={(e) => {
                e.stopPropagation();
                handleToggleWatchlist();
            }}
            className="shrink-0 px-1 py-1"
        >
            {isWatchlisted ? (
                <IoHeart size={18} className="text-green" />
            ) : (
                <IoHeartOutline size={18} className="text-tertiary" />
            )}
        </button>
    );
};
