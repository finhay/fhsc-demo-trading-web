'use client';

import { useState } from 'react';

import { MarketIndexBreadth } from '@/components/thi-truong/index/MarketIndexBreadth';
import { MarketIndexBubble } from '@/components/thi-truong/index/MarketIndexBubble';
import { MarketIndexChart } from '@/components/thi-truong/index/MarketIndexChart';
import { MarketIndexTab } from '@/components/thi-truong/index/MarketIndexTab';
import { MarketInvestmentPerformance } from '@/components/thi-truong/index/MarketInvestmentPerformance';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';

export const MarketIndex = () => {
    const [selectedIndex, setSelectedIndex] = useState('VNINDEX');
    const { openIndexDetail } = useStockInfoStore();

    return (
        <section className="bg-secondary flex h-full min-h-0 flex-col gap-4 rounded-2xl p-4">
            <MarketIndexTab selectedIndex={selectedIndex} onSelect={setSelectedIndex} />
            <MarketIndexChart
                selectedIndex={selectedIndex}
                onClick={() => openIndexDetail(selectedIndex)}
            />
            <MarketIndexBubble selectedIndex={selectedIndex} />
            <div className="h-px w-full bg-tertiary" aria-hidden="true" />
            <MarketIndexBreadth selectedIndex={selectedIndex} />
            <div className="h-px w-full bg-tertiary" aria-hidden="true" />
            <MarketInvestmentPerformance />
        </section>
    );
};
