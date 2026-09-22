'use client';

import { type ReactDebouncerOptions, useDebouncer } from '@tanstack/react-pacer';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import * as echarts from 'echarts';
import { FaArrowDown, FaArrowUp, FaSquare } from 'react-icons/fa6';
import type { Swiper as SwiperClass } from 'swiper';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { createChartMarketIndex } from '@/config/iboard';
import { INDEX_LIST } from '@/constants/common';
import { useEChartsInstances } from '@/hooks/chart/useEChartsInstances';
import { useMQTT } from '@/hooks/useMQTT';
import { IndexData } from '@/proto/stock';
import { useMarketIndexStore } from '@/stores/common/useMarketIndexStore';
import type { IndexRealtime } from '@/types/common';
import { getSessionText } from '@/utils/common';
import { formatNumberVN } from '@/utils/format';

const MARKET_INDEX_IDS = Array.isArray(INDEX_LIST) ? INDEX_LIST : [];
const INDEX_REALTIME_TOPICS = MARKET_INDEX_IDS.map((id) => `/index-realtime/${id}`);

const createDefaultIndexRealtime = (indexId: string): IndexRealtime => ({
    index: indexId,
    indexValue: 0,
    change: 0,
    changePercent: 0,
    reference: 0,
    sessionInExchange: 'CLOSE',
    name: indexId,
    values: [],
    volumes: [],
    times: [],
    allQuantity: 0,
    allValue: 0,
    advances: 0,
    declines: 0,
    nochanges: 0,
    ceiling: 0,
    floor: 0,
});

export const IBoardChartIndex = () => {
    const [windowWidth, setWindowWidth] = useState(0);

    const swiperRef = useRef<SwiperClass | null>(null);
    const containerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const containerRefCallbacks = useRef<Record<string, (element: HTMLDivElement | null) => void>>(
        {},
    );
    const prevRef = useRef<HTMLButtonElement>(null);
    const nextRef = useRef<HTMLButtonElement>(null);

    const { chartsMapRef } = useEChartsInstances();
    const { data, updateFromMQTT } = useMarketIndexStore();
    const safeData = useMemo(() => (Array.isArray(data) ? data : []), [data]);
    const normalizedData = useMemo(
        () =>
            MARKET_INDEX_IDS.map(
                (indexId) =>
                    safeData.find((item) => item?.index === indexId) ??
                    createDefaultIndexRealtime(indexId),
            ),
        [safeData],
    );
    const chartOptions = useMemo(() => {
        const nextOptions: Record<string, echarts.EChartsOption> = {};
        normalizedData.forEach((item) => {
            const options = createChartMarketIndex(item.index, item);
            if (options) {
                nextOptions[item.index] = options;
            }
        });
        return nextOptions;
    }, [normalizedData]);

    const numberShow = useMemo(() => {
        if (windowWidth >= 1920) return 5;
        if (windowWidth >= 1440) return 4;
        if (windowWidth >= 1024) return 3;
        if (windowWidth >= 768) return 2;
        return 1;
    }, [windowWidth]);

    const handleMQTTMessage = useCallback(
        (_topic: string, message: Buffer) => {
            try {
                const buffer = new Uint8Array(message);
                const indexChange = IndexData.decode(buffer);
                updateFromMQTT(indexChange);
            } catch (error) {
                console.error('Failed to decode index realtime message', error);
            }
        },
        [updateFromMQTT],
    );

    const scheduleChartResize = useCallback(
        (indexId: string) => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    chartsMapRef.current.get(indexId)?.resize();
                });
            });
        },
        [chartsMapRef],
    );

    const resizeAllCharts = useCallback(() => {
        MARKET_INDEX_IDS.forEach((indexId) => {
            if (chartsMapRef.current.has(indexId)) {
                scheduleChartResize(indexId);
            }
        });
    }, [chartsMapRef, scheduleChartResize]);

    const windowResizeDebouncer = useDebouncer(() => setWindowWidth(window.innerWidth), {
        wait: 120,
    } as unknown as ReactDebouncerOptions<() => void>);

    const getContainerRef = useCallback(
        (indexId: string) => {
            if (!containerRefCallbacks.current[indexId]) {
                containerRefCallbacks.current[indexId] = (element: HTMLDivElement | null) => {
                    if (element) {
                        containerRefs.current[indexId] = element;
                        return;
                    }

                    chartsMapRef.current.get(indexId)?.dispose();
                    chartsMapRef.current.delete(indexId);
                    delete containerRefs.current[indexId];
                };
            }
            return containerRefCallbacks.current[indexId];
        },
        [chartsMapRef],
    );

    useEffect(() => {
        setWindowWidth(window.innerWidth);
        const updateSize = () => windowResizeDebouncer.maybeExecute();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, [windowResizeDebouncer]);

    useMQTT(INDEX_REALTIME_TOPICS, handleMQTTMessage);

    useEffect(() => {
        normalizedData.forEach((item) => {
            const indexId = item.index;
            const container = containerRefs.current[indexId];
            const options = chartOptions[indexId];
            if (!container || !options || !item.times?.length) return;

            let chart = chartsMapRef.current.get(indexId);
            const isNewChart = !chart;
            if (!chart) {
                chart = echarts.init(container, 'vnsc-default');
                chartsMapRef.current.set(indexId, chart);
            }
            chart.setOption(options, { notMerge: isNewChart, lazyUpdate: true });

            scheduleChartResize(indexId);
        });
    }, [chartOptions, normalizedData, chartsMapRef, scheduleChartResize]);

    useEffect(() => {
        const observers: ResizeObserver[] = [];

        normalizedData.forEach((item) => {
            const indexId = item.index;
            const container = containerRefs.current[indexId];
            if (!container) return;
            const resizeObserver = new ResizeObserver(() => {
                scheduleChartResize(indexId);
            });
            resizeObserver.observe(container);
            observers.push(resizeObserver);
        });

        return () => {
            observers.forEach((observer) => observer.disconnect());
        };
    }, [chartOptions, normalizedData, scheduleChartResize]);

    return (
        <section aria-label="Chỉ số thị trường" className="flex flex-col w-full h-40">
            <div className="flex relative w-full pointer-events-auto h-full">
                <Swiper
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                        resizeAllCharts();
                    }}
                    onResize={resizeAllCharts}
                    slidesPerView={numberShow}
                    freeMode={true}
                    watchOverflow={true}
                    observer={true}
                    observeParents={true}
                    className="w-full h-full"
                    navigation={{
                        prevEl: prevRef.current,
                        nextEl: nextRef.current,
                    }}
                    onBeforeInit={(swiper) => {
                        if (
                            typeof swiper.params.navigation !== 'boolean' &&
                            swiper.params.navigation
                        ) {
                            swiper.params.navigation.prevEl = prevRef.current;
                            swiper.params.navigation.nextEl = nextRef.current;
                        }
                    }}
                    modules={[Navigation]}
                    wrapperClass="relative flex"
                >
                    {normalizedData.map((itemState, index) => {
                        const {
                            index: indexId,
                            sessionInExchange,
                            allQuantity,
                            change,
                            indexValue,
                            changePercent,
                            allValue,
                            advances,
                            declines,
                            nochanges,
                            ceiling,
                            floor,
                        } = itemState;

                        return (
                            <SwiperSlide
                                className="!absolute left-0 px-1"
                                style={{
                                    transform: `translate(${index * 100}%, 0)`,
                                }}
                                key={indexId}
                            >
                                <article className="flex flex-col h-full gap-1 base-secondary rounded-xl p-2">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between text-primary">
                                            <div className="body-5-highlight">{indexId}</div>
                                            <div className="body-5 bg-disabled rounded-full flex items-center justify-center px-2 py-0.5">
                                                {getSessionText(sessionInExchange || 'CLOSE')}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-primary body-5">
                                            <div className="whitespace-nowrap">
                                                {'KLGD:'}{' '}
                                                {formatNumberVN(allQuantity || 0, { decimals: 0 })}{' '}
                                                {'CP'}
                                            </div>
                                            <div
                                                className={`flex items-center body-5-highlight gap-1 ${change >= 0 ? 'text-green' : 'text-red'}`}
                                            >
                                                {change >= 0 ? (
                                                    <FaArrowUp size={12} />
                                                ) : (
                                                    <FaArrowDown size={12} />
                                                )}
                                                {formatNumberVN(Math.abs(indexValue || 0))}
                                                {` (${formatNumberVN(Math.abs(change || 0))}/${formatNumberVN(Math.abs(changePercent || 0))}%)`}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-primary body-5">
                                            <div className="whitespace-nowrap">
                                                {'GTGD:'}{' '}
                                                {formatNumberVN(allValue / 1_000_000_000, {
                                                    decimals: 2,
                                                    trimTrailingZeros: false,
                                                })}{' '}
                                                {'Tỷ'}
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="flex items-center gap-1">
                                                    <FaArrowUp size={12} className="text-green" />
                                                    <div className="flex gap-1">
                                                        <span className="text-green">
                                                            {formatNumberVN(advances || 0, {
                                                                decimals: 0,
                                                            })}
                                                        </span>
                                                        <span className="text-purple">
                                                            {`(${ceiling ?? 0})`}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <FaSquare size={12} className="text-orange" />
                                                    <span className="text-orange">
                                                        {formatNumberVN(nochanges || 0, {
                                                            decimals: 0,
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <FaArrowDown size={12} className="text-red" />
                                                    <div className="flex gap-1">
                                                        <span className="text-red">
                                                            {formatNumberVN(declines || 0, {
                                                                decimals: 0,
                                                            })}
                                                        </span>
                                                        <span className="text-blue">
                                                            {`(${floor || 0})`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {chartOptions[indexId] && itemState.times?.length > 0 && (
                                        <div
                                            ref={getContainerRef(indexId)}
                                            className="w-full h-20 overflow-hidden"
                                        />
                                    )}
                                </article>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            </div>
        </section>
    );
};
