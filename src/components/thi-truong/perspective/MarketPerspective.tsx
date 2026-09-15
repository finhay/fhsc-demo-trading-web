'use client';

import {
    type SortingState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { MdOutlineArrowDropDown, MdOutlineArrowDropUp } from 'react-icons/md';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { getMarketPerspectiveColumns } from '@/components/thi-truong/perspective/MarketPerspectiveColumns';
import { MarketPerspectiveRow } from '@/components/thi-truong/perspective/MarketPerspectiveRow';
import { MarketDot } from '@/components/thi-truong/shared/MarketDot';
import { MarketOutOfSession } from '@/components/thi-truong/shared/MarketOutOfSession';
import { TOP_PRICE_CHANGE_PERIODS } from '@/constants/market';
import { useMQTT } from '@/hooks/useMQTT';
import { StockPriceMessageList } from '@/proto/stock';
import { fetchTopStockPriceChange } from '@/services/api/datafeed/trading-data';
import { useMarketIndexStore } from '@/stores/common/useMarketIndexStore';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';
import type {
    TopStockPriceChangeItem,
    TopStockPriceChangePeriod,
    TopStockPriceChangeTrend,
} from '@/types/datafeed/trading-data';
import type { PerspectiveColMeta } from '@/types/pages/market';
import { isSuccessApi } from '@/utils/common';
import {
    buildTopStockPriceChangesMqttTopic,
    mapStockPriceMessagesToTopChangeItems,
    mergeRealtimeTopChangeItems,
} from '@/utils/market/market-perspective';

const PERSPECTIVE_PERIOD = {
    session: 'Từ đầu phiên',
    '15m': '15 phút',
    '1h': '1 tiếng',
    '2h': '2 tiếng',
};

export const MarketPerspective = () => {
    const [trend, setTrend] = useState<TopStockPriceChangeTrend>('increase');
    const [period, setPeriod] = useState<TopStockPriceChangePeriod>('session');
    const [data, setData] = useState<TopStockPriceChangeItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sorting, setSorting] = useState<SortingState>([]);

    const { isPreSession } = useMarketIndexStore();
    const { openStockDetail } = useStockInfoStore();

    const topic = useMemo(() => buildTopStockPriceChangesMqttTopic(trend, period), [trend, period]);

    const handleMQTTMessage = useCallback((_topic: string, message: Buffer) => {
        const { stockPrices } = StockPriceMessageList.decode(new Uint8Array(message));
        const items = mapStockPriceMessagesToTopChangeItems(stockPrices).map((item) => ({
            ...item,
            change: item.change,
            changePercent: item.changePercent,
        }));
        setData((prev) => mergeRealtimeTopChangeItems(prev, items));
    }, []);

    const fetchData = async (
        nextTrend: TopStockPriceChangeTrend,
        nextPeriod: TopStockPriceChangePeriod,
    ) => {
        setIsLoading(true);
        const res = await fetchTopStockPriceChange(nextTrend, nextPeriod);

        const toAbsItem = (item: TopStockPriceChangeItem) => ({
            ...item,
            change: item.change,
            changePercent: item.changePercent,
        });

        if (isSuccessApi(res.error_code)) {
            setData(res.data.map(toAbsItem));
        }
        setIsLoading(false);
    };

    const handleTrendChange = (nextTrend: TopStockPriceChangeTrend) => {
        if (nextTrend === trend) return;
        setTrend(nextTrend);
        setSorting([]);
        fetchData(nextTrend, period);
    };

    const handlePeriodChange = (nextPeriod: TopStockPriceChangePeriod) => {
        if (nextPeriod === period) return;
        setPeriod(nextPeriod);
        setSorting([]);
        fetchData(trend, nextPeriod);
    };

    const columns = useMemo(() => getMarketPerspectiveColumns(openStockDetail), [openStockDetail]);

    const table = useReactTable({
        data,
        columns,
        getRowId: (row) => row.symbol,
        state: { sorting },
        onSortingChange: setSorting,
        enableSortingRemoval: true,
        enableMultiSort: false,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    useEffect(() => {
        fetchData('increase', 'session');
    }, []);

    useMQTT(topic, handleMQTTMessage, !isLoading);

    return (
        <section className="base-secondary flex w-full flex-col gap-2 rounded-xl p-4">
            <div className="flex items-center justify-between gap-2">
                <h2 className="body-3-highlight text-primary flex items-center gap-2">
                    <MarketDot />
                    {'Góc nhìn cổ phiếu'}
                </h2>
                <div
                    className="border-tertiary flex shrink-0 items-center gap-1 rounded-full border p-1"
                    role="group"
                    aria-label={'Lọc theo xu hướng giá'}
                >
                    <button
                        type="button"
                        aria-label={'Cổ phiếu tăng'}
                        aria-pressed={trend === 'increase'}
                        onClick={() => handleTrendChange('increase')}
                        className={`flex items-center justify-center rounded-xl p-0.5 transition-colors ${
                            trend === 'increase' ? 'base-tertiary' : ''
                        }`}
                    >
                        <MdOutlineArrowDropUp size={20} className="text-green" aria-hidden />
                    </button>
                    <button
                        type="button"
                        aria-label={'Cổ phiếu giảm'}
                        aria-pressed={trend === 'decrease'}
                        onClick={() => handleTrendChange('decrease')}
                        className={`flex items-center justify-center rounded-xl p-0.5 transition-colors ${
                            trend === 'decrease' ? 'base-tertiary' : ''
                        }`}
                    >
                        <MdOutlineArrowDropDown size={20} className="text-red" aria-hidden />
                    </button>
                </div>
            </div>
            <nav className="flex flex-col gap-2">
                <ul className="flex items-center gap-2 list-none p-0">
                    {TOP_PRICE_CHANGE_PERIODS.map(({ value }) => (
                        <li key={value}>
                            <button
                                type="button"
                                onClick={() => handlePeriodChange(value)}
                                className={`px-3 py-1 rounded-full transition-all ${
                                    period === value
                                        ? 'base-tertiary body-5-highlight text-primary'
                                        : 'body-5 text-secondary'
                                }`}
                            >
                                {PERSPECTIVE_PERIOD[value]}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="flex h-64 w-full flex-col">
                {isLoading ? (
                    <div className="flex h-full w-full">
                        <Skeleton />
                    </div>
                ) : isPreSession ? (
                    <div className="flex h-full w-full items-center justify-center">
                        <MarketOutOfSession />
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex h-full w-full items-center justify-center">
                        <EmptyState />
                    </div>
                ) : (
                    <div className="h-full overflow-x-auto overflow-y-auto">
                        <table
                            className="w-full min-w-72 table-fixed border-separate border-spacing-y-1.5"
                            aria-label={'Góc nhìn cổ phiếu'}
                        >
                            <colgroup>
                                <col className="w-1/4" />
                                <col className="w-1/4" />
                                <col />
                                <col className="w-1/7" />
                            </colgroup>
                            <thead className="sticky top-0 z-10 base-secondary">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            const meta = header.column.columnDef.meta as
                                                | PerspectiveColMeta
                                                | undefined;
                                            const sorted = header.column.getIsSorted();
                                            const ariaSort =
                                                sorted === 'asc'
                                                    ? 'ascending'
                                                    : sorted === 'desc'
                                                      ? 'descending'
                                                      : 'none';
                                            const align = meta?.align ?? 'left';
                                            const alignClass =
                                                align === 'right' ? 'text-right' : 'text-left';
                                            const thClass = meta?.thClass ?? 'px-1';

                                            return (
                                                <th
                                                    key={header.id}
                                                    scope="col"
                                                    aria-sort={
                                                        header.column.getCanSort()
                                                            ? ariaSort
                                                            : undefined
                                                    }
                                                    className={`base-secondary body-5 text-secondary ${alignClass} ${thClass}`.trim()}
                                                >
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                              header.column.columnDef.header,
                                                              header.getContext(),
                                                          )}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {table.getRowModel().rows.map((row) => (
                                    <MarketPerspectiveRow key={row.id} row={row} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
};
