'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { FaArrowDown, FaArrowUp } from 'react-icons/fa6';

import { createChartMarketIndexMini } from '@/config/market/market-index';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import { useMQTT } from '@/hooks/useMQTT';
import { useTranslate } from '@/hooks/useTranslate';
import { IndexData } from '@/proto/stock';
import { useMarketIndexStore } from '@/stores/common/useMarketIndexStore';
import { getFlashBgBySign, getSessionText } from '@/utils/common';
import { formatNumberVN, formatNumberVNWithUnit } from '@/utils/format';

type Props = {
    selectedIndex: string;
    onClick?: () => void;
};

export const MarketIndexChart = ({ selectedIndex, onClick }: Props) => {
    const trans = useTranslate();
    const { data, updateFromMQTT } = useMarketIndexStore();

    const [indexValueBgClass, setIndexValueBgClass] = useState('');
    const prevIndexValueRef = useRef<number | null>(null);
    const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const indexData = data.find((item) => item?.index === selectedIndex);
    const chartInstanceRef = useEChartsInstance(containerRef, {
        shouldInitialize: !!indexData?.times?.length,
    });

    const indexValue = indexData?.indexValue ?? 0;
    const change = indexData?.change ?? 0;
    const changePercent = indexData?.changePercent ?? 0;
    const statsColorClass =
        changePercent === 0 ? 'text-orange' : changePercent > 0 ? 'text-green' : 'text-red';
    const changeArrow =
        change > 0 ? (
            <FaArrowUp size={12} aria-hidden />
        ) : change < 0 ? (
            <FaArrowDown size={12} aria-hidden />
        ) : null;
    const indexRealtimeTopic = `/index-realtime/${selectedIndex}`;

    const handleIndexMqttMessage = useCallback(
        (_topic: string, message: Buffer) => {
            const indexChange = IndexData.decode(new Uint8Array(message));
            if (indexChange.name !== selectedIndex) return;
            updateFromMQTT(indexChange);
        },
        [selectedIndex, updateFromMQTT],
    );

    useMQTT(indexRealtimeTopic, handleIndexMqttMessage, Boolean(selectedIndex));

    useEffect(() => {
        prevIndexValueRef.current = null;
        if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
        setIndexValueBgClass('');
    }, [selectedIndex]);

    useEffect(() => {
        const prevValue = prevIndexValueRef.current;
        if (prevValue !== null && prevValue !== 0 && indexValue !== prevValue) {
            setIndexValueBgClass(getFlashBgBySign(indexValue - prevValue));

            if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
            flashTimeoutRef.current = setTimeout(() => setIndexValueBgClass(''), 600);
        }
        prevIndexValueRef.current = indexValue;
    }, [indexValue]);

    useEffect(() => {
        return () => {
            if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !indexData?.times?.length) return;

        const options = createChartMarketIndexMini(indexData);
        if (!options) return;

        chartInstanceRef.current?.setOption(options, { lazyUpdate: true });

        requestAnimationFrame(() => {
            chartInstanceRef.current?.resize();
        });
    }, [indexData, chartInstanceRef]);

    useEffect(() => {
        const container = containerRef.current;
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
    }, [chartInstanceRef]);

    return (
        <button
            type="button"
            className="flex w-full cursor-pointer flex-col gap-3 rounded-xl border border-tertiary p-3 text-left transition-colors hover:border-highlight"
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                    <span
                        className={`font-body-2-highlight text-primary w-fit rounded px-1.5 py-0.5 transition-colors duration-1000 ${indexValueBgClass}`}
                    >
                        {formatNumberVN(indexValue, { decimals: 2 })}
                    </span>
                    <div className={`flex items-center gap-1 ${statsColorClass}`}>
                        {changeArrow}
                        <span className="font-body-2">
                            {formatNumberVN(change, { decimals: 2 })}
                        </span>
                        <span className="font-body-2">
                            ({changePercent > 0 ? '+' : ''}
                            {formatNumberVN(changePercent, { decimals: 2 })}%)
                        </span>
                    </div>
                </div>
                <span className="font-caption text-primary bg-disabled flex items-center justify-center rounded-full px-3 py-1">
                    {getSessionText(indexData?.sessionInExchange || '', trans)}
                </span>
            </div>
            <div className="flex h-48 w-full items-center justify-center">
                <div ref={containerRef} className="h-full w-full" />
            </div>
            <div className="font-caption flex items-center justify-between text-secondary">
                <div>
                    <span>{trans.market.index.vol_label} </span>
                    <span className="text-primary">
                        {formatNumberVN(indexData?.allQuantity || 0, { decimals: 0 })}{' '}
                        {trans.market.index.shares_unit}
                    </span>
                </div>
                <div>
                    <span>{trans.market.index.val_label} </span>
                    <span className="text-primary">
                        {formatNumberVNWithUnit(indexData?.allValue || 0)}
                    </span>
                </div>
            </div>
        </button>
    );
};
