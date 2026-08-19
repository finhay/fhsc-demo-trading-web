'use client';

import { type WheelEvent, useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/router';

import { FaChevronLeft, FaChevronRight, FaTicket } from 'react-icons/fa6';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Spinner } from '@/components/common/ui/Spinner';
import { FilterTabs } from '@/components/haybond/shared/FilterTabs';
import { BTN_ORDERS_HISTORIES } from '@/constants/haybond';
import { useTranslate } from '@/hooks/useTranslate';
import { useHaybondStore } from '@/stores/haybond/useHaybondStore';
import { formatDate, formatNumberVN } from '@/utils/format';
import { setNamePackage } from '@/utils/haybond';

export const HaybondOrderHistoriesFull = () => {
    const trans = useTranslate();
    const router = useRouter();
    const { ordersHistories, ordersFilter, fetchOrdersHistories, resetStore } = useHaybondStore();
    const [selectedBtnKey, setSelectedBtnKey] = useState(
        ordersFilter || BTN_ORDERS_HISTORIES.KEY_ALL,
    );
    const requestFlag = useRef(false);
    const listRef = useRef<HTMLDivElement>(null);

    const filterTabs = [
        { key: BTN_ORDERS_HISTORIES.KEY_ALL, name: trans.haybond.all },
        { key: BTN_ORDERS_HISTORIES.KEY_SUCCESS, name: trans.haybond.success },
        { key: BTN_ORDERS_HISTORIES.KEY_CANCELED, name: trans.haybond.rejected },
        { key: BTN_ORDERS_HISTORIES.KEY_PROCESSING, name: trans.haybond.processing },
    ];

    const getTextStatus = (status: string) => {
        switch (status) {
            case BTN_ORDERS_HISTORIES.KEY_PROCESSING:
                return trans.haybond.processing;
            case BTN_ORDERS_HISTORIES.KEY_CANCELED:
                return trans.haybond.rejected;
            default:
                return trans.haybond.success;
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case BTN_ORDERS_HISTORIES.KEY_CANCELED:
                return { border: 'border-red', bg: 'bg-error', text: 'text-primary' };
            case BTN_ORDERS_HISTORIES.KEY_PROCESSING:
                return { border: 'border-orange', bg: 'bg-warning', text: 'text-primary' };
            default:
                return { border: 'border-highlight', bg: 'bg-success', text: 'text-primary' };
        }
    };

    const handleToDetail = (savingBookType: string, id: number) => {
        if (savingBookType === 'FLEXIBLE') {
            router.push({
                pathname: '/haybond/lich-su-dat-lenh-flexible/chi-tiet',
                query: { id },
            });
        } else {
            router.push({
                pathname: '/haybond/lich-su-dat-lenh/chi-tiet',
                query: { id },
            });
        }
    };

    const handleFilter = (status: string) => {
        setSelectedBtnKey(status);
        fetchOrdersHistories({ page: 1, status, isLoadMore: false });
    };

    const handleWheel = async (event: WheelEvent<HTMLDivElement>) => {
        if (ordersHistories.page === ordersHistories.totalPages) return;
        const { deltaY } = event;
        if (deltaY <= 0 || !listRef.current) return;
        const { scrollHeight, clientHeight, scrollTop } = listRef.current;
        const maxScrollTop = scrollHeight - clientHeight;
        if (scrollTop < maxScrollTop - 10 || requestFlag.current) return;
        requestFlag.current = true;
        await fetchOrdersHistories({
            page: ordersHistories.page + 1,
            status: selectedBtnKey,
            isLoadMore: true,
        });
        requestFlag.current = false;
    };

    useEffect(() => {
        fetchOrdersHistories({
            page: 1,
            status: selectedBtnKey,
            isLoadMore: false,
        });
        return () => {
            resetStore();
        };
    }, []);

    return (
        <div className="flex h-full min-h-0 w-full flex-col items-center gap-6">
            <Spinner isLoading={ordersHistories.isLoading} />
            <div className="relative flex w-full shrink-0 items-center">
                <button
                    type="button"
                    className="text-primary cursor-pointer"
                    onClick={() => router.back()}
                >
                    <FaChevronLeft size={16} />
                </button>
                <h3 className="font-heading-3 text-primary absolute left-1/2 -translate-x-1/2">
                    {trans.haybond.order_history}
                </h3>
            </div>
            <FilterTabs items={filterTabs} selectedKey={selectedBtnKey} onSelect={handleFilter} />
            {!ordersHistories.isLoading && ordersHistories.content.length === 0 && (
                <div className="bg-secondary flex w-80 items-center justify-center rounded py-12">
                    <EmptyState />
                </div>
            )}
            {!ordersHistories.isLoading && ordersHistories.content.length > 0 && (
                <div
                    ref={listRef}
                    onWheel={handleWheel}
                    className="flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-3 overflow-y-auto"
                >
                    {ordersHistories.content.map((item) => {
                        const {
                            id,
                            name,
                            status,
                            execute_date,
                            total_amount,
                            price,
                            quantity,
                            fee,
                            order_side,
                            is_receive_coupon,
                            coupon_received_times,
                            sell_early,
                            saving_book_type,
                            symbol,
                        } = item;
                        const statusClass = getStatusClass(status);
                        return (
                            <button
                                type="button"
                                key={id}
                                className="bg-secondary flex cursor-pointer flex-col gap-2 rounded p-3 text-left"
                                onClick={() => handleToDetail(saving_book_type, id)}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-body-2-highlight text-primary">
                                            {setNamePackage(
                                                name,
                                                trans,
                                                order_side,
                                                sell_early,
                                                saving_book_type,
                                            )}
                                        </span>
                                        {order_side === 'SELL' && is_receive_coupon && (
                                            <span className="bg-disabled font-caption text-primary inline-flex w-fit items-center gap-1 rounded-full px-2 py-1">
                                                <FaTicket size={16} className="text-secondary" />
                                                {trans.haybond.receive_coupon}{' '}
                                                {coupon_received_times} {trans.haybond.times}
                                            </span>
                                        )}
                                        <span
                                            className={`font-tiny w-fit rounded-2xl border px-2 py-0.5 ${statusClass.border} ${statusClass.bg} ${statusClass.text}`}
                                        >
                                            {getTextStatus(status)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-caption text-secondary">
                                            {formatDate(execute_date)}
                                        </span>
                                        <FaChevronRight size={12} className="text-primary" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-5 gap-3">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-caption text-secondary">
                                            {trans.haybond.amount}
                                        </span>
                                        <span className="font-body-3-highlight text-primary">
                                            {`${formatNumberVN(total_amount, { decimals: 0 })}${trans.haybond.currency_unit}`}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-caption text-secondary">
                                            {trans.haybond.unit_price}
                                        </span>
                                        <span className="font-body-3-highlight text-primary">
                                            {`${formatNumberVN(price, { decimals: 0 })}${trans.haybond.currency_unit}`}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-caption text-secondary">
                                            {trans.haybond.quantity}
                                        </span>
                                        <span className="font-body-3-highlight text-primary">
                                            {`${formatNumberVN(quantity, { decimals: 0 })}Bond`}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-caption text-secondary">
                                            {order_side === 'SELL'
                                                ? trans.haybond.sell_fee
                                                : trans.haybond.buy_fee}
                                        </span>
                                        <span className="font-body-3-highlight text-primary">
                                            {`${formatNumberVN(fee, { decimals: 0 })}${trans.haybond.currency_unit}`}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-caption text-secondary">
                                            {trans.haybond.bond_symbol}
                                        </span>
                                        <span className="font-body-3-highlight text-primary">
                                            {symbol}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                    <Spinner isLoading={ordersHistories.isLoadMore} isOverlay={false} />
                </div>
            )}
        </div>
    );
};
