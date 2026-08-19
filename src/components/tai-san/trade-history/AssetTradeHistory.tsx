'use client';

import {
    type ColumnDef,
    type SortingState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';

import { useEffect, useMemo, useState } from 'react';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Skeleton } from '@/components/common/ui/Skeleton';
import {
    getCashAdvanceColumns,
    getLoansColumns,
    getOrderHistoryColumns,
} from '@/components/tai-san/trade-history/AssetTradeHistoryColumns';
import {
    TRADE_HISTORY_RANGE_DAYS,
    TRADE_HISTORY_TABS,
    TRADE_HISTORY_TAB_KEYS,
} from '@/constants/assets';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import {
    fetchSubAccountCashAdvanceHistory,
    fetchSubAccountOrderHistoryPage,
} from '@/services/api/trade/history';
import {
    fetchSubAccountLoanRepaymentHistory,
    fetchSubAccountOutstandingLoans,
} from '@/services/api/trade/loans';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import type { SortableColMeta } from '@/types/pages/common';
import type { CashAdvance, OrderHistory } from '@/types/trade/history';
import type { Loans } from '@/types/trade/loans';
import { isSuccessApi } from '@/utils/common';
import { getDateRange } from '@/utils/format';

type TradeHistoryRow = OrderHistory | CashAdvance | Loans;

export const AssetTradeHistory = () => {
    const trans = useTranslate();
    const [activeTab, setActiveTab] = useState<string>(TRADE_HISTORY_TAB_KEYS.ORDER);
    const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);
    const [cashAdvance, setCashAdvance] = useState<CashAdvance[]>([]);
    const [loans, setLoans] = useState<Loans[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sorting, setSorting] = useState<SortingState>([]);

    const { activeSubAccount } = useAuthStore();

    const { fromDate, toDate } = useMemo(() => getDateRange(TRADE_HISTORY_RANGE_DAYS), []);
    const t = trans.assets.trade_history;

    const data = useMemo<TradeHistoryRow[]>(() => {
        if (activeTab === TRADE_HISTORY_TAB_KEYS.ORDER) return orderHistory;
        if (activeTab === TRADE_HISTORY_TAB_KEYS.CASH_ADVANCE) return cashAdvance;
        return loans;
    }, [activeTab, orderHistory, cashAdvance, loans]);

    const columns = useMemo(() => {
        if (activeTab === TRADE_HISTORY_TAB_KEYS.ORDER) {
            return getOrderHistoryColumns(trans) as ColumnDef<TradeHistoryRow, unknown>[];
        }
        if (activeTab === TRADE_HISTORY_TAB_KEYS.CASH_ADVANCE) {
            return getCashAdvanceColumns(trans) as ColumnDef<TradeHistoryRow, unknown>[];
        }
        return getLoansColumns(trans) as ColumnDef<TradeHistoryRow, unknown>[];
    }, [activeTab, trans]);

    const table = useReactTable({
        data,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const fetchData = async () => {
        if (!activeSubAccount?.sub_account_id) return;

        setIsLoading(true);
        try {
            const accountId = activeSubAccount.sub_account_id;

            if (activeTab === TRADE_HISTORY_TAB_KEYS.ORDER) {
                const { result, error_code, message } = await fetchSubAccountOrderHistoryPage(
                    accountId,
                    fromDate,
                    toDate,
                    1,
                );

                if (isSuccessApi(error_code)) {
                    setOrderHistory(result.data || []);
                } else {
                    throw new Error(message);
                }
            } else if (activeTab === TRADE_HISTORY_TAB_KEYS.CASH_ADVANCE) {
                const { result, error_code, message } = await fetchSubAccountCashAdvanceHistory(
                    accountId,
                    fromDate,
                    toDate,
                );

                if (isSuccessApi(error_code)) {
                    setCashAdvance(result || []);
                } else {
                    throw new Error(message);
                }
            } else if (activeTab === TRADE_HISTORY_TAB_KEYS.LOANS) {
                const [unpaidRes, paidRes] = await Promise.all([
                    fetchSubAccountOutstandingLoans(accountId, fromDate, toDate),
                    fetchSubAccountLoanRepaymentHistory(accountId, fromDate, toDate),
                ]);

                const unpaidData = isSuccessApi(unpaidRes.error_code) ? unpaidRes.data || [] : [];
                const paidData = isSuccessApi(paidRes.error_code) ? paidRes.data || [] : [];

                if (!isSuccessApi(unpaidRes.error_code)) {
                    toast.error(unpaidRes.message);
                }
                if (!isSuccessApi(paidRes.error_code)) {
                    toast.error(paidRes.message);
                }

                setLoans([...unpaidData, ...paidData]);
            }
        } catch {
            if (activeTab === TRADE_HISTORY_TAB_KEYS.ORDER) setOrderHistory([]);
            if (activeTab === TRADE_HISTORY_TAB_KEYS.CASH_ADVANCE) setCashAdvance([]);
            if (activeTab === TRADE_HISTORY_TAB_KEYS.LOANS) setLoans([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setSorting([]);
    }, [activeTab]);

    useEffect(() => {
        fetchData();
    }, [activeSubAccount?.sub_account_id, activeTab, fromDate, toDate]);

    return (
        <section className="flex h-96 w-full shrink-0 flex-col gap-3 overflow-hidden rounded-xl bg-secondary p-3">
            <h2 className="shrink-0 font-body-2-highlight text-primary">{t.heading}</h2>
            <nav
                className="flex shrink-0 gap-3 overflow-x-auto"
                role="tablist"
                aria-label={t.nav_aria}
            >
                {TRADE_HISTORY_TABS.map((tab) => {
                    const isActive = tab.key === activeTab;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex h-8 shrink-0 items-center justify-center rounded-full px-4 font-body-3 transition-colors ${
                                isActive
                                    ? 'bg-tertiary font-body-3-highlight text-primary'
                                    : 'text-secondary'
                            }`}
                        >
                            {t[tab.labelKey as keyof typeof t]}
                        </button>
                    );
                })}
            </nav>
            <div className="min-h-0 w-full flex-1">
                {isLoading ? (
                    <div className="h-full w-full">
                        <Skeleton />
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex h-full w-full items-center justify-center">
                        <EmptyState />
                    </div>
                ) : (
                    <div className="scrollbar h-full overflow-auto">
                        <table className="w-full min-w-max border-collapse">
                            <thead className="sticky top-0 z-10 bg-secondary">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            const meta = header.column.columnDef.meta as
                                                | SortableColMeta
                                                | undefined;
                                            const isLeft = meta?.align === 'left';
                                            const dir = header.column.getIsSorted();

                                            return (
                                                <th
                                                    key={header.id}
                                                    scope="col"
                                                    {...(header.column.getCanSort() && {
                                                        'aria-sort':
                                                            dir === 'asc'
                                                                ? 'ascending'
                                                                : dir === 'desc'
                                                                  ? 'descending'
                                                                  : 'none',
                                                    })}
                                                    className={`whitespace-nowrap px-2 py-2.5 font-body-3 text-secondary ${isLeft ? 'text-left' : 'text-right'}`}
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
                                    <tr
                                        key={row.id}
                                        className="border-b border-tertiary last:border-b-0"
                                    >
                                        {row.getVisibleCells().map((cell) => {
                                            const meta = cell.column.columnDef.meta as
                                                | SortableColMeta
                                                | undefined;
                                            const isLeft = meta?.align === 'left';
                                            return (
                                                <td
                                                    key={cell.id}
                                                    className={`whitespace-nowrap px-2 py-2.5 font-body-3 text-primary ${isLeft ? 'text-left' : 'text-right'}`}
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext(),
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
};
