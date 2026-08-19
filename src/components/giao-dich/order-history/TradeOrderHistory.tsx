'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';

import { RiDownloadLine } from 'react-icons/ri';

import { Skeleton } from '@/components/common/ui/Skeleton';
import { ORDER_SIDE } from '@/constants/trading';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { fetchSubAccountMatchedOrdersReport } from '@/services/api/trade/history';
import { exportTradingReport, fetchTradingReportResult } from '@/services/api/trade/reports';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { useTradingStore } from '@/stores/trading/useTradingStore';
import type { TradeMatchedHistoryTableRow } from '@/types/pages/trading';
import type { MatchedOrderHistoryItem, MatchedOrderSymbol } from '@/types/trade/history';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';
import { formatApiDate, formatNumberVN } from '@/utils/format';

export const TradeOrderHistory = () => {
    const trans = useTranslate();
    const { activeSubAccount } = useAuthStore();
    const { startLoading, stopLoading } = useLoadingStore();
    const { realtimeMatches, clearRealtimeMatches } = useTradingStore();
    const [side, setSide] = useState<string>(ORDER_SIDE.BUY);
    const [data, setData] = useState<MatchedOrderSymbol[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const sides = [
        { key: ORDER_SIDE.BUY, label: trans.trading.matched_history.tab_buy },
        { key: ORDER_SIDE.SELL, label: trans.trading.matched_history.tab_sell },
    ];

    const mergedData = useMemo<MatchedOrderSymbol[]>(() => {
        const entries = Object.values(realtimeMatches).filter((entry) => entry.side === side);
        if (entries.length === 0) return data;

        const result = data.map((group) => ({ ...group, history: [...group.history] }));
        const bySymbol = new Map(result.map((group) => [group.symbol, group]));
        const touched = new Set<string>();

        for (const entry of entries) {
            let group = bySymbol.get(entry.symbol);
            if (!group) {
                group = {
                    symbol: entry.symbol,
                    total_quantity: 0,
                    total_volume: 0,
                    average_price: 0,
                    history: [],
                };
                bySymbol.set(entry.symbol, group);
                result.push(group);
            }

            const existingIndex = group.history.findIndex((h) => h.order_id === entry.orderId);
            const item: MatchedOrderHistoryItem = {
                order_id: entry.orderId,
                quantity_matched: entry.quantity,
                price_matched: entry.price,
                order_side: entry.side,
                transaction_date:
                    existingIndex >= 0 ? group.history[existingIndex].transaction_date : '',
                volume: entry.volume,
            };

            if (existingIndex >= 0) {
                group.history[existingIndex] = item;
            } else {
                group.history.push(item);
            }
            touched.add(entry.symbol);
        }

        for (const group of result) {
            if (!touched.has(group.symbol)) continue;
            const totalQty = group.history.reduce((sum, h) => sum + h.quantity_matched, 0);
            const totalVol = group.history.reduce((sum, h) => sum + h.volume, 0);
            group.total_quantity = totalQty;
            group.total_volume = totalVol;
            group.average_price = totalQty > 0 ? (totalVol * 1000) / totalQty : 0;
        }

        return result;
    }, [data, realtimeMatches, side]);

    const flatRows = useMemo<TradeMatchedHistoryTableRow[]>(
        () =>
            mergedData.flatMap(
                ({ symbol, history, total_quantity, average_price, total_volume }) => [
                    ...history.map((order) => ({
                        symbol,
                        order_id: order.order_id,
                        isTotal: false,
                        quantity: order.quantity_matched,
                        price: order.price_matched,
                        volume: order.volume,
                    })),
                    {
                        symbol,
                        isTotal: true,
                        quantity: total_quantity,
                        price: average_price,
                        volume: total_volume,
                    },
                ],
            ),
        [mergedData],
    );

    const rowsBySymbol = useMemo(() => {
        const grouped = new Map<string, TradeMatchedHistoryTableRow[]>();
        for (const row of flatRows) {
            const { symbol } = row;
            if (!grouped.has(symbol)) grouped.set(symbol, []);
            grouped.get(symbol)!.push(row);
        }
        return grouped;
    }, [flatRows]);
    const symbolOrder = Array.from(rowsBySymbol.keys());

    const fetchMatchedOrders = async (accountId: string, orderSide: string) => {
        setIsLoading(true);
        try {
            const { data, error_code } = await fetchSubAccountMatchedOrdersReport(
                accountId,
                orderSide,
                formatApiDate(),
            );
            if (isSuccessApi(error_code)) {
                setData(data ?? []);
                clearRealtimeMatches();
            }
        } finally {
            setIsLoading(false);
        }
    };

    const exportMatchedOrders = async () => {
        startLoading();
        try {
            const { data, error_code, message } = await exportTradingReport(
                activeSubAccount?.sub_account_id ?? '',
                side,
            );
            if (isSuccessApi(error_code)) {
                setTimeout(async () => {
                    const res = await fetchTradingReportResult(data);
                    if (isSuccessApi(res.error_code) && res.data.url) {
                        window.open(res.data.url, '_blank');
                    } else {
                        toast.error(res.data.error);
                    }
                    stopLoading();
                }, 3000);
            } else {
                toast.error(message);
                stopLoading();
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.common.try_again_error));
            stopLoading();
        }
    };

    useEffect(() => {
        if (!activeSubAccount?.sub_account_id) return;
        fetchMatchedOrders(activeSubAccount.sub_account_id, side);
    }, [side, activeSubAccount?.sub_account_id]);

    return (
        <section
            className="bg-secondary flex min-w-0 w-full flex-col gap-2 p-3 rounded-xl h-64 overflow-hidden"
            aria-labelledby="matched-history-heading"
        >
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2
                        id="matched-history-heading"
                        className="font-body-3-highlight text-primary whitespace-nowrap"
                    >
                        {trans.trading.matched_history.heading}
                    </h2>
                    <nav
                        role="tablist"
                        aria-label={trans.trading.matched_history.tab_aria}
                        className="flex gap-2"
                    >
                        {sides.map(({ key, label }) => (
                            <button
                                key={key}
                                role="tab"
                                aria-selected={side === key}
                                onClick={() => setSide(key)}
                                className={`px-3 py-1 w-24 rounded-full font-caption transition-colors ${
                                    side === key ? 'bg-tertiary text-white' : 'text-secondary'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </nav>
                </div>
                {flatRows.length > 0 && (
                    <button
                        type="button"
                        className="p-2 rounded-full bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={exportMatchedOrders}
                        disabled={isLoading}
                    >
                        <RiDownloadLine size={16} className="text-primary shrink-0" />
                    </button>
                )}
            </header>
            <div
                role="tabpanel"
                aria-label={sides.find((s) => s.key === side)?.label}
                className="min-w-0 w-full flex-1 overflow-auto"
            >
                {isLoading ? (
                    <Skeleton />
                ) : flatRows.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-secondary font-caption">
                            {trans.trading.matched_history.empty}
                        </p>
                    </div>
                ) : (
                    <table className="w-full table-auto border-separate border-spacing-x-2 border-spacing-y-0">
                        <thead>
                            <tr>
                                <th
                                    scope="col"
                                    className="sticky top-0 z-10 bg-secondary pb-2 font-caption text-secondary whitespace-nowrap text-left"
                                >
                                    {trans.trading.matched_history.col_symbol}
                                </th>
                                <th
                                    scope="col"
                                    className="sticky top-0 z-10 bg-secondary pb-2 font-caption text-secondary whitespace-nowrap text-right"
                                >
                                    {trans.trading.matched_history.col_quantity}
                                </th>
                                <th
                                    scope="col"
                                    className="sticky top-0 z-10 bg-secondary pb-2 font-caption text-secondary whitespace-nowrap text-right"
                                >
                                    {trans.trading.matched_history.col_price}
                                </th>
                                <th
                                    scope="col"
                                    className="sticky top-0 z-10 bg-secondary pb-2 font-caption text-secondary whitespace-nowrap text-right"
                                >
                                    {trans.trading.matched_history.col_value}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {symbolOrder.map((symbol) =>
                                rowsBySymbol.get(symbol)!.map((row, rowIndex) => (
                                    <Fragment
                                        key={
                                            row.isTotal
                                                ? `total-${symbol}`
                                                : `${symbol}-${row.order_id}`
                                        }
                                    >
                                        {row.isTotal && (
                                            <tr aria-hidden="true">
                                                <td colSpan={4} className="py-0">
                                                    <div className="h-px w-full bg-tertiary" />
                                                </td>
                                            </tr>
                                        )}
                                        <tr>
                                            <td className="whitespace-nowrap text-left">
                                                {row.isTotal ? (
                                                    <span className="font-caption-highlight text-primary">
                                                        {trans.trading.matched_history.total}
                                                    </span>
                                                ) : (
                                                    <span
                                                        className={`font-caption-highlight text-primary ${rowIndex === 0 ? '' : 'invisible'}`}
                                                    >
                                                        {symbol}
                                                    </span>
                                                )}
                                            </td>
                                            <td
                                                className={`whitespace-nowrap text-right ${row.isTotal ? 'font-caption-highlight' : 'font-caption'} text-primary`}
                                            >
                                                {formatNumberVN(row.quantity, { decimals: 0 })}
                                            </td>
                                            <td
                                                className={`whitespace-nowrap text-right ${row.isTotal ? 'font-caption-highlight' : 'font-caption'} text-primary`}
                                            >
                                                {formatNumberVN(row.price / 1000, { decimals: 2 })}
                                            </td>
                                            <td
                                                className={`whitespace-nowrap text-right ${row.isTotal ? 'font-caption-highlight' : 'font-caption'} text-primary`}
                                            >
                                                {formatNumberVN(row.volume, { decimals: 0 })}
                                            </td>
                                        </tr>
                                    </Fragment>
                                )),
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    );
};
