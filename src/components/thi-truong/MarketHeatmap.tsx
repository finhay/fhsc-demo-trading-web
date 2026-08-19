'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { MarketDot } from '@/components/thi-truong/shared/MarketDot';
import { MarketOutOfSession } from '@/components/thi-truong/shared/MarketOutOfSession';
import { createMarketHeatmapEChartsOptions } from '@/config/market/market-heatmap';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import { useEChartsTooltipAutoHide } from '@/hooks/chart/useEChartsTooltipAutoHide';
import { useMQTT } from '@/hooks/useMQTT';
import { StockPriceMessage } from '@/proto/stock';
import { fetchIndustryPriceChange, fetchSectorStocks } from '@/services/api/datafeed/trading-data';
import { useMarketIndexStore } from '@/stores/common/useMarketIndexStore';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';
import type { HeatmapSector, HeatmapTreemapNode } from '@/types/pages/market';
import { buildStockPriceTopics, isSuccessApi } from '@/utils/common';
import {
    buildEChartsTreemapData,
    filterHeatmapSectors,
    mergeHeatmapStockMqttUpdate,
} from '@/utils/market/market-heatmap';

export const MarketHeatmap = () => {
    const { isPreSession } = useMarketIndexStore();
    const [sectors, setSectors] = useState<HeatmapSector[]>([]);
    const [hierarchicalData, setHierarchicalData] = useState<HeatmapTreemapNode[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const openStockDetail = useStockInfoStore((state) => state.openStockDetail);

    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useEChartsInstance(chartRef, {
        opts: { renderer: 'canvas' },
        shouldInitialize: !isLoading && !isPreSession && sectors.length > 0,
    });
    const sectorsRef = useRef<HeatmapSector[]>(sectors);
    const updateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isChartReady = !isLoading && !isPreSession && sectors.length > 0;

    const hideTooltip = useEChartsTooltipAutoHide(chartRef, chartInstanceRef, {
        enabled: isChartReady,
    });

    const mqttTopics = useMemo(
        () =>
            buildStockPriceTopics(
                sectors.flatMap((sector) => sector.stocks.map((stock) => stock.symbol)),
            ),
        [sectors],
    );

    const chartOptions = useMemo(() => createMarketHeatmapEChartsOptions([]), []);

    const handleMQTTMessage = useCallback((_topic: string, message: Buffer) => {
        const stockData = StockPriceMessage.decode(new Uint8Array(message));
        if (!stockData.symbol) return;

        sectorsRef.current = filterHeatmapSectors(
            sectorsRef.current.map((sector) => ({
                ...sector,
                stocks: sector.stocks.map((stock) =>
                    stock.symbol === stockData.symbol
                        ? mergeHeatmapStockMqttUpdate(stock, stockData)
                        : stock,
                ),
            })),
        );

        if (updateTimerRef.current) return;
        updateTimerRef.current = setTimeout(() => {
            updateTimerRef.current = null;
            setHierarchicalData(buildEChartsTreemapData(sectorsRef.current));
        }, 1000);
    }, []);

    useEffect(() => {
        sectorsRef.current = sectors;
        setHierarchicalData(buildEChartsTreemapData(sectors));
    }, [sectors]);

    const fetchData = async () => {
        setIsLoading(true);
        const { data, error_code } = await fetchIndustryPriceChange();
        if (isSuccessApi(error_code) && data) {
            const industries = data;
            const sectorResults = await Promise.all(
                industries.map((industry) => fetchSectorStocks(industry.sector)),
            );

            const combined: HeatmapSector[] = industries.map((industry, index) => ({
                sector: industry.sector,
                name: industry.name,
                totalValue: industry.total_value ?? 0,
                stocks: isSuccessApi(sectorResults[index].error_code)
                    ? (sectorResults[index].data ?? [])
                    : [],
            }));

            setSectors(filterHeatmapSectors(combined));
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const instance = chartInstanceRef.current;
        if (!instance || !isChartReady) return;

        instance.setOption(chartOptions, { notMerge: true, lazyUpdate: true, silent: true });

        instance.off('click');
        instance.on('click', (params) => {
            const symbol = (params.data as { symbol?: string } | undefined)?.symbol;
            if (!symbol) return;
            hideTooltip();
            openStockDetail(symbol);
        });

        requestAnimationFrame(() => {
            instance.resize();
        });

        return () => {
            instance.off('click');
        };
    }, [chartOptions, chartInstanceRef, isChartReady, hideTooltip, openStockDetail]);

    useEffect(() => {
        const instance = chartInstanceRef.current;
        if (!instance || !isChartReady || hierarchicalData.length === 0) return;

        instance.setOption(
            { series: [{ data: hierarchicalData }] },
            { lazyUpdate: true, silent: true },
        );
    }, [hierarchicalData, chartInstanceRef, isChartReady]);

    useEffect(() => {
        const container = chartRef.current;
        if (!container) return;

        const observer = new ResizeObserver(() => {
            requestAnimationFrame(() => {
                chartInstanceRef.current?.resize();
            });
        });
        observer.observe(container);

        return () => {
            observer.disconnect();
        };
    }, [isLoading, isPreSession, sectors.length]);

    useEffect(
        () => () => {
            if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
            updateTimerRef.current = null;
        },
        [],
    );

    useMQTT(mqttTopics, handleMQTTMessage, mqttTopics.length > 0);

    return (
        <section className="bg-secondary flex min-h-80 flex-1 flex-col gap-3 overflow-hidden rounded-xl p-4 xl:min-h-0">
            <div className="flex shrink-0 items-center justify-between gap-2">
                <h2 className="font-body-2-highlight text-primary flex items-center gap-2">
                    <MarketDot />
                    {'Bản đồ nhiệt'}
                </h2>
            </div>
            <div className="relative min-h-0 w-full flex-1 overflow-hidden">
                {isLoading ? (
                    <div key="skeleton" className="absolute inset-0">
                        <Skeleton />
                    </div>
                ) : isPreSession ? (
                    <div
                        key="out-of-session"
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <MarketOutOfSession />
                    </div>
                ) : sectors.length === 0 ? (
                    <div key="empty" className="absolute inset-0 flex items-center justify-center">
                        <EmptyState />
                    </div>
                ) : (
                    <div key="chart" ref={chartRef} className="absolute inset-0" />
                )}
            </div>
        </section>
    );
};
