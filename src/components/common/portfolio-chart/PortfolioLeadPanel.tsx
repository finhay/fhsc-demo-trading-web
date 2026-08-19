'use client';

import { FaArrowDown, FaArrowUp } from 'react-icons/fa6';

import { PortfolioDonutChart } from '@/components/common/portfolio-chart/PortfolioDonutChart';
import { PORTFOLIO_THEME_STYLES } from '@/constants/market';
import type { MarketPortfolioChartItem, MarketPortfolioTheme } from '@/types/pages/market';
import { formatPercentVN } from '@/utils/format';

type Props = {
    items: MarketPortfolioChartItem[];
    activeSymbol: string;
    theme: MarketPortfolioTheme;
    onSelect: (symbol: string) => void;
    impactPercent: number;
    weightPercent: number;
    heading: string;
    variant?: 'card' | 'plain';
    className?: string;
};

export const PortfolioLeadPanel = ({
    items,
    activeSymbol,
    theme,
    onSelect,
    impactPercent,
    weightPercent,
    heading,
    variant = 'card',
    className = '',
}: Props) => {
    const themeStyle = PORTFOLIO_THEME_STYLES[theme];
    const isUp = impactPercent >= 0;
    const isCard = variant === 'card';

    return (
        <div
            className={`relative flex flex-col items-center overflow-hidden ${
                isCard ? 'min-h-60 flex-1 rounded-xl border' : 'h-full w-full'
            } ${className}`}
            style={
                isCard
                    ? {
                          borderColor: themeStyle.border,
                          transition: 'border-color 500ms ease',
                      }
                    : undefined
            }
        >
            {isCard && (
                <>
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-500"
                        style={{ opacity: theme === 'green' ? 1 : 0 }}
                    >
                        {PORTFOLIO_THEME_STYLES.green.glows.map((glow, index) => (
                            <div
                                key={`green-glow-${index}`}
                                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                                style={{
                                    left: glow.left,
                                    top: glow.top,
                                    width: glow.width,
                                    height: glow.height,
                                    background: glow.color,
                                    filter: 'blur(66px)',
                                }}
                            />
                        ))}
                    </div>
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-500"
                        style={{ opacity: theme === 'red' ? 1 : 0 }}
                    >
                        {PORTFOLIO_THEME_STYLES.red.glows.map((glow, index) => (
                            <div
                                key={`red-glow-${index}`}
                                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                                style={{
                                    left: glow.left,
                                    top: glow.top,
                                    width: glow.width,
                                    height: glow.height,
                                    background: glow.color,
                                    filter: 'blur(66px)',
                                }}
                            />
                        ))}
                    </div>
                </>
            )}
            <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-between pt-3">
                <div className="flex flex-col items-center gap-1">
                    <span className="font-body-3 text-secondary">{heading}</span>
                    <div className="flex items-center justify-center gap-2">
                        <div className="flex items-center gap-1">
                            <span className="font-body-3 text-secondary">{'Tác động:'}</span>
                            <span
                                className={`inline-flex items-center gap-0.5 font-body-3 ${
                                    isUp ? 'text-green' : 'text-red'
                                }`}
                            >
                                {isUp ? (
                                    <FaArrowUp size={12} aria-hidden />
                                ) : (
                                    <FaArrowDown size={12} aria-hidden />
                                )}
                                {formatPercentVN(Math.abs(impactPercent))}
                            </span>
                        </div>
                        <span className="font-body-3 text-secondary">
                            {'Tỷ trọng:'}{' '}
                            <span className="text-primary">{formatPercentVN(weightPercent)}</span>
                        </span>
                    </div>
                </div>
                <PortfolioDonutChart
                    items={items}
                    activeSymbol={activeSymbol}
                    theme={theme}
                    onSelect={onSelect}
                />
            </div>
        </div>
    );
};
