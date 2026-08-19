'use client';

import { useEffect, useRef } from 'react';

import type { MarketPortfolioRow, MarketPortfolioTheme } from '@/types/pages/market';
import { getChangeColor } from '@/utils/common';
import { formatNumberVN } from '@/utils/format';

type Props = {
    rows: MarketPortfolioRow[];
    activeSymbol: string;
    theme: MarketPortfolioTheme;
    onSelect: (symbol: string) => void;
};

export const MarketWatchlistStockList = ({ rows, activeSymbol, theme, onSelect }: Props) => {
    const activeItemRef = useRef<HTMLLIElement>(null);
    const isFirstRenderRef = useRef(true);

    useEffect(() => {
        if (isFirstRenderRef.current) {
            isFirstRenderRef.current = false;
            return;
        }
        activeItemRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, [activeSymbol]);

    return (
        <ul className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden">
            {rows.map((row) => {
                const isActive = row.symbol === activeSymbol;
                const isUp = row.change >= 0;
                const changeColorClass = getChangeColor(row.change);
                const activeBorderClass = theme === 'green' ? 'border-highlight' : 'border-red';

                return (
                    <li key={row.symbol} ref={isActive ? activeItemRef : undefined}>
                        <button
                            type="button"
                            onClick={() => onSelect(row.symbol)}
                            aria-pressed={isActive}
                            aria-label={`${row.symbol} ${formatNumberVN(row.price / 1000)}`}
                            className={`flex w-full items-center justify-between rounded-xl border bg-secondary p-3 transition-colors duration-300 ${
                                isActive ? activeBorderClass : 'border-tertiary'
                            }`}
                        >
                            <span className="font-caption-highlight text-primary">
                                {row.symbol}
                            </span>
                            <span className="flex items-center gap-2">
                                <span className={`font-caption ${changeColorClass}`}>
                                    {isUp ? '+' : '-'}
                                    {formatNumberVN(Math.abs(row.change) / 1000)} (
                                    {isUp ? '+' : '-'}
                                    {formatNumberVN(Math.abs(row.changePercent))}%)
                                </span>
                                <span className="font-caption-highlight text-primary">
                                    {formatNumberVN(row.price / 1000)}
                                </span>
                            </span>
                        </button>
                    </li>
                );
            })}
        </ul>
    );
};
