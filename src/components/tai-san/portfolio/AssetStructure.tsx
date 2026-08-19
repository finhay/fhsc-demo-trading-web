'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { createChartPortfolioTreemap } from '@/config/assets';
import { PORTFOLIO_TREEMAP_COLORS } from '@/constants/assets';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import { useEChartsTooltipAutoHide } from '@/hooks/chart/useEChartsTooltipAutoHide';
import { useMQTT } from '@/hooks/useMQTT';
import { StockPriceMessage } from '@/proto/stock';
import { useAssetStore } from '@/stores/assets/useAssetStore';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';
import type { PortfolioTreemapCell } from '@/types/pages/assets';
import { calcPortfolioHoldingQuantity } from '@/utils/assets';
import { buildStockPriceTopics } from '@/utils/common';

export const AssetStructure = () => {
    const { portfolio, isPortfolioLoading } = useAssetStore();
    const openStockDetail = useStockInfoStore((state) => state.openStockDetail);
    const chartRef = useRef<HTMLDivElement>(null);
    const [livePrices, setLivePrices] = useState<Record<string, number>>({});
    const pendingMqttRef = useRef<Map<string, StockPriceMessage>>(new Map());
    const rafMqttRef = useRef<number | null>(null);

    const symbolsKey = useMemo(
        () =>
            portfolio
                .filter((item) => calcPortfolioHoldingQuantity(item) > 0)
                .map((item) => item.symbol)
                .join(','),
        [portfolio],
    );
    const mqttTopics = useMemo(
        () => (symbolsKey ? buildStockPriceTopics(symbolsKey.split(',')) : []),
        [symbolsKey],
    );

    const flushMqttBatch = useCallback(() => {
        rafMqttRef.current = null;
        const batch = new Map(pendingMqttRef.current);
        pendingMqttRef.current.clear();
        if (batch.size === 0) return;
        setLivePrices((prev) => {
            const next = { ...prev };
            batch.forEach((update, symbol) => {
                if (update.price > 0) next[symbol] = update.price;
            });
            return next;
        });
    }, []);

    const scheduleMqttFlush = useCallback(() => {
        if (rafMqttRef.current != null) return;
        rafMqttRef.current = requestAnimationFrame(() => {
            flushMqttBatch();
        });
    }, [flushMqttBatch]);

    const handleMQTTMessage = useCallback(
        (_topic: string, message: Buffer) => {
            const update = StockPriceMessage.decode(new Uint8Array(message));
            if (!update.symbol) return;
            pendingMqttRef.current.set(update.symbol, update);
            scheduleMqttFlush();
        },
        [scheduleMqttFlush],
    );

    useMQTT(mqttTopics, handleMQTTMessage, mqttTopics.length > 0);

    useEffect(() => {
        return () => {
            if (rafMqttRef.current != null) {
                cancelAnimationFrame(rafMqttRef.current);
            }
        };
    }, []);

    const cells = useMemo(() => {
        const withMv = portfolio
            .map((item) => {
                const quantity = calcPortfolioHoldingQuantity(item);
                const price = livePrices[item.symbol] ?? item.basic_price;
                return {
                    symbol: item.symbol,
                    marketValue: quantity * price,
                    pnl: item.pnl_amount ?? 0,
                };
            })
            .filter((item) => item.marketValue > 0);
        const total = withMv.reduce((sum, item) => sum + item.marketValue, 0);
        return withMv.map(
            (item): PortfolioTreemapCell => ({
                name: item.symbol,
                symbol: item.symbol,
                value: item.marketValue,
                percent: total > 0 ? (item.marketValue / total) * 100 : 0,
                itemStyle: {
                    color:
                        item.pnl >= 0 ? PORTFOLIO_TREEMAP_COLORS.up : PORTFOLIO_TREEMAP_COLORS.down,
                },
            }),
        );
    }, [portfolio, livePrices]);

    const hasData = !isPortfolioLoading && cells.length > 0;
    const chartInstanceRef = useEChartsInstance(chartRef, {
        opts: { renderer: 'canvas' },
        shouldInitialize: hasData,
    });
    const hideTooltip = useEChartsTooltipAutoHide(chartRef, chartInstanceRef, {
        enabled: hasData,
    });

    useEffect(() => {
        const instance = chartInstanceRef.current;
        if (!instance || !hasData) return;

        instance.setOption(createChartPortfolioTreemap(cells), { notMerge: true });

        instance.off('click');
        instance.on('click', (params) => {
            const symbol = (params.data as { symbol?: string } | undefined)?.symbol;
            if (!symbol) return;
            hideTooltip();
            openStockDetail(symbol);
        });

        requestAnimationFrame(() => {
            if (!instance.isDisposed()) instance.resize();
        });

        return () => {
            instance.off('click');
        };
    }, [cells, hasData, chartInstanceRef, hideTooltip, openStockDetail]);

    return (
        <section className="flex h-full flex-col gap-3 overflow-hidden rounded-xl bg-secondary p-3">
            <h2 className="shrink-0 font-body-2-highlight text-primary">{'Cấu trúc danh mục'}</h2>
            <div className={`relative w-full ${hasData ? 'min-h-0 flex-1' : 'h-80'}`}>
                <div ref={chartRef} className={`h-full w-full ${hasData ? '' : 'invisible'}`} />
                {isPortfolioLoading ? (
                    <div className="absolute inset-0">
                        <Skeleton />
                    </div>
                ) : cells.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <EmptyState />
                    </div>
                ) : null}
            </div>
        </section>
    );
};
