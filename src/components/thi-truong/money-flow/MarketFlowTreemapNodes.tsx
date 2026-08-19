'use client';

import { useCallback, useEffect, useRef } from 'react';

import type * as echarts from 'echarts';

import { createMarketFlowTreemapOptions } from '@/config/market/market-flow';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import { useEChartsTooltipAutoHide } from '@/hooks/chart/useEChartsTooltipAutoHide';
import { useTranslate } from '@/hooks/useTranslate';
import type {
    TradingFlowTopNetSide,
    TradingFlowTreemapCell,
    TradingFlowTreemapColorMode,
} from '@/types/pages/market';

type Props = {
    side: TradingFlowTopNetSide;
    items: TradingFlowTreemapCell[];
    colorMode?: TradingFlowTreemapColorMode;
    onCellClick?: (key: string) => void;
};

export const MarketFlowTreemapNodes = ({ side, items, colorMode, onCellClick }: Props) => {
    const trans = useTranslate();
    const chartRef = useRef<HTMLDivElement>(null);
    const onCellClickRef = useRef(onCellClick);
    const optionRef = useRef<echarts.EChartsOption | null>(null);
    const renderedSizeRef = useRef({ width: 0, height: 0 });
    const chartInstanceRef = useEChartsInstance(chartRef, {
        opts: { renderer: 'canvas' },
        shouldInitialize: items.length > 0,
    });
    const hideTooltip = useEChartsTooltipAutoHide(chartRef, chartInstanceRef, {
        enabled: items.length > 0,
    });

    const renderTreemap = useCallback(
        (isForced: boolean) => {
            const instance = chartInstanceRef.current;
            const container = chartRef.current;
            const option = optionRef.current;
            if (!instance || instance.isDisposed() || !container || !option) return;

            const width = Math.round(container.clientWidth);
            const height = Math.round(container.clientHeight);
            if (width === 0 || height === 0) return;

            const isSameSize =
                width === renderedSizeRef.current.width &&
                height === renderedSizeRef.current.height;
            if (isSameSize && !isForced) return;

            if (instance.getWidth() !== width || instance.getHeight() !== height) {
                instance.resize();
            }

            instance.setOption(option, { notMerge: true, lazyUpdate: false, silent: true });
            renderedSizeRef.current = { width, height };
        },
        [chartInstanceRef],
    );

    useEffect(() => {
        onCellClickRef.current = onCellClick;
    }, [onCellClick]);

    useEffect(() => {
        if (items.length === 0) return;

        optionRef.current = createMarketFlowTreemapOptions(items, side, trans, {
            clickable: !!onCellClickRef.current,
            colorMode,
        });

        hideTooltip();
        renderTreemap(true);
    }, [items, side, colorMode, trans, hideTooltip, renderTreemap]);

    useEffect(() => {
        const container = chartRef.current;
        if (!container || items.length === 0) return;

        const observer = new ResizeObserver(() => {
            renderTreemap(false);
        });
        observer.observe(container);

        return () => {
            observer.disconnect();
        };
    }, [items.length, renderTreemap]);

    useEffect(() => {
        const instance = chartInstanceRef.current;
        if (!instance) return;

        instance.off('click');
        instance.on('click', (params) => {
            const key = (params.data as { key?: string } | undefined)?.key;
            if (!key) return;
            hideTooltip();
            onCellClickRef.current?.(key);
        });

        return () => {
            instance.off('click');
        };
    }, [chartInstanceRef, items.length, hideTooltip]);

    return (
        <div ref={chartRef} className={`h-full w-full ${onCellClick ? 'cursor-pointer' : ''}`} />
    );
};
