'use client';

import { useMemo, useState } from 'react';

import Image from 'next/image';

import { RiVipCrownFill } from 'react-icons/ri';

import {
    FUND_PLANET_IMAGES,
    FUND_PLANET_SLOTS,
    FUND_UNIVERSE_TAB,
    FUND_UNIVERSE_TABS,
} from '@/constants/market';
import { useTranslate } from '@/hooks/useTranslate';
import type {
    FundCertificateItem,
    FundTopFundFlowItem,
    FundTopGrowthItem,
    FundUniverseTab,
} from '@/types/pages/fund';
import {
    buildFundImageMap,
    buildFundUniversePlanets,
    formatFundMoneyCompact,
    formatFundPercent,
    getFundValueColor,
} from '@/utils/market/market-fund';

type Props = {
    certificates: FundCertificateItem[];
    topInvestor: FundTopGrowthItem[];
    topAum: FundTopGrowthItem[];
    topFundFlow: FundTopFundFlowItem[];
    onSelectFund: (fundName: string) => void;
};

export const MarketFundUniverse = ({
    certificates,
    topInvestor,
    topAum,
    topFundFlow,
    onSelectFund,
}: Props) => {
    const trans = useTranslate();
    const t = trans.market.assets.fund_modal;
    const [tab, setTab] = useState<FundUniverseTab>(FUND_UNIVERSE_TAB.SHORT_TERM);
    const imageMap = useMemo(() => buildFundImageMap(certificates), [certificates]);
    const planets = useMemo(
        () =>
            buildFundUniversePlanets(tab, certificates, topInvestor, topAum, topFundFlow, imageMap),
        [tab, certificates, topInvestor, topAum, topFundFlow, imageMap],
    );

    return (
        <section className="relative flex w-full flex-col gap-3 overflow-visible">
            <div className="flex flex-col gap-4">
                <h3 className="font-heading-4 text-primary">{t.universe_heading}</h3>
                <div className="scrollbar flex gap-3 overflow-x-auto pb-1">
                    {FUND_UNIVERSE_TABS.map((key) => {
                        const isActive = tab === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setTab(key)}
                                className={`shrink-0 rounded-full border px-4 py-1.5 transition-colors ${
                                    isActive
                                        ? 'border-purple bg-secondary font-body-3-highlight text-primary'
                                        : 'border-quaternary bg-secondary font-body-3 text-secondary'
                                }`}
                            >
                                {t.universe_tabs[key]}
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="relative h-96 w-full overflow-visible">
                {planets.map((item, index) => {
                    const slot = FUND_PLANET_SLOTS[index];
                    if (!slot) return null;
                    const displayValue =
                        item.valueKind === 'money'
                            ? formatFundMoneyCompact(item.value)
                            : formatFundPercent(item.value, { withSign: false, decimals: 1 });
                    const valueColor = getFundValueColor(item.value);

                    return (
                        <div
                            key={`${tab}-${item.fundName}`}
                            className="absolute flex w-24 -translate-x-1/2 flex-col items-center gap-2"
                            style={{ left: slot.left, top: slot.top }}
                        >
                            <div
                                className="animate-bubbleIn flex flex-col items-center gap-2"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex flex-col items-center gap-1">
                                    {index === 0 && (
                                        <RiVipCrownFill
                                            size={16}
                                            className="text-yellow shrink-0"
                                            aria-hidden
                                        />
                                    )}
                                    <span className="font-body-3 text-secondary">
                                        {item.fundName}
                                    </span>
                                    <span className={`font-body-3-highlight ${valueColor}`}>
                                        {displayValue}
                                    </span>
                                </div>
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => onSelectFund(item.fundName)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            onSelectFund(item.fundName);
                                        }
                                    }}
                                    className="relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-full"
                                >
                                    <Image
                                        src={FUND_PLANET_IMAGES[index]}
                                        alt=""
                                        width={80}
                                        height={80}
                                        className="h-20 w-20 rounded-full object-cover"
                                        aria-hidden
                                    />
                                    {item.imageUrl ? (
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.fundName}
                                            width={80}
                                            height={80}
                                            className="absolute inset-0 h-20 w-20 rounded-full object-cover opacity-60"
                                        />
                                    ) : null}
                                    <div
                                        aria-hidden
                                        className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_12px_4px_0_rgba(255,255,255,0.25)]"
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <p className="font-caption text-tertiary">{t.source_fiinpro}</p>
        </section>
    );
};
