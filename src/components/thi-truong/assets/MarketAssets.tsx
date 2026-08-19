'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Image from 'next/image';

import { AiFillGolden } from 'react-icons/ai';
import { FaChevronRight } from 'react-icons/fa';
import { GiOilDrum } from 'react-icons/gi';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { MarketFundModal } from '@/components/thi-truong/assets/fund/MarketFundModal';
import { MarketGoldModal } from '@/components/thi-truong/assets/gold/MarketGoldModal';
import { MarketDot } from '@/components/thi-truong/shared/MarketDot';
import { AUTH_MODE } from '@/constants/auth';
import {
    FUND_TYPE_STOCK_FUND,
    GLOBAL_GOLD_INDEX,
    METAL_CHART_DEFAULT_DAYS,
    PROFIT_PERIOD_ONE_YEAR,
} from '@/constants/market';
import { useMQTT } from '@/hooks/useMQTT';
import { useTranslate } from '@/hooks/useTranslate';
import {
    fetchCryptoTopTrending,
    fetchGold,
    fetchGoldChart,
    fetchMetalProviders,
    fetchOil,
    fetchSilver,
    fetchSilverChart,
} from '@/services/api/datafeed/finance';
import { MQTT_CONFIG } from '@/services/mqtt';
import { useAuthFlowStore } from '@/stores/auth/useAuthFlowStore';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { useMarketFundStore } from '@/stores/fund/useMarketFundStore';
import type {
    CryptoItem,
    GoldChartItem,
    GoldItem,
    MetalProviderItem,
    OilItem,
    SilverChartItem,
    SilverItem,
} from '@/types/datafeed/finance';
import { getChangeColor, isSuccessApi } from '@/utils/common';
import { formatNumberVN } from '@/utils/format';
import { getProfitByPeriod } from '@/utils/market/market-fund';
import { getTrendBg, trendFromDelta } from '@/utils/market/market-shared';

export const MarketAssets = () => {
    const trans = useTranslate();
    const [isGoldLoading, setIsGoldLoading] = useState(true);
    const [isOilLoading, setIsOilLoading] = useState(true);
    const [isCryptoLoading, setIsCryptoLoading] = useState(true);
    const [isFundLoading, setIsFundLoading] = useState(true);
    const [isGoldSilverOpen, setIsGoldSilverOpen] = useState(false);
    const { profile } = useAuthStore();
    const { openAuthDialog } = useAuthFlowStore();
    const { startLoading, stopLoading } = useLoadingStore();
    const {
        isOpen: isFundOpen,
        openSummary,
        openDetail,
        certificates: fundCertificates,
        fetchCertificates: fetchFundCertificates,
    } = useMarketFundStore();
    const [goldItems, setGoldItems] = useState<GoldItem[]>([]);

    const [oilItems, setOilItems] = useState<OilItem[]>([]);

    const [cryptoItems, setCryptoItems] = useState<CryptoItem[]>([]);

    const [silverItems, setSilverItems] = useState<SilverItem[]>([]);
    const [metalProviders, setMetalProviders] = useState<MetalProviderItem[]>([]);
    const [goldChartItems, setGoldChartItems] = useState<GoldChartItem[]>([]);
    const [silverChartItems, setSilverChartItems] = useState<SilverChartItem[]>([]);

    const [flashingCryptos, setFlashingCryptos] = useState<Map<string, string>>(new Map());
    const lastPriceRef = useRef<Map<string, number>>(new Map());

    const fundItems = useMemo(
        () =>
            fundCertificates
                .filter((item) => item.type === FUND_TYPE_STOCK_FUND)
                .filter((item) => getProfitByPeriod(item, PROFIT_PERIOD_ONE_YEAR) != null)
                .sort(
                    (a, b) =>
                        (getProfitByPeriod(b, PROFIT_PERIOD_ONE_YEAR) ?? 0) -
                        (getProfitByPeriod(a, PROFIT_PERIOD_ONE_YEAR) ?? 0),
                )
                .slice(0, 5),
        [fundCertificates],
    );

    const goldSjc = useMemo(
        () => goldItems.find((item) => item.provider === 'SJC') ?? null,
        [goldItems],
    );
    const goldGlobal = useMemo(
        () => goldItems.find((item) => item.index === GLOBAL_GOLD_INDEX) ?? null,
        [goldItems],
    );

    const sjcPct = goldSjc?.sell_value_change_percent ?? 0;
    const sjcColorClass = getChangeColor(sjcPct);
    const sjcSign = sjcPct > 0 ? '+' : sjcPct < 0 ? '-' : '';

    const globalPct = goldGlobal?.change_percent ?? 0;
    const globalColorClass = getChangeColor(globalPct);
    const globalSign = globalPct > 0 ? '+' : globalPct < 0 ? '-' : '';

    const mqttTopics = useMemo(
        () => cryptoItems.map((item) => `/financial-data/cryptos/${item.symbol}`),
        [cryptoItems],
    );

    const handleCryptoMQTTMessage = useCallback((_topic: string, message: Buffer) => {
        const updatedItem = JSON.parse(message.toString()) as CryptoItem;
        if (!updatedItem?.symbol) return;
        const prevPrice = lastPriceRef.current.get(updatedItem.symbol);
        const direction = trendFromDelta(updatedItem.price - (prevPrice ?? updatedItem.price));
        lastPriceRef.current.set(updatedItem.symbol, updatedItem.price);

        setCryptoItems((prevItems) =>
            prevItems.map((item) =>
                item.symbol === updatedItem.symbol ? { ...item, ...updatedItem } : item,
            ),
        );
        setFlashingCryptos((prev) => new Map(prev).set(updatedItem.symbol, direction));
        setTimeout(() => {
            setFlashingCryptos((prev) => {
                const next = new Map(prev);
                next.delete(updatedItem.symbol);
                return next;
            });
        }, 1000);
    }, []);

    useMQTT(mqttTopics, handleCryptoMQTTMessage, mqttTopics.length > 0, MQTT_CONFIG.BASE_URL_2);

    const handleOpenFundDetail = (fundName: string) => {
        if (!profile) {
            openAuthDialog(AUTH_MODE.LOGIN);
            return;
        }
        openDetail(fundName);
    };

    const handleOpenGoldModal = async () => {
        startLoading();
        try {
            const [silverRes, providersRes, goldChartRes, silverChartRes] = await Promise.all([
                fetchSilver(),
                fetchMetalProviders(),
                fetchGoldChart(METAL_CHART_DEFAULT_DAYS),
                fetchSilverChart(METAL_CHART_DEFAULT_DAYS),
            ]);

            setSilverItems(isSuccessApi(silverRes.error_code) ? (silverRes.data ?? []) : []);
            setMetalProviders(
                isSuccessApi(providersRes.error_code) ? (providersRes.data ?? []) : [],
            );
            setGoldChartItems(
                isSuccessApi(goldChartRes.error_code) ? (goldChartRes.data ?? []) : [],
            );
            setSilverChartItems(
                isSuccessApi(silverChartRes.error_code) ? (silverChartRes.data ?? []) : [],
            );
        } catch {
            setSilverItems([]);
            setMetalProviders([]);
            setGoldChartItems([]);
            setSilverChartItems([]);
        } finally {
            setIsGoldSilverOpen(true);
            stopLoading();
        }
    };

    const fetchGoldData = async () => {
        setIsGoldLoading(true);
        const { data, error_code } = await fetchGold();
        if (isSuccessApi(error_code)) {
            setGoldItems(data ?? []);
        }
        setIsGoldLoading(false);
    };

    const fetchOilData = async () => {
        setIsOilLoading(true);
        const { data, error_code } = await fetchOil();
        if (isSuccessApi(error_code)) {
            setOilItems(data ?? []);
        }
        setIsOilLoading(false);
    };

    const fetchCryptoData = async () => {
        setIsCryptoLoading(true);
        const { data, error_code } = await fetchCryptoTopTrending();
        if (isSuccessApi(error_code)) {
            setCryptoItems(data ?? []);
        }
        setIsCryptoLoading(false);
    };

    const fetchFundData = async () => {
        setIsFundLoading(true);
        await fetchFundCertificates();
        setIsFundLoading(false);
    };

    useEffect(() => {
        fetchGoldData();
        fetchOilData();
        fetchCryptoData();
        fetchFundData();
    }, []);

    const renderGoldBody = () => {
        if (isGoldLoading) {
            return <Skeleton />;
        }
        if (!goldSjc && !goldGlobal) {
            return (
                <div className="flex h-full w-full items-center justify-center">
                    <span className="font-caption text-tertiary">
                        {trans.market.assets.no_data}
                    </span>
                </div>
            );
        }
        return (
            <ul className="flex h-full flex-col justify-center gap-3 overflow-hidden">
                {goldSjc && (
                    <li className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="shrink-0">
                                <AiFillGolden size={28} className="text-yellow" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="font-body-3-highlight text-primary">
                                    {trans.market.assets.gold_sjc}
                                </span>
                                <span className="font-caption text-tertiary">
                                    {trans.market.assets.unit_mil_tael}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                            <span className="font-body-3-highlight text-primary">
                                {goldSjc.sell_value
                                    ? formatNumberVN(goldSjc.sell_value / 1000, {
                                          decimals: 2,
                                      })
                                    : '--'}
                            </span>
                            {goldSjc.sell_value_change_percent != null && (
                                <span className={`font-caption ${sjcColorClass}`}>
                                    {sjcSign}
                                    {formatNumberVN(Math.abs(goldSjc.sell_value_change_percent), {
                                        decimals: 2,
                                    })}
                                    %
                                </span>
                            )}
                        </div>
                    </li>
                )}
                {goldSjc && goldGlobal && (
                    <li aria-hidden="true" className="border-t border-tertiary" />
                )}
                {goldGlobal && (
                    <li className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="shrink-0">
                                <AiFillGolden size={28} className="text-yellow" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="font-body-3-highlight text-primary">
                                    {trans.market.assets.gold_global}
                                </span>
                                <span className="font-caption text-tertiary">
                                    {trans.market.assets.unit_usd_oz}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                            <span className="font-body-3-highlight text-primary">
                                {goldGlobal.usd_value
                                    ? formatNumberVN(goldGlobal.usd_value, {
                                          decimals: 2,
                                      })
                                    : '--'}
                            </span>
                            {goldGlobal.change_percent != null && (
                                <span className={`font-caption ${globalColorClass}`}>
                                    {globalSign}
                                    {formatNumberVN(Math.abs(goldGlobal.change_percent), {
                                        decimals: 2,
                                    })}
                                    %
                                </span>
                            )}
                        </div>
                    </li>
                )}
            </ul>
        );
    };

    const renderOilBody = () => {
        if (isOilLoading) {
            return <Skeleton />;
        }
        if (oilItems.length === 0) {
            return (
                <div className="flex h-full w-full items-center justify-center">
                    <span className="font-caption text-tertiary">
                        {trans.market.assets.no_data}
                    </span>
                </div>
            );
        }
        return (
            <ul className="flex h-full flex-col justify-center gap-3 overflow-hidden">
                {oilItems.flatMap((item, idx) => {
                    const colorClass = getChangeColor(item.change_percent);
                    const sign = item.change_percent > 0 ? '+' : item.change_percent < 0 ? '-' : '';
                    return [
                        idx > 0 ? (
                            <li
                                key={`oil-divider-${idx}`}
                                aria-hidden="true"
                                className="border-t border-tertiary"
                            />
                        ) : null,
                        <li key={item.index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="shrink-0">
                                    <GiOilDrum size={20} className="text-orange" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-body-3-highlight text-primary">
                                        {item.name}
                                    </span>
                                    <span className="font-caption text-tertiary">
                                        {trans.market.assets.unit_usd_bbl}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-0.5">
                                <span className="font-body-3-highlight text-primary">
                                    {formatNumberVN(item.usd_value, {
                                        decimals: 2,
                                    })}
                                </span>
                                <span className={`font-caption ${colorClass}`}>
                                    {sign}
                                    {formatNumberVN(Math.abs(item.change_percent), {
                                        decimals: 2,
                                    })}
                                    %
                                </span>
                            </div>
                        </li>,
                    ];
                })}
            </ul>
        );
    };

    const renderCryptoBody = () => {
        if (isCryptoLoading) {
            return (
                <div className="h-full w-full">
                    <Skeleton />
                </div>
            );
        }
        if (cryptoItems.length === 0) {
            return (
                <div className="flex h-full w-full items-center justify-center">
                    <EmptyState />
                </div>
            );
        }
        return (
            <div className="h-full overflow-y-auto overflow-x-hidden">
                <ul className="flex flex-col gap-3">
                    {cryptoItems.flatMap((item, idx) => {
                        const colorClass = getChangeColor(item.percent_change_24h);
                        const sign =
                            item.percent_change_24h > 0
                                ? '+'
                                : item.percent_change_24h < 0
                                  ? '-'
                                  : '';
                        return [
                            idx > 0 ? (
                                <li
                                    key={`crypto-divider-${idx}`}
                                    aria-hidden="true"
                                    className="shrink-0 border-t border-tertiary"
                                />
                            ) : null,
                            <li
                                key={item.symbol}
                                className="flex shrink-0 items-center justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    {item.icon_url ? (
                                        <Image
                                            src={item.icon_url}
                                            alt={item.symbol}
                                            width={24}
                                            height={24}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <div className="rounded-full bg-tertiary p-1.5" />
                                    )}
                                    <div className="flex flex-col gap-1">
                                        <span className="font-body-3-highlight text-primary">
                                            {item.name}
                                        </span>
                                        <span className="font-caption uppercase text-tertiary">
                                            USD/{item.symbol}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span
                                        className={`font-body-3-highlight text-primary rounded px-1 transition-colors duration-1000 ${getTrendBg(
                                            flashingCryptos.get(item.symbol),
                                        )}`}
                                    >
                                        {item.formatted_price}
                                    </span>
                                    <span className={`font-caption ${colorClass}`}>
                                        {sign}
                                        {formatNumberVN(Math.abs(item.percent_change_24h), {
                                            decimals: 2,
                                        })}
                                        %
                                    </span>
                                </div>
                            </li>,
                        ];
                    })}
                </ul>
            </div>
        );
    };

    const renderFundBody = () => {
        if (isFundLoading) {
            return (
                <div className="h-full w-full">
                    <Skeleton />
                </div>
            );
        }
        if (fundItems.length === 0) {
            return (
                <div className="flex h-full w-full items-center justify-center">
                    <EmptyState />
                </div>
            );
        }
        return (
            <div className="h-full overflow-y-auto overflow-x-hidden">
                <ul className="flex flex-col gap-3">
                    {fundItems.flatMap((item, idx) => {
                        const profit1y = getProfitByPeriod(item, PROFIT_PERIOD_ONE_YEAR);
                        const colorClass1y = getChangeColor(profit1y ?? 0);
                        return [
                            idx > 0 ? (
                                <li
                                    key={`fund-divider-${idx}`}
                                    aria-hidden="true"
                                    className="shrink-0 border-t border-tertiary"
                                />
                            ) : null,
                            <li
                                key={item.id}
                                role="button"
                                tabIndex={0}
                                className="flex shrink-0 cursor-pointer items-center justify-between"
                                onClick={() => handleOpenFundDetail(item.name)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        handleOpenFundDetail(item.name);
                                    }
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    {item.image_url ? (
                                        <Image
                                            src={item.image_url}
                                            alt={item.name}
                                            width={24}
                                            height={24}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <div className="rounded-full bg-tertiary p-1.5" />
                                    )}
                                    <div className="flex flex-col gap-1">
                                        <span className="font-body-3-highlight text-primary">
                                            {item.name}
                                        </span>
                                        <span className="font-caption uppercase text-tertiary">
                                            {item.fund_company_management_short_name}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    {profit1y != null && (
                                        <span className={`font-body-3-highlight ${colorClass1y}`}>
                                            {profit1y >= 0 ? '+' : '-'}
                                            {formatNumberVN(Math.abs(profit1y), {
                                                decimals: 2,
                                            })}
                                            %
                                        </span>
                                    )}
                                </div>
                            </li>,
                        ];
                    })}
                </ul>
            </div>
        );
    };

    return (
        <>
            <section className="bg-secondary flex min-h-0 flex-col gap-3 overflow-hidden rounded-xl md:flex-1 2xl:flex-none 2xl:overflow-visible">
                <div className="flex shrink-0 items-center justify-between gap-2">
                    <h2 className="font-body-2-highlight text-primary flex items-center gap-2 px-1">
                        <MarketDot alwaysActive />
                        {trans.market.assets.heading}
                    </h2>
                </div>
                <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden 2xl:flex-none 2xl:overflow-visible">
                    <div className="flex shrink-0 flex-col gap-3 md:flex-row md:items-stretch">
                        <section className="bg-secondary flex min-h-0 min-w-0 flex-1 flex-col gap-4 rounded-xl border border-tertiary p-3">
                            <div className="flex shrink-0 items-center justify-between gap-2">
                                <h3 className="font-body-3-highlight text-primary flex items-center gap-2">
                                    {trans.market.assets.gold_heading}
                                </h3>
                                <FaChevronRight
                                    size={14}
                                    className="cursor-pointer text-primary shrink-0"
                                    onClick={() => handleOpenGoldModal()}
                                />
                            </div>
                            <div className="h-32 w-full">{renderGoldBody()}</div>
                        </section>
                        <section className="bg-secondary flex min-h-0 min-w-0 flex-1 flex-col gap-4 rounded-xl border border-tertiary p-3">
                            <div className="flex shrink-0 items-center justify-between gap-2">
                                <h3 className="font-body-3-highlight text-primary flex items-center gap-2">
                                    {trans.market.assets.oil_heading}
                                </h3>
                            </div>
                            <div className="h-32 w-full">{renderOilBody()}</div>
                        </section>
                    </div>
                    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden md:flex-row md:items-stretch 2xl:flex-none 2xl:overflow-visible">
                        <section className="bg-secondary flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden rounded-xl border border-tertiary p-3 2xl:overflow-visible">
                            <div className="flex shrink-0 items-center justify-between gap-2">
                                <h3 className="font-body-3-highlight text-primary flex items-center gap-2">
                                    {trans.market.assets.crypto_heading}
                                </h3>
                            </div>
                            <div className="min-h-96 w-full flex-1 overflow-hidden lg:min-h-0 2xl:h-96 2xl:flex-none 2xl:shrink-0">
                                {renderCryptoBody()}
                            </div>
                        </section>
                        <section className="bg-secondary flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden rounded-xl border border-tertiary p-3 2xl:overflow-visible">
                            <div className="flex shrink-0 items-center justify-between gap-2">
                                <h3 className="font-body-3-highlight text-primary flex items-center gap-2">
                                    {trans.market.assets.fund_heading}
                                </h3>
                                <FaChevronRight
                                    size={14}
                                    className="cursor-pointer text-primary shrink-0"
                                    onClick={() => openSummary()}
                                />
                            </div>
                            <div className="min-h-96 w-full flex-1 overflow-hidden lg:min-h-0 2xl:h-96 2xl:flex-none 2xl:shrink-0">
                                {renderFundBody()}
                            </div>
                        </section>
                    </div>
                </div>
            </section>
            {isGoldSilverOpen && (
                <MarketGoldModal
                    onClose={() => setIsGoldSilverOpen(false)}
                    goldItems={goldItems}
                    silverItems={silverItems}
                    providers={metalProviders}
                    goldChartItems={goldChartItems}
                    silverChartItems={silverChartItems}
                />
            )}
            {isFundOpen && <MarketFundModal certificates={fundCertificates} />}
        </>
    );
};
