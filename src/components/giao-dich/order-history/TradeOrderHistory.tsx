'use client';

import { Fragment, useMemo, useState } from 'react';

import { Skeleton } from '@/components/common/ui/Skeleton';
import { ORDER_SIDE } from '@/constants/trading';
import { useTradingStore } from '@/stores/trading/useTradingStore';
import type { TradeMatchedHistoryTableRow } from '@/types/pages/trading';
import { formatNumberVN } from '@/utils/format';
import { groupPaperOrdersBySymbol } from '@/utils/paper-trading/order-book';

export const TradeOrderHistory = () => {
    const { orders, isLoadingOrders } = useTradingStore();
    const [side, setSide] = useState<string>(ORDER_SIDE.BUY);

    const sides = [
        { key: ORDER_SIDE.BUY, label: 'Mua' },
        { key: ORDER_SIDE.SELL, label: 'Bán' },
    ];

    // Dựng lại từ sổ lệnh đang có sẵn trong store — không tốn thêm request nào.
    const flatRows = useMemo(
        () =>
            groupPaperOrdersBySymbol(
                orders.flatMap((row) => (row.paperOrder ? [row.paperOrder] : [])),
                side,
            ),
        [orders, side],
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
                        {'Lịch sử lệnh đã khớp'}
                    </h2>
                    <nav role="tablist" aria-label={'Chọn chiều lệnh'} className="flex gap-2">
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
            </header>
            <div
                role="tabpanel"
                aria-label={sides.find((s) => s.key === side)?.label}
                className="min-w-0 w-full flex-1 overflow-auto"
            >
                {isLoadingOrders ? (
                    <Skeleton />
                ) : flatRows.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-secondary font-caption">{'Chưa có lệnh đã khớp'}</p>
                    </div>
                ) : (
                    <table className="w-full table-auto border-separate border-spacing-x-2 border-spacing-y-0">
                        <thead>
                            <tr>
                                <th
                                    scope="col"
                                    className="sticky top-0 z-10 bg-secondary pb-2 font-caption text-secondary whitespace-nowrap text-left"
                                >
                                    {'Mã'}
                                </th>
                                <th
                                    scope="col"
                                    className="sticky top-0 z-10 bg-secondary pb-2 font-caption text-secondary whitespace-nowrap text-right"
                                >
                                    {'Khối lượng'}
                                </th>
                                <th
                                    scope="col"
                                    className="sticky top-0 z-10 bg-secondary pb-2 font-caption text-secondary whitespace-nowrap text-right"
                                >
                                    {'Giá'}
                                </th>
                                <th
                                    scope="col"
                                    className="sticky top-0 z-10 bg-secondary pb-2 font-caption text-secondary whitespace-nowrap text-right"
                                >
                                    {'Giá trị (vnđ)'}
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
                                                        {'Tổng'}
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
