'use client';

import { FC } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { StockPriceStep } from '@/components/common/stock-info/chart/StockPriceStep';
import { StockTransaction } from '@/components/common/stock-info/chart/StockTransaction';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';

type Props = {
    onClose?: () => void;
};

export const StockChartPanel: FC<Props> = ({ onClose }) => {
    const router = useRouter();
    const pathname = usePathname();
    const { selectedStock } = useStockInfoStore();

    const isTradePage = pathname === '/giao-dich';
    const showTradeButton = !isTradePage;
    const showFooter = showTradeButton || !!onClose;

    const handleTradeNow = () => {
        if (!selectedStock?.symbol) return;

        router.push(`/giao-dich?symbol=${selectedStock.symbol}`);
    };

    return (
        <div className="flex w-80 shrink-0 flex-col gap-1">
            <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
                <StockPriceStep />
                <StockTransaction />
            </div>
            {showFooter && (
                <div className="flex w-full shrink-0 gap-1">
                    {showTradeButton && (
                        <button
                            type="button"
                            onClick={handleTradeNow}
                            className="flex flex-1 items-center justify-center rounded-full base-highlight px-4 py-2 body-3-highlight text-quaternary"
                        >
                            {'Giao dịch {symbol}'.replace('{symbol}', selectedStock?.symbol ?? '')}
                        </button>
                    )}
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex w-24 shrink-0 items-center justify-center rounded-full base-tertiary px-4 py-2 body-3-highlight text-highlight"
                        >
                            {'Đóng'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
