'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useMQTT } from '@/hooks/useMQTT';
import { StockPriceMessage } from '@/proto/stock';
import type { TopNetRealtimeQuote } from '@/types/pages/market';
import { buildStockPriceTopics } from '@/utils/common';
import { mergeTopNetRealtimeQuote } from '@/utils/market/market-flow';

const QUOTE_FLUSH_INTERVAL_MS = 1000;

export const useTopNetRealtimeQuotes = (
    symbols: string[],
    enabled: boolean = true,
): Record<string, TopNetRealtimeQuote> => {
    const [quotes, setQuotes] = useState<Record<string, TopNetRealtimeQuote>>({});
    const quotesRef = useRef<Record<string, TopNetRealtimeQuote>>({});
    const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const symbolKey = useMemo(
        () =>
            Array.from(new Set(symbols.filter(Boolean)))
                .sort()
                .join(','),
        [symbols],
    );

    const topics = useMemo(
        () => (symbolKey ? buildStockPriceTopics(symbolKey.split(',')) : []),
        [symbolKey],
    );

    const handleMQTTMessage = useCallback((_topic: string, message: Buffer) => {
        const stockData = StockPriceMessage.decode(new Uint8Array(message));
        if (!stockData.symbol) return;

        quotesRef.current = {
            ...quotesRef.current,
            [stockData.symbol]: mergeTopNetRealtimeQuote(
                quotesRef.current[stockData.symbol],
                stockData,
            ),
        };

        if (flushTimerRef.current) return;
        flushTimerRef.current = setTimeout(() => {
            flushTimerRef.current = null;
            setQuotes(quotesRef.current);
        }, QUOTE_FLUSH_INTERVAL_MS);
    }, []);

    useEffect(
        () => () => {
            if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
            flushTimerRef.current = null;
        },
        [],
    );

    useMQTT(topics, handleMQTTMessage, enabled && topics.length > 0);

    return quotes;
};
