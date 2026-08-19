'use client';

import { useCallback, useMemo, useState } from 'react';

import { ChartTradingView } from '@/components/common/feature/ChartTradingView';
import { Dialog } from '@/components/common/ui/Dialog';
import { MarketIndexBreadth } from '@/components/thi-truong/index/MarketIndexBreadth';
import { MarketIndexBubble } from '@/components/thi-truong/index/MarketIndexBubble';
import { MarketIndexCompare } from '@/components/thi-truong/index/modal/MarketIndexCompare';
import { MarketIndexHeader } from '@/components/thi-truong/index/modal/MarketIndexHeader';
import { MarketIndexInvestment } from '@/components/thi-truong/index/modal/MarketIndexInvestment';
import { MARKET_INDEX_LIST } from '@/constants/market';
import { useMQTT } from '@/hooks/useMQTT';
import { useTranslate } from '@/hooks/useTranslate';
import { IndexData } from '@/proto/stock';
import { useMarketIndexStore } from '@/stores/common/useMarketIndexStore';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';

type Props = {
    onClose: () => void;
};

export const MarketDetailModal = ({ onClose }: Props) => {
    const trans = useTranslate();
    const { updateFromMQTT } = useMarketIndexStore();
    const { detailIndex, openIndexDetail, openStockDetail } = useStockInfoStore();
    const selectedIndex = detailIndex ?? '';
    const [activeTab, setActiveTab] = useState<string>('chart');

    const compareIndices = useMemo(
        () => MARKET_INDEX_LIST.filter((index) => index !== selectedIndex),
        [selectedIndex],
    );

    const tabs: { key: string; label: string }[] = [
        { key: 'chart', label: trans.market.index.detail.tabs.chart },
        { key: 'overview', label: trans.market.index.detail.tabs.overview },
    ];

    const handleIndexMqttMessage = useCallback(
        (_topic: string, message: Buffer) => {
            const indexChange = IndexData.decode(new Uint8Array(message));
            if (indexChange.name !== selectedIndex) return;
            updateFromMQTT(indexChange);
        },
        [selectedIndex, updateFromMQTT],
    );

    useMQTT(`/index-realtime/${selectedIndex}`, handleIndexMqttMessage, Boolean(selectedIndex));

    return (
        <Dialog
            onClose={onClose}
            maxWidth="max-w-7xl"
            maxHeight="h-[90vh]"
            panelClassName="bg-secondary gap-6 p-3"
            bodyClassName="flex min-h-0 flex-1 flex-col gap-5 overflow-hidden"
        >
            <div className="flex shrink-0 flex-col gap-5">
                <MarketIndexHeader
                    selectedIndex={selectedIndex}
                    onSelectIndex={openIndexDetail}
                    onSelectStock={openStockDetail}
                    onClose={onClose}
                />
                <nav className="flex items-center border-b border-tertiary">
                    <ul role="tablist" className="flex list-none items-center gap-4">
                        {tabs.map(({ key, label }) => (
                            <li
                                key={key}
                                role="presentation"
                                className={`transition-colors cursor-pointer ${
                                    activeTab === key
                                        ? 'font-caption-highlight text-primary'
                                        : 'font-caption text-secondary'
                                }`}
                                onClick={() => setActiveTab(key)}
                            >
                                {label}
                                <span
                                    className={`mt-1 block h-0.5 w-full bg-current ${
                                        activeTab === key ? '' : 'opacity-0'
                                    }`}
                                />
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
            {activeTab === 'chart' ? (
                <div className="min-h-0 flex-1 overflow-hidden">
                    <ChartTradingView symbol={selectedIndex} />
                </div>
            ) : (
                <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden">
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        {compareIndices.map((index) => (
                            <MarketIndexCompare key={index} index={index} />
                        ))}
                    </div>
                    <div className="grid gap-3 lg:grid-cols-2">
                        <div className="min-w-0 rounded-2xl border border-tertiary p-4">
                            <MarketIndexBubble selectedIndex={selectedIndex} />
                        </div>
                        <div className="min-w-0 rounded-2xl border border-tertiary p-4">
                            <MarketIndexBreadth selectedIndex={selectedIndex} />
                        </div>
                    </div>
                    <div className="rounded-2xl border border-tertiary p-4">
                        <MarketIndexInvestment />
                    </div>
                </div>
            )}
        </Dialog>
    );
};
