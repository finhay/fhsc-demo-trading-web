'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import * as echarts from 'echarts';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa6';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { createChartGlobalIndexSparkline } from '@/config/market/market-global-index';
import { ASIA_INDICES, GLOBAL_INDEX_TAB, US_INDICES } from '@/constants/market';
import { useEChartsInstances } from '@/hooks/chart/useEChartsInstances';
import { useMQTT } from '@/hooks/useMQTT';
import { useTranslate } from '@/hooks/useTranslate';
import { fetchGlobalIndex } from '@/services/api/datafeed/finance';
import { MQTT_CONFIG } from '@/services/mqtt';
import type { GlobalIndexPoint, GlobalIndexTab } from '@/types/pages/market';
import { getChangeColor, isSuccessApi } from '@/utils/common';
import { formatNumberVN } from '@/utils/format';
import { mapGlobalIndexPoints } from '@/utils/market/market-global-index';
import { getTrendBg, trendFromDelta } from '@/utils/market/market-shared';

export const MarketGlobalIndex = () => {
    const trans = useTranslate();
    const [selectedTab, setSelectedTab] = useState<GlobalIndexTab>(GLOBAL_INDEX_TAB.ASIA);
    const [data, setData] = useState<GlobalIndexPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [flashingIndices, setFlashingIndices] = useState<Map<string, string>>(new Map());
    const lastChangeRef = useRef<Map<string, number>>(new Map());
    const sparklineContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
    const { chartsMapRef, disposeAll } = useEChartsInstances();

    const tabs: { key: GlobalIndexTab; label: string }[] = [
        { key: GLOBAL_INDEX_TAB.ASIA, label: trans.market.global_index.tab_asia },
        { key: GLOBAL_INDEX_TAB.US, label: trans.market.global_index.tab_us },
    ];

    const mqttTopics = useMemo(
        () =>
            (selectedTab === GLOBAL_INDEX_TAB.US ? US_INDICES : ASIA_INDICES).map(
                (indexName) => `stock/market/${selectedTab.toUpperCase()}/MARKET/${indexName}`,
            ),
        [selectedTab],
    );

    const handleMQTTMessage = useCallback((_topic: string, message: Buffer) => {
        const updated: GlobalIndexPoint = JSON.parse(message.toString());
        const prevChange = lastChangeRef.current.get(updated.index);
        const direction = trendFromDelta(updated.change - (prevChange ?? updated.change));
        lastChangeRef.current.set(updated.index, updated.change);

        setData((prev) => prev.map((item) => (item.index === updated.index ? updated : item)));
        setFlashingIndices((prev) => new Map(prev).set(updated.index, direction));
        setTimeout(() => {
            setFlashingIndices((prev) => {
                const next = new Map(prev);
                next.delete(updated.index);
                return next;
            });
        }, 1000);
    }, []);

    useMQTT(mqttTopics, handleMQTTMessage, true, MQTT_CONFIG.BASE_URL_2);

    const fetchData = async (tab: GlobalIndexTab) => {
        setIsLoading(true);
        const { data: response, error_code } = await fetchGlobalIndex(tab.toUpperCase());
        if (isSuccessApi(error_code)) {
            setData(mapGlobalIndexPoints(response.data ?? []));
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData(selectedTab);
    }, [selectedTab]);

    useEffect(() => {
        data.forEach((item, index) => {
            const container = sparklineContainerRefs.current[index];
            if (!container) return;

            const options = createChartGlobalIndexSparkline(item.values, item.change);
            if (!options) return;

            let instance = chartsMapRef.current.get(item.index);
            if (!instance) {
                instance = echarts.init(container, 'vnsc-default');
                chartsMapRef.current.set(item.index, instance);
            }
            instance.setOption(options);

            requestAnimationFrame(() => chartsMapRef.current.get(item.index)?.resize());
        });
    }, [data, chartsMapRef]);

    useEffect(() => () => disposeAll(), [selectedTab, disposeAll]);

    useEffect(() => {
        const observers: ResizeObserver[] = [];

        sparklineContainerRefs.current.forEach((container, index) => {
            if (!container) return;
            const itemIndex = data[index]?.index;
            const observer = new ResizeObserver(() => {
                requestAnimationFrame(() => chartsMapRef.current.get(itemIndex ?? '')?.resize());
            });
            observer.observe(container);
            observers.push(observer);
        });

        return () => {
            observers.forEach((observer) => observer.disconnect());
        };
    }, [data.length, isLoading]);

    return (
        <section className="flex min-h-0 flex-col gap-3">
            <div className="flex gap-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setSelectedTab(tab.key)}
                        className={`font-body-2-highlight transition-colors ${
                            selectedTab === tab.key ? 'text-primary' : 'text-secondary'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="flex h-48 w-full shrink-0">
                {isLoading ? (
                    <Skeleton />
                ) : data.length === 0 ? (
                    <div className="flex h-full w-full items-center justify-center">
                        <EmptyState />
                    </div>
                ) : (
                    <ul className="flex h-full w-full flex-col gap-2 sm:flex-row sm:flex-nowrap">
                        {data.map((item, index) => {
                            const changeColorClass = getChangeColor(item.changePercent);
                            const flashBgClass = getTrendBg(flashingIndices.get(item.index));

                            const changeArrow =
                                item.change > 0 ? (
                                    <FaArrowUp size={12} aria-hidden />
                                ) : item.change < 0 ? (
                                    <FaArrowDown size={12} aria-hidden />
                                ) : null;

                            return (
                                <li
                                    key={item.index}
                                    className={`flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-tertiary transition-colors duration-300 ${flashBgClass}`}
                                >
                                    <div className="flex min-h-0 flex-1 flex-col">
                                        <div className="shrink-0 p-3">
                                            <h3 className="font-caption-highlight text-secondary">
                                                {item.name}
                                            </h3>
                                        </div>
                                        <div className="border-t border-tertiary" />
                                        <div className="flex shrink-0 flex-col p-2">
                                            <span className="font-body-2-highlight text-primary">
                                                {formatNumberVN(item.indexValue)}
                                            </span>
                                            <div
                                                className={`flex items-center gap-0.5 ${changeColorClass}`}
                                            >
                                                {changeArrow}
                                                <span className="font-caption">
                                                    {formatNumberVN(item.change)} (
                                                    {item.changePercent > 0 ? '+' : ''}
                                                    {formatNumberVN(item.changePercent)}%)
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-auto min-h-0 w-full flex-1 px-2 py-2">
                                            <div
                                                ref={(element) => {
                                                    sparklineContainerRefs.current[index] = element;
                                                }}
                                                className="h-full min-h-0 w-full"
                                            />
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </section>
    );
};
