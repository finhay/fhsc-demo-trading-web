'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { TRADE_LITERAL, TRADE_TOPIC } from '@/constants/trading';
import { useMQTT } from '@/hooks/useMQTT';
import { fetchStockTransactionLog } from '@/services/api/datafeed/stock-info';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';
import { TradeTransactionDisplayItem } from '@/types/pages/trading';
import { isSuccessApi } from '@/utils/common';
import { formatNumberVN } from '@/utils/format';

export const StockTransaction = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<TradeTransactionDisplayItem[]>([]);
    const { selectedStock } = useStockInfoStore();
    const pendingTransactionsRef = useRef<TradeTransactionDisplayItem[]>([]);
    const rafFlushRef = useRef<number | null>(null);

    const flushTransactions = useCallback(() => {
        rafFlushRef.current = null;
        if (pendingTransactionsRef.current.length === 0) return;
        const batched = pendingTransactionsRef.current.reverse();
        pendingTransactionsRef.current = [];
        setData((prevData) => [...batched, ...prevData].slice(0, 200));
    }, []);

    const scheduleTransactionFlush = useCallback(() => {
        if (rafFlushRef.current != null) return;
        rafFlushRef.current = requestAnimationFrame(() => {
            flushTransactions();
        });
    }, [flushTransactions]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const { error_code, data } = await fetchStockTransactionLog(
                selectedStock?.symbol ?? '',
            );
            if (isSuccessApi(error_code)) {
                setData(
                    data.content.map((item) => ({
                        sequence: item.sequence,
                        time: item.time,
                        side: item.side,
                        match_volume: item.match_volume,
                        match_price: item.match_price,
                        change_value: item.change_value ?? 0,
                    })),
                );
            }
        } catch {
        } finally {
            setIsLoading(false);
        }
    };

    const handleMQTTMessage = (_topic: string, message: Buffer) => {
        try {
            const raw = JSON.parse(message.toString());
            const newTransaction: TradeTransactionDisplayItem = {
                sequence: raw.sequence,
                time: raw.time,
                side: raw.side,
                match_volume: raw.match_volume,
                match_price: raw.match_price,
                change_value: raw.change_value ?? 0,
            };
            pendingTransactionsRef.current.push(newTransaction);
            scheduleTransactionFlush();
        } catch (error) {
            console.error('Failed to parse MQTT message:', error);
        }
    };

    useMQTT(
        `${TRADE_TOPIC.TRANSLOG_PREFIX}/${selectedStock?.symbol}`,
        handleMQTTMessage,
        !!selectedStock?.symbol,
    );

    useEffect(() => {
        if (selectedStock?.symbol) {
            fetchData();
        }
    }, [selectedStock?.symbol]);

    useEffect(() => {
        return () => {
            if (rafFlushRef.current != null) {
                cancelAnimationFrame(rafFlushRef.current);
            }
            pendingTransactionsRef.current = [];
        };
    }, []);

    return (
        <section
            className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden rounded-xl base-secondary p-3"
            aria-label={'Giao dịch toàn thị trường'}
        >
            <h3 className="shrink-0 body-4-highlight text-primary">
                {'Giao dịch toàn thị trường'}
            </h3>

            {isLoading ? (
                <div className="min-h-0 flex-1">
                    <Skeleton />
                </div>
            ) : data.length === 0 ? (
                <div className="min-h-0 flex-1">
                    <EmptyState />
                </div>
            ) : (
                <div className="flex min-h-0 flex-1 flex-col gap-3">
                    <div className="flex w-full shrink-0 body-5 text-secondary">
                        <span className="w-20 shrink-0">{'Thời gian'}</span>
                        <span className="min-w-0 flex-1">{'M/B'}</span>
                        <span className="w-20 shrink-0 text-right">{'KL'}</span>
                        <span className="w-16 shrink-0 text-right">{'Giá'}</span>
                    </div>
                    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
                        {data.map((transaction, index) => (
                            <div
                                key={`${transaction.sequence}-${index}`}
                                className="flex w-full shrink-0 body-5"
                            >
                                <span className="w-20 shrink-0 text-secondary">
                                    {transaction.time}
                                </span>
                                <span
                                    className={`min-w-0 flex-1 ${
                                        transaction.side === TRADE_LITERAL.MARKET_SIDE_BUY
                                            ? 'text-green'
                                            : 'text-red'
                                    }`}
                                >
                                    {transaction.side}
                                </span>
                                <span className="w-20 shrink-0 text-right text-primary">
                                    {formatNumberVN(transaction.match_volume, { decimals: 0 })}
                                </span>
                                <span className="w-16 shrink-0 text-right text-primary">
                                    {formatNumberVN(transaction.match_price / 1000)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};
