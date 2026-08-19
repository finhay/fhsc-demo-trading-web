'use client';

import { useRouter } from 'next/router';

import { FaChevronRight } from 'react-icons/fa6';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Spinner } from '@/components/common/ui/Spinner';
import { BTN_ORDERS_HISTORIES } from '@/constants/haybond';
import { useTranslate } from '@/hooks/useTranslate';
import { useHaybondStore } from '@/stores/haybond/useHaybondStore';
import { formatDate, formatNumberVN } from '@/utils/format';
import { setNamePackage } from '@/utils/haybond';

export const HaybondOrdersHistories = () => {
    const trans = useTranslate();
    const router = useRouter();
    const { ordersHistories } = useHaybondStore();

    const getStatusClass = (status: string) => {
        switch (status) {
            case BTN_ORDERS_HISTORIES.KEY_CANCELED:
                return 'text-red';
            case BTN_ORDERS_HISTORIES.KEY_PROCESSING:
                return 'text-orange';
            default:
                return 'text-highlight';
        }
    };

    const getTextStatus = (status: string) => {
        switch (status) {
            case 'PROCESSING':
                return trans.haybond.processing;
            case 'CANCELED':
                return trans.haybond.rejected;
            default:
                return trans.haybond.success;
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

    return (
        <div className="bg-secondary flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg">
            <div className="bg-disabled flex w-full shrink-0 items-center justify-between rounded-t-lg px-4 py-2">
                <h3 className="font-body-2-highlight text-primary">
                    {trans.haybond.order_history}
                </h3>
                <button
                    type="button"
                    className="text-highlight font-body-3 flex cursor-pointer items-center gap-2"
                    onClick={() => router.push('/haybond/lich-su-dat-lenh')}
                >
                    <span>{trans.haybond.all}</span>
                    <FaChevronRight size={12} />
                </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col p-4">
                <Spinner isLoading={ordersHistories.isLoading} isOverlay={false} />
                {!ordersHistories.isLoading && ordersHistories.content.length === 0 && (
                    <EmptyState />
                )}
                {!ordersHistories.isLoading && ordersHistories.content.length > 0 && (
                    <>
                        <div className="mb-2 flex items-center justify-between">
                            <span className="font-caption text-secondary">
                                {trans.haybond.product_package}/ <br />
                                {trans.haybond.order_time}
                            </span>
                            <span className="font-caption text-secondary mr-8 text-end">
                                {trans.haybond.amount}/ <br />
                                {trans.haybond.status}
                            </span>
                        </div>
                        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
                            {ordersHistories.content.map((item) => {
                                const {
                                    id,
                                    name,
                                    execute_date,
                                    total_amount,
                                    status,
                                    order_side,
                                    sell_early,
                                    saving_book_type,
                                } = item;
                                return (
                                    <button
                                        type="button"
                                        key={id}
                                        className="flex cursor-pointer items-center justify-between"
                                        onClick={() => handleToDetail(saving_book_type, id)}
                                    >
                                        <div className="flex flex-col text-left">
                                            <span className="font-body-3-highlight text-primary">
                                                {setNamePackage(
                                                    name,
                                                    trans,
                                                    order_side,
                                                    sell_early,
                                                    saving_book_type,
                                                )}
                                            </span>
                                            <span className="font-caption text-secondary">
                                                {formatDate(execute_date)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-col items-end">
                                                <span className="font-body-3-highlight text-primary">
                                                    {formatNumberVN(total_amount, { decimals: 0 })}
                                                    {trans.haybond.currency_unit}
                                                </span>
                                                <span
                                                    className={`font-caption ${getStatusClass(status)}`}
                                                >
                                                    {getTextStatus(status)}
                                                </span>
                                            </div>
                                            <FaChevronRight size={12} className="text-primary" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
