'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Skeleton } from '@/components/common/ui/Skeleton';
import { Spinner } from '@/components/common/ui/Spinner';
import { TradeIcebergDetail } from '@/components/giao-dich/iceberg/TradeIcebergDetail';
import { TradeCancelOrderModal } from '@/components/giao-dich/order-book/modals/TradeCancelOrderModal';
import { TradeDetailOrderModal } from '@/components/giao-dich/order-book/modals/TradeDetailOrderModal';
import { TradeUpdateOrderModal } from '@/components/giao-dich/order-book/modals/TradeUpdateOrderModal';
import { TradeOrderBookRow247 } from '@/components/giao-dich/order-book/rows/TradeOrderBookRow247';
import { TradeOrderBookRowIceberg } from '@/components/giao-dich/order-book/rows/TradeOrderBookRowIceberg';
import { TradeOrderBookRowNormal } from '@/components/giao-dich/order-book/rows/TradeOrderBookRowNormal';
import { TradeOrderBookRowTwapLo } from '@/components/giao-dich/order-book/rows/TradeOrderBookRowTwapLo';
import { TradeOrderBookTabs } from '@/components/giao-dich/order-book/tabs/TradeOrderBookTabs';
import { TradeTwapLoDetail } from '@/components/giao-dich/twap-lo/TradeTwapLoDetail';
import { ORDER_MODE_KEY } from '@/constants/trading';
import { toast } from '@/hooks/lib/useToast';
import { useMQTT } from '@/hooks/useMQTT';
import { getNotificationsMqttPrefix } from '@/services/api/notifications';
import { fetchOrderBookOrderDetail } from '@/services/api/trade/orders';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { useTradingStore } from '@/stores/trading/useTradingStore';
import type { TradeOrderBookRow } from '@/types/pages/trading';
import type { OrderBookHistoryItem } from '@/types/trade/orders';
import type { TwapLoDetailView, TwapLoOrderDto } from '@/types/trade/twap-lo';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';

export const TradeOrderBook = () => {
    const [updateOrder, setUpdateOrder] = useState<TradeOrderBookRow | null>(null);
    const [cancelOrder, setCancelOrder] = useState<TradeOrderBookRow | null>(null);
    const [icebergDetail, setIcebergDetail] = useState<{
        orderId: string;
        view: TwapLoDetailView;
    } | null>(null);
    const [twapLoDetail, setTwapLoDetail] = useState<{
        order: TwapLoOrderDto;
        view: TwapLoDetailView;
    } | null>(null);
    const [detailOrderItems, setDetailOrderItems] = useState<
        OrderBookHistoryItem['reports'] | null
    >(null);
    const [mqttPrefix, setMqttPrefix] = useState<string | null>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const lastRequestedPageRef = useRef<number>(0);

    const { activeSubAccount } = useAuthStore();
    const subAccountId = activeSubAccount?.sub_account_id ?? null;
    const { startLoading, stopLoading } = useLoadingStore();

    const {
        request2FA,
        orders,
        isLoadingOrders,
        isLoadingMoreOrders,
        activeOrderTab,
        nextOrderPage,
        setActiveOrderTab,
        fetchOrders,
        applyRealtimeTransaction,
    } = useTradingStore();

    const isNormalTab = activeOrderTab === ORDER_MODE_KEY.NORMAL;
    const isIcebergTab = activeOrderTab === ORDER_MODE_KEY.ICEBERG;
    const isTwapLoTab = activeOrderTab === ORDER_MODE_KEY.TWAP_LO;

    const handleOrderBookRealtime = useCallback(
        (_topic: string, message: Buffer) => {
            const text = new TextDecoder().decode(new Uint8Array(message));
            const payload = JSON.parse(text);
            const data = payload?.data;
            if (data?.orderId == null) return;
            applyRealtimeTransaction(data);
        },
        [applyRealtimeTransaction],
    );

    const handleOpenOrderDetail = async (orderId: string) => {
        startLoading();
        try {
            const { error_code, message, data } = await fetchOrderBookOrderDetail(
                subAccountId ?? '',
                orderId,
            );
            if (isSuccessApi(error_code)) {
                setDetailOrderItems(data.reports ?? []);
            } else {
                toast.error(message);
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Có lỗi xảy ra, vui lòng thử lại'));
        } finally {
            stopLoading();
        }
    };

    const handleOpenIcebergDetail = (orderId: string, view: TwapLoDetailView = 'detail') => {
        if (!subAccountId) return;
        setIcebergDetail({ orderId, view });
    };

    const handleOpenTwapLoDetail = (orderId: string, view: TwapLoDetailView = 'detail') => {
        if (!subAccountId) return;
        const row = orders.find((order) => order.orderId === orderId);
        if (!row?.twapLoOrder) return;
        setTwapLoDetail({ order: row.twapLoOrder, view });
    };

    useEffect(() => {
        if (!subAccountId) return;
        lastRequestedPageRef.current = 0;
        fetchOrders(subAccountId, activeOrderTab);
    }, [activeOrderTab, subAccountId]);

    useEffect(() => {
        getNotificationsMqttPrefix()
            .then((res) => {
                setMqttPrefix(res.data?.prefix ?? null);
            })
            .catch(() => {});
    }, []);

    useMQTT(
        mqttPrefix ? `${mqttPrefix}/notifications/transaction` : '',
        handleOrderBookRealtime,
        !!mqttPrefix,
    );

    useEffect(() => {
        if (activeOrderTab !== ORDER_MODE_KEY.TAB_247) return;
        if (!subAccountId) return;

        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                const scrollEl = scrollContainerRef.current;
                const isScrollable = scrollEl
                    ? scrollEl.scrollHeight > scrollEl.clientHeight
                    : false;
                if (
                    entry.isIntersecting &&
                    isScrollable &&
                    nextOrderPage > 0 &&
                    nextOrderPage !== lastRequestedPageRef.current &&
                    !isLoadingOrders &&
                    !isLoadingMoreOrders
                ) {
                    lastRequestedPageRef.current = nextOrderPage;
                    fetchOrders(subAccountId, ORDER_MODE_KEY.TAB_247, nextOrderPage);
                }
            },
            { root: scrollContainerRef.current, threshold: 0.1 },
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [activeOrderTab, nextOrderPage, isLoadingOrders, isLoadingMoreOrders, subAccountId]);

    useEffect(() => {
        if (activeOrderTab !== ORDER_MODE_KEY.TAB_247) {
            lastRequestedPageRef.current = 0;
        }
    }, [activeOrderTab]);

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

                    <TradeOrderBookTabs
                        activeOrderTab={activeOrderTab}
                        onTabChange={setActiveOrderTab}
                    />
                </header>

                <div
                    ref={scrollContainerRef}
                    id={`orderbook-${activeOrderTab}-panel`}
                    role="tabpanel"
                    aria-labelledby={activeOrderTab}
                    className="scrollbar w-full flex-1 overflow-x-auto overflow-y-auto min-h-0"
                >
                    {isLoadingOrders ? (
                        <Skeleton />
                    ) : !isLoadingOrders && orders.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-secondary font-caption">{'Chưa có lệnh nào'}</p>
                        </div>
                    ) : (
                        <>
                            <div className="w-full">
                                <table className="w-full table-fixed border-collapse">
                                    <colgroup>
                                        {Array.from({ length: 6 }, (_, index) => (
                                            <col key={index} className="w-1/6" />
                                        ))}
                                    </colgroup>
                                    <thead className="sticky top-0 bg-secondary z-5">
                                        <tr>
                                            <th className="w-1/6 pb-2 font-caption text-secondary whitespace-nowrap px-1 text-left">
                                                {'Mã CP'}
                                            </th>
                                            <th className="w-1/6 pb-2 font-caption text-secondary whitespace-nowrap px-1 text-right">
                                                {isNormalTab || isIcebergTab || isTwapLoTab
                                                    ? 'KL khớp/KL đặt'
                                                    : 'KL đặt'}
                                            </th>
                                            <th className="w-1/6 pb-2 font-caption text-secondary whitespace-nowrap px-1 text-right">
                                                {isNormalTab || isIcebergTab || isTwapLoTab
                                                    ? 'Giá khớp/Giá đặt'
                                                    : 'Giá đặt'}
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
                                        {orders.map((order) => {
                                            if (isNormalTab) {
                                                return (
                                                    <TradeOrderBookRowNormal
                                                        key={order.orderId}
                                                        order={order}
                                                        onOpenDetail={handleOpenOrderDetail}
                                                        onEdit={setUpdateOrder}
                                                        onCancel={setCancelOrder}
                                                    />
                                                );
                                            }
                                            if (isIcebergTab) {
                                                return (
                                                    <TradeOrderBookRowIceberg
                                                        key={order.orderId}
                                                        order={order}
                                                        onOpenDetail={handleOpenIcebergDetail}
                                                        onCancel={(row) =>
                                                            handleOpenIcebergDetail(
                                                                row.orderId,
                                                                'cancel_confirm',
                                                            )
                                                        }
                                                    />
                                                );
                                            }
                                            if (isTwapLoTab) {
                                                return (
                                                    <TradeOrderBookRowTwapLo
                                                        key={order.orderId}
                                                        order={order}
                                                        onOpenDetail={handleOpenTwapLoDetail}
                                                        onCancel={(row) =>
                                                            handleOpenTwapLoDetail(
                                                                row.orderId,
                                                                'cancel_confirm',
                                                            )
                                                        }
                                                    />
                                                );
                                            }
                                            return (
                                                <TradeOrderBookRow247
                                                    key={order.orderId}
                                                    order={order}
                                                    onEdit={setUpdateOrder}
                                                    onCancel={setCancelOrder}
                                                />
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            {activeOrderTab === ORDER_MODE_KEY.TAB_247 && (
                                <div ref={sentinelRef}>
                                    <Spinner isLoading={isLoadingMoreOrders} isOverlay={false} />
                                </div>
                            )}
                        </>
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
                    orderConditionType={updateOrder.orderConditionType}
                    executionDate={updateOrder.executionDate}
                    expiredDate={updateOrder.expiredDate}
                    onClose={() => setUpdateOrder(null)}
                    onSuccess={() => setUpdateOrder(null)}
                    onExpired2FA={() => request2FA(() => setUpdateOrder(updateOrder))}
                />
            )}

            {icebergDetail && (
                <TradeIcebergDetail
                    orderId={icebergDetail.orderId}
                    initialView={icebergDetail.view}
                    onClose={() => setIcebergDetail(null)}
                    onSuccess={() => setIcebergDetail(null)}
                    onExpired2FA={() =>
                        request2FA(() =>
                            handleOpenIcebergDetail(icebergDetail.orderId, icebergDetail.view),
                        )
                    }
                />
            )}

            {twapLoDetail && (
                <TradeTwapLoDetail
                    order={twapLoDetail.order}
                    initialView={twapLoDetail.view}
                    onClose={() => setTwapLoDetail(null)}
                    onSuccess={() => setTwapLoDetail(null)}
                    onExpired2FA={() => request2FA(() => setTwapLoDetail(twapLoDetail))}
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
                    orderConditionType={cancelOrder.orderConditionType}
                    onClose={() => setCancelOrder(null)}
                    onSuccess={() => setCancelOrder(null)}
                    onExpired2FA={() => request2FA(() => setCancelOrder(cancelOrder))}
                />
            )}
        </>
    );
};
