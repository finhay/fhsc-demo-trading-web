'use client';

import { useState } from 'react';

import Image from 'next/image';

import { Dialog } from '@/components/common/ui/Dialog';
import { MarketMacroUs } from '@/components/thi-truong/macro/us/MarketMacroUs';
import { MarketMacroVn } from '@/components/thi-truong/macro/vn/MarketMacroVn';
import { EMPTY_MACRO_US_RAW, MACRO_COUNTRY_TABS } from '@/constants/market';
import { useTranslate } from '@/hooks/useTranslate';
import { fetchMacroIndicator } from '@/services/api/datafeed/finance';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import type { MacroCountryTab, MacroUsRawState, MacroVnRawState } from '@/types/pages/market';
import { unwrap } from '@/utils/market/market-shared';

type Props = {
    onClose: () => void;
    raw: MacroVnRawState;
};

export const MarketMacroModal = ({ onClose, raw }: Props) => {
    const trans = useTranslate();
    const detail = trans.market.macro.detail;
    const [tab, setTab] = useState<MacroCountryTab>(MACRO_COUNTRY_TABS[0].value);
    const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
    const [usData, setUsData] = useState<MacroUsRawState>(EMPTY_MACRO_US_RAW);
    const [hasFetchedUs, setHasFetchedUs] = useState(false);
    const { startLoading, stopLoading } = useLoadingStore();
    const tabLabels: Record<MacroCountryTab, string> = {
        vn: detail.tab_vn,
        us: detail.tab_us,
    };

    const handleTabChange = async (next: MacroCountryTab) => {
        if (next === tab) return;

        if (next !== 'us' || hasFetchedUs) {
            setTab(next);
            return;
        }

        startLoading();
        try {
            await fetchUsData();
        } finally {
            setTab(next);
            stopLoading();
        }
    };

    const measureIndicator = (node: HTMLButtonElement) => {
        setIndicator((prev) =>
            prev && prev.left === node.offsetLeft && prev.width === node.offsetWidth
                ? prev
                : { left: node.offsetLeft, width: node.offsetWidth },
        );
    };

    const fetchUsData = async () => {
        const [pceRes, corePceRes, nfpRes, unemploymentRes] = await Promise.allSettled([
            fetchMacroIndicator('PCE', 'US'),
            fetchMacroIndicator('CORE_PCE', 'US'),
            fetchMacroIndicator('NFP', 'US'),
            fetchMacroIndicator('UNEMPLOYMENT_RATE', 'US'),
        ]);

        setUsData({
            pce: unwrap(pceRes) ?? [],
            corePce: unwrap(corePceRes) ?? [],
            nfp: unwrap(nfpRes) ?? [],
            unemployment: unwrap(unemploymentRes) ?? [],
        });
        setHasFetchedUs(true);
    };

    return (
        <Dialog
            title={trans.market.macro.heading}
            onClose={onClose}
            maxWidth="max-w-7xl"
            maxHeight="h-[90vh]"
            panelClassName="bg-primary gap-4 p-4"
            bodyClassName="flex min-h-0 flex-1 flex-col gap-4"
        >
            <div className="relative flex shrink-0 items-center gap-3">
                {indicator && (
                    <span
                        aria-hidden
                        className="bg-secondary absolute top-0 h-full rounded-full transition-all duration-300 ease-out"
                        style={{ left: indicator.left, width: indicator.width }}
                    />
                )}
                {MACRO_COUNTRY_TABS.map(({ value, flag }) => {
                    const isActive = tab === value;
                    return (
                        <button
                            key={value}
                            ref={(node) => {
                                if (node && isActive) measureIndicator(node);
                            }}
                            type="button"
                            onClick={() => handleTabChange(value)}
                            className={`font-body-1-highlight relative z-10 flex items-center gap-2 rounded-full px-6 py-2 transition-colors ${
                                isActive ? 'text-primary' : 'text-secondary opacity-80'
                            }`}
                        >
                            {isActive && (
                                <Image
                                    src={flag}
                                    alt=""
                                    width={24}
                                    height={24}
                                    className="size-6 rounded-xl object-cover"
                                />
                            )}
                            {tabLabels[value]}
                        </button>
                    );
                })}
            </div>
            <div className="scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
                {tab === 'vn' ? <MarketMacroVn raw={raw} /> : <MarketMacroUs data={usData} />}
            </div>
        </Dialog>
    );
};
