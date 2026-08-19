'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { InputSearch } from '@/components/common/feature/InputSearch';
import { Tooltip } from '@/components/common/ui/Tooltip';
import { useMQTT } from '@/hooks/useMQTT';
import { StockPriceMessage } from '@/proto/stock';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';
import type { SymbolInfoRealtimeSnapshot, SymbolInfoStatItem } from '@/types/pages/stock-info';
import { formatNumberVN } from '@/utils/format';
import { getSymbolInfoPriceColor } from '@/utils/stock-info';

type Props = {
    enableIndexSearch?: boolean;
};

export const StockInfo = ({ enableIndexSearch = false }: Props) => {
    const { selectedStock, fetchStockInfo, openIndexDetail } = useStockInfoStore();

    const [realtimeData, setRealtimeData] = useState<SymbolInfoRealtimeSnapshot>({
        price: selectedStock?.price ?? 0,
        changePercent: selectedStock?.changePercent ?? 0,
        floor: selectedStock?.floor ?? 0,
        ceiling: selectedStock?.ceiling ?? 0,
        reference: selectedStock?.reference ?? 0,
        high: selectedStock?.high ?? 0,
        low: selectedStock?.low ?? 0,
        average: selectedStock?.average ?? 0,
    });
    const pendingRealtimeRef = useRef<Partial<SymbolInfoRealtimeSnapshot> | null>(null);
    const rafRef = useRef<number | null>(null);

    const symbol = selectedStock?.symbol ?? '';

    const flushRealtimeUpdate = useCallback(() => {
        rafRef.current = null;
        const pending = pendingRealtimeRef.current;
        pendingRealtimeRef.current = null;
        if (!pending) return;
        setRealtimeData((prev) => ({ ...prev, ...pending }));
    }, []);

    const scheduleRealtimeFlush = useCallback(() => {
        if (rafRef.current != null) return;
        rafRef.current = requestAnimationFrame(() => {
            flushRealtimeUpdate();
        });
    }, [flushRealtimeUpdate]);

    const priceColor = getSymbolInfoPriceColor(realtimeData.price, realtimeData);

    const stats: SymbolInfoStatItem[] = useMemo(
        () => [
            {
                label: 'Sàn',
                value: realtimeData.floor,
                ddClassName: 'font-caption text-blue',
            },
            {
                label: 'TC',
                value: realtimeData.reference,
                ddClassName: 'font-caption text-orange',
            },
            {
                label: 'Trần',
                value: realtimeData.ceiling,
                ddClassName: 'font-caption text-purple',
            },
            {
                label: 'Thấp',
                value: realtimeData.low,
                ddClassName: `font-caption ${getSymbolInfoPriceColor(realtimeData.low, realtimeData)}`,
            },
            {
                label: 'TB',
                value: realtimeData.average,
                ddClassName: `font-caption ${getSymbolInfoPriceColor(realtimeData.average, realtimeData)}`,
            },
            {
                label: 'Cao',
                value: realtimeData.high,
                ddClassName: `font-caption ${getSymbolInfoPriceColor(realtimeData.high, realtimeData)}`,
            },
        ],
        [realtimeData],
    );

    useEffect(() => {
        if (!selectedStock) return;
        setRealtimeData({
            price: selectedStock.price ?? 0,
            changePercent: selectedStock.changePercent ?? 0,
            floor: selectedStock.floor ?? 0,
            ceiling: selectedStock.ceiling ?? 0,
            reference: selectedStock.reference ?? 0,
            high: selectedStock.high ?? 0,
            low: selectedStock.low ?? 0,
            average: selectedStock.average ?? 0,
        });
    }, [selectedStock]);

    useMQTT(
        `/stock-price/${symbol}`,
        (_topic, message) => {
            const buffer = new Uint8Array(message);
            const update = StockPriceMessage.decode(buffer);
            pendingRealtimeRef.current = {
                price: update.price ?? 0,
                changePercent: update.changePercent ?? 0,
                floor: update.floor ?? 0,
                ceiling: update.ceiling ?? 0,
                reference: update.reference ?? 0,
                high: update.high ?? 0,
                low: update.low ?? 0,
                average: update.medium ?? 0,
            };
            scheduleRealtimeFlush();
        },
        !!symbol,
    );

    useEffect(() => {
        return () => {
            if (rafRef.current != null) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, []);

    if (!selectedStock || selectedStock.price == null) return null;

    const companyName = selectedStock.name ?? '';

    return (
        <div className="flex min-w-0 items-center gap-12">
            <div className="flex w-fit max-w-full shrink-0 flex-col gap-2 justify-center">
                <div className="flex items-center gap-3">
                    <InputSearch
                        value={symbol}
                        includeIndices={enableIndexSearch}
                        onSelectIndex={openIndexDetail}
                        onSelectStock={async (stock) => {
                            await fetchStockInfo(stock.symbol);
                        }}
                        variant="pill"
                        className="w-auto"
                        inputClassName="font-body-3-highlight w-28"
                    />
                    <div className={`flex items-center gap-1.5 whitespace-nowrap ${priceColor}`}>
                        <span className="font-body-1-highlight">
                            {formatNumberVN(realtimeData.price / 1000)}
                        </span>
                        <span className="font-body-3">
                            {realtimeData.changePercent > 0 ? '+' : ''}
                            {formatNumberVN(realtimeData.changePercent)}%
                        </span>
                    </div>
                </div>
                <Tooltip content={companyName} placement="bottom" className="block w-0 min-w-full">
                    <p className="truncate font-caption text-secondary">{companyName}</p>
                </Tooltip>
            </div>
            <div className="grid grid-cols-3 gap-x-3.5 gap-y-2">
                {stats.map((item) => (
                    <div key={item.label} className="flex w-20 gap-1">
                        <span className="font-caption text-secondary">{item.label}</span>
                        <span className={item.ddClassName}>
                            {formatNumberVN(item.value / 1000)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
