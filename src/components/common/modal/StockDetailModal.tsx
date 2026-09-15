'use client';

import { FC, useEffect } from 'react';

import { StockSection } from '@/components/common/stock-info/StockSection';
import { StockChartPanel } from '@/components/common/stock-info/chart/StockChartPanel';
import { Dialog } from '@/components/common/ui/Dialog';
import { TAB_INFORMATION, TRADE_PAGE_ARIA } from '@/constants/trading';
import { useTradingStore } from '@/stores/trading/useTradingStore';

type Props = {
    onClose: () => void;
};

export const StockDetailModal: FC<Props> = ({ onClose }) => {
    const { setSelectedTabInfor } = useTradingStore();

    useEffect(() => {
        return () => {
            setSelectedTabInfor(TAB_INFORMATION[0].key);
        };
    }, [setSelectedTabInfor]);

    return (
        <Dialog
            onClose={onClose}
            maxWidth="max-w-7xl"
            maxHeight="h-[90vh]"
            panelClassName="base-primary gap-1 p-1"
            bodyClassName="flex min-h-0 flex-1 overflow-hidden"
        >
            <div className="flex min-h-0 flex-1 gap-1 overflow-hidden">
                <StockSection
                    className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl base-secondary"
                    hideChartPanel
                    hideFullscreenToggle
                    enableIndexSearch
                />
                <aside
                    className="flex h-full shrink-0 overflow-hidden"
                    aria-label={TRADE_PAGE_ARIA.PRICE_TRANSACTION}
                >
                    <StockChartPanel onClose={onClose} />
                </aside>
            </div>
        </Dialog>
    );
};
