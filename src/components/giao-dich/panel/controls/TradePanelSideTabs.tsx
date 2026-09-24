'use client';

import { TRADE_LITERAL } from '@/constants/trading';

type Props = {
    activeSide: string;
    onChange: (side: string) => void;
};

export const TradePanelSideTabs = ({ activeSide, onChange }: Props) => {
    return (
        <header className="flex w-full shrink-0 flex-col items-start">
            <div className="flex w-full items-center gap-1 rounded-full base-secondary p-1">
                <button
                    type="button"
                    role="tab"
                    aria-selected={activeSide === TRADE_LITERAL.BUY}
                    onClick={() => onChange(TRADE_LITERAL.BUY)}
                    className={`flex flex-1 items-center justify-center rounded-full px-1 py-1.5 body-5-highlight transition-colors ${
                        activeSide === TRADE_LITERAL.BUY
                            ? 'bg-green/20 text-green'
                            : 'bg-transparent text-secondary'
                    }`}
                >
                    {'Mua'}
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={activeSide === TRADE_LITERAL.SELL}
                    onClick={() => onChange(TRADE_LITERAL.SELL)}
                    className={`flex flex-1 items-center justify-center rounded-full px-1 py-1.5 body-5-highlight transition-colors ${
                        activeSide === TRADE_LITERAL.SELL
                            ? 'bg-red/20 text-red'
                            : 'bg-transparent text-secondary'
                    }`}
                >
                    {'Bán'}
                </button>
            </div>
        </header>
    );
};
