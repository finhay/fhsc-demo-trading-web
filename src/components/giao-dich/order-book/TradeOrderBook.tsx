'use client';

import { useEffect, useRef, useState } from 'react';

import { Skeleton } from '@/components/common/ui/Skeleton';
import { TradeCancelOrderModal } from '@/components/giao-dich/order-book/modals/TradeCancelOrderModal';
import { TradeDetailOrderModal } from '@/components/giao-dich/order-book/modals/TradeDetailOrderModal';
import { TradeUpdateOrderModal } from '@/components/giao-dich/order-book/modals/TradeUpdateOrderModal';
import { TradeOrderBookRowNormal } from '@/components/giao-dich/order-book/rows/TradeOrderBookRowNormal';
import { toast } from '@/hooks/lib/useToast';
import { usePaperOrderPolling } from '@/hooks/trading/usePaperOrderPolling';
import { fetchPaperOrderDetail } from '@/services/api/paper-trading/orders';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { usePaperAccountStore } from '@/stores/paper-trading/usePaperAccountStore';
import { useTradingStore } from '@/stores/trading/useTradingStore';
import type { TradeOrderBookRow } from '@/types/pages/trading';
import type { PaperOrder } from '@/types/paper-trading/orders';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';

const ORDER_BOOK_COLUMN_COUNT = 6;

export const TradeOrderBook = () => {
    const [updateOrder, setUpdateOrder] = useState<TradeOrderBookRow | null>(null);
    const [cancelOrder, setCancelOrder] = useState<TradeOrderBookRow | null>(null);
    const [detailOrderItems, setDetailOrderItems] = useState<PaperOrder[] | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const { startLoading, stopLoading } = useLoadingStore();
    const { accountId } = usePaperAccountStore();
    const { orders, isLoadingOrders, fetchOrders } = useTradingStore();

    usePaperOrderPolling(accountId);

    const handleOpenOrderDetail = async (orderId: string) => {
        startLoading();
        try {
            const { error_code, message, data } = await fetchPaperOrderDetail(accountId, orderId);
            if (isSuccessApi(error_code)) {
                setDetailOrderItems(data ? [data] : []);
            } else {
                toast.error(message);
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Có lỗi xảy ra, vui lòng thử lại'));
        } finally {
            stopLoading();
        }
    };

    useEffect(() => {
        if (!accountId) return;
        fetchOrders(accountId);
    }, [accountId]);

    return (
        <>
            <section
                className="bg-secondary flex w-full flex-col gap-2 p-3 rounded-xl h-64"
                aria-labelledby="orderbook-heading"
            >
                <header className="flex gap-2 items-center shrink-0">
                    <h2
                        id="orderbook-heading"
                        className="font-body-3-highlight text-primary whitespace-nowrap"
                    >
                        {'Sổ lệnh'}
                    </h2>
                </header>
                <div
                    ref={scrollContainerRef}
                    className="scrollbar w-full flex-1 overflow-x-auto overflow-y-auto min-h-0"
                >
                    {isLoadingOrders ? (
                        <Skeleton />
                    ) : orders.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-secondary font-caption">{'Chưa có lệnh nào'}</p>
                        </div>
                    ) : (
                        <div className="w-full">
                            <table className="w-full table-fixed border-collapse">
                                <colgroup>
                                    {Array.from({ length: ORDER_BOOK_COLUMN_COUNT }, (_, index) => (
                                        <col key={index} className="w-1/6" />
                                    ))}
                                </colgroup>
                                <thead className="sticky top-0 bg-secondary z-5">
                                    <tr>
                                        <th className="w-1/6 pb-2 font-caption text-secondary whitespace-nowrap px-1 text-left">
                                            {'Mã CP'}
                                        </th>
                                        <th className="w-1/6 pb-2 font-caption text-secondary whitespace-nowrap px-1 text-right">
                                            {'KL khớp/KL đặt'}
                                        </th>
                                        <th className="w-1/6 pb-2 font-caption text-secondary whitespace-nowrap px-1 text-right">
                                            {'Giá khớp/Giá đặt'}
                                        </th>
                                        <th className="w-1/6 pb-2 font-caption text-secondary whitespace-nowrap px-1 text-right">
                                            {'Loại lệnh'}
                                        </th>
                                        <th className="w-1/6 pb-2 font-caption text-secondary whitespace-nowrap px-1 text-right">
                                            {'Trạng thái'}
                                        </th>
                                        <th className="w-1/6 pb-2 font-caption text-secondary whitespace-nowrap px-1 text-right">
                                            {'Sửa / Huỷ lệnh'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <TradeOrderBookRowNormal
                                            key={order.orderId}
                                            order={order}
                                            onOpenDetail={handleOpenOrderDetail}
                                            onEdit={setUpdateOrder}
                                            onCancel={setCancelOrder}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>
            {updateOrder && (
                <TradeUpdateOrderModal
                    orderId={updateOrder.orderId}
                    symbol={updateOrder.symbol}
                    side={updateOrder.type}
                    rawPrice={updateOrder.rawPrice}
                    rawQty={updateOrder.rawQty}
                    onClose={() => setUpdateOrder(null)}
                    onSuccess={() => setUpdateOrder(null)}
                />
            )}
            {detailOrderItems && (
                <TradeDetailOrderModal
                    items={detailOrderItems}
                    onClose={() => setDetailOrderItems(null)}
                />
            )}
            {cancelOrder && (
                <TradeCancelOrderModal
                    orderId={cancelOrder.orderId}
                    symbol={cancelOrder.symbol}
                    side={cancelOrder.type}
                    rawPrice={cancelOrder.rawPrice}
                    rawQty={cancelOrder.rawQty}
                    onClose={() => setCancelOrder(null)}
                    onSuccess={() => setCancelOrder(null)}
                />
            )}
        </>
    );
};
