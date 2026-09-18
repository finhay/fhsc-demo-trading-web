'use client';

import { useCallback, useMemo } from 'react';

import { INDEX_LIST } from '@/constants/common';
import { useMQTT } from '@/hooks/useMQTT';
import { IndexData } from '@/proto/stock';
import { useMarketIndexStore } from '@/stores/common/useMarketIndexStore';
import type { IndexRealtime } from '@/types/common';
import { formatNumberVN } from '@/utils/format';

const INDEX_REALTIME_TOPICS = INDEX_LIST.map((id) => `/index-realtime/${id}`);

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

export const MarketIndexTicker = () => {
    const { data, updateFromMQTT } = useMarketIndexStore();
    const normalizedData = useMemo(
        () =>
            INDEX_LIST.map(
                (indexId) =>
                    data.find((item) => item?.index === indexId) ??
                    createDefaultIndexRealtime(indexId),
            ),
        [data],
    );

    const handleMQTTMessage = useCallback(
        (_topic: string, message: Buffer) => {
            const buffer = new Uint8Array(message);
            const indexChange = IndexData.decode(buffer);
            updateFromMQTT(indexChange);
        },
        [updateFromMQTT],
    );

    useMQTT(INDEX_REALTIME_TOPICS, handleMQTTMessage);

    return (
        <section className="flex items-center justify-between py-3 px-2 base-tertiary">
            <nav
                className="relative flex gap-12 overflow-x-hidden"
                aria-label="Market indices ticker"
            >
                {Array.from({ length: 3 }).map((_, idx) => (
                    <ul key={idx} className="animate-marquee whitespace-nowrap flex gap-12">
                        {normalizedData.map((item, i) => (
                            <li
                                key={i}
                                className="flex gap-1 body-5 items-center justify-center"
                            >
                                <strong className="text-primary uppercase">{item.index}</strong>
                                <div
                                    className={`flex gap-1 items-center ${item.change >= 0 ? 'text-green' : 'text-red'}`}
                                    aria-label={`${item.index} value and change`}
                                >
                                    <span>{formatNumberVN(item.indexValue)}</span>(
                                    <span>{formatNumberVN(item.change)}</span>
                                    <span>{formatNumberVN(item.changePercent)}%</span>)
                                </div>
                            </li>
                        ))}
                    </ul>
                ))}
            </nav>
        </section>
    );
};
