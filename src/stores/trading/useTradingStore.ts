import { isExpired } from 'react-jwt';
import { create } from 'zustand';

import {
    NORMAL_HISTORY_STATUSES,
    ORDER_MODE_KEY,
    ORDER_SIDE,
    ORDER_TYPE,
    TAB_INFORMATION,
    TRADE_LITERAL,
    TWO_FA_PLACEMENT,
    type TwoFAPlacement,
} from '@/constants/trading';
import { fetchSubAccountIcebergOrders } from '@/services/api/trade/iceberg-orders';
import {
    fetchOrderTypesAllowedForExchange,
    fetchSubAccountActiveOrderBook,
    fetchSubAccountConditionalOrdersPage,
} from '@/services/api/trade/orders';
import { fetchSubAccountTwapLoOrders } from '@/services/api/trade/twap-lo';
import { getAccessToken2FA, removeAccessToken2FA } from '@/services/localStorage';
import { registerResettableStore } from '@/stores/reset-registry';
import type { RealtimeMatchEntry } from '@/types/pages/trading';
import { isSuccessApi } from '@/utils/common';
import {
    mapConditionalOrderToOrder,
    mapNormalOrderToOrder,
    mapRealtimeTransactionToPatch,
} from '@/utils/trading/order-book';
import { mapIcebergOrderToOrder, mapTwapLoOrderToOrder } from '@/utils/trading/panel';

type TradingState = {
    buyPrice: number;
    buyQuantity: number;
    sellPrice: number;
    sellQuantity: number;
    activeTradeSide: string;

    token2fa: string;
    is2FAVisible: boolean;
    twoFAPlacement: TwoFAPlacement | null;
    onAfter2FASuccess: (() => void) | null;

    orders: any[];
    realtimeMatches: Record<string, RealtimeMatchEntry>;
    isLoadingOrders: boolean;
    isLoadingMoreOrders: boolean;
    ordersRequestId: number;
    activeOrderTab: string;
    nextOrderPage: number;
    selectedTabInfor: string;
    isChartFullscreen: boolean;

    orderTypes: string[];
    isLoadingOrderTypes: boolean;
    orderTypesRequestId: number;
    exchangeSession: string;
};

type TradingActions = {
    setBuyPrice: (price: number) => void;
    setBuyQuantity: (qty: number) => void;
    setSellPrice: (price: number) => void;
    setSellQuantity: (qty: number) => void;
    setActiveTradeSide: (side: string) => void;
    setToken2fa: (token: string) => void;
    setActiveOrderTab: (tab: string) => void;
    setOrderTypes: (types: string[]) => void;
    setSelectedTabInfor: (tab: string) => void;
    close2FA: () => void;

    toggleChartFullscreen: () => void;
    check2FAExpiry: () => boolean;
    request2FA: (onSuccess: () => void, placement?: TwoFAPlacement) => void;
    init2FA: (onExpired?: () => void) => void;
    handle2FATokenExpired: (retryCallback?: () => void, placement?: TwoFAPlacement) => void;
    addPlacedOrdersToBook: (rows: any[], placedTab: string) => void;
    patchOrdersInBook: (patches: any[]) => void;
    applyRealtimeTransaction: (data: {
        orderId: number | string;
        matchQuantity?: number;
        averagePrice?: number;
        quantity?: number;
        price?: number;
        status?: string;
    }) => void;
    clearRealtimeMatches: () => void;

    fetchOrders: (subAccountId: string, tab: string, page?: number) => Promise<void>;
    fetchOrderTypes: (exchange: string) => Promise<void>;

    resetStore: () => void;
};

const initialState: TradingState = {
    buyPrice: 0,
    buyQuantity: 0,
    sellPrice: 0,
    sellQuantity: 0,
    activeTradeSide: TRADE_LITERAL.BUY,
    token2fa: '',
    is2FAVisible: false,
    twoFAPlacement: null,
    onAfter2FASuccess: null,
    orders: [],
    realtimeMatches: {},
    isLoadingOrders: false,
    isLoadingMoreOrders: false,
    ordersRequestId: 0,
    activeOrderTab: ORDER_MODE_KEY.NORMAL,
    nextOrderPage: 0,
    selectedTabInfor: TAB_INFORMATION[0].key,
    isChartFullscreen: false,
    orderTypes: [],
    exchangeSession: '',
    isLoadingOrderTypes: false,
    orderTypesRequestId: 0,
};

export const useTradingStore = create<TradingState & TradingActions>((set, get) => ({
    ...initialState,

    setBuyPrice: (price: number) => set({ buyPrice: price }),
    setBuyQuantity: (qty: number) => set({ buyQuantity: qty }),
    setSellPrice: (price: number) => set({ sellPrice: price }),
    setSellQuantity: (qty: number) => set({ sellQuantity: qty }),
    setActiveTradeSide: (side: string) => set({ activeTradeSide: side }),
    setToken2fa: (token: string) => set({ token2fa: token }),
    setActiveOrderTab: (tab: string) => set({ activeOrderTab: tab }),
    setOrderTypes: (types: string[]) => set({ orderTypes: types }),
    setSelectedTabInfor: (tab: string) => set({ selectedTabInfor: tab }),
    close2FA: () => set({ is2FAVisible: false, twoFAPlacement: null, onAfter2FASuccess: null }),

    toggleChartFullscreen: () => set((state) => ({ isChartFullscreen: !state.isChartFullscreen })),

    check2FAExpiry: () => {
        const token2FA = getAccessToken2FA();
        if (!token2FA || isExpired(token2FA)) {
            removeAccessToken2FA();
            return true;
        }
        return false;
    },

    request2FA: (onSuccess: () => void, placement = TWO_FA_PLACEMENT.GLOBAL) => {
        const { check2FAExpiry } = get();
        const isTokenExpired = check2FAExpiry();
        if (isTokenExpired) {
            set({ is2FAVisible: true, twoFAPlacement: placement, onAfter2FASuccess: onSuccess });
        } else {
            onSuccess();
        }
    },

    init2FA: (onExpired?: () => void) => {
        const { check2FAExpiry, request2FA } = get();
        const needsVerify = check2FAExpiry();
        if (needsVerify) {
            request2FA(onExpired || (() => {}));
        }
    },

    handle2FATokenExpired: (retryCallback?: () => void, placement = TWO_FA_PLACEMENT.PANEL) => {
        removeAccessToken2FA();
        set({
            token2fa: '',
            is2FAVisible: true,
            twoFAPlacement: placement,
            onAfter2FASuccess: retryCallback ?? null,
        });
    },

    addPlacedOrdersToBook: (rows: any[], placedTab: string) => {
        if (!rows.length || placedTab !== get().activeOrderTab) return;
        const newIds = new Set(rows.map((row) => row.orderId));
        set((state) => ({
            orders: [...rows, ...state.orders.filter((order) => !newIds.has(order.orderId))],
        }));
    },

    patchOrdersInBook: (patches: any[]) => {
        if (!patches.length) return;
        const byId = new Map(patches.map((patch) => [patch.orderId, patch]));
        set((state) => ({
            orders: state.orders.map((order) =>
                byId.has(order.orderId) ? { ...order, ...byId.get(order.orderId) } : order,
            ),
        }));
    },

    applyRealtimeTransaction: (data) => {
        const patch = mapRealtimeTransactionToPatch(data);
        set((state) => {
            const matchedOrder = state.orders.find((order) => order.orderId === patch.orderId);
            if (!matchedOrder) return state;

            const orders = state.orders.map((order) =>
                order.orderId === patch.orderId ? { ...order, ...patch } : order,
            );

            if (!NORMAL_HISTORY_STATUSES.has(data.status ?? '')) {
                return { orders };
            }

            const quantity = data.matchQuantity ?? 0;
            const price = data.averagePrice ?? 0;
            const entry: RealtimeMatchEntry = {
                orderId: patch.orderId,
                symbol: matchedOrder.symbol,
                side: matchedOrder.type === ORDER_TYPE.BUY ? ORDER_SIDE.BUY : ORDER_SIDE.SELL,
                quantity,
                price,
                volume: quantity * price,
                status: patch.status,
            };

            return {
                orders,
                realtimeMatches: { ...state.realtimeMatches, [patch.orderId]: entry },
            };
        });
    },

    clearRealtimeMatches: () => set({ realtimeMatches: {} }),

    fetchOrders: async (subAccountId: string, tab: string, page = 1) => {
        const isPagination = tab === ORDER_MODE_KEY.TAB_247 && page > 1;
        const requestId = get().ordersRequestId + 1;
        set(
            isPagination
                ? { isLoadingMoreOrders: true, ordersRequestId: requestId }
                : { isLoadingOrders: true, ordersRequestId: requestId },
        );
        try {
            if (tab === ORDER_MODE_KEY.NORMAL) {
                const { result, error_code } = await fetchSubAccountActiveOrderBook(subAccountId);
                if (get().ordersRequestId !== requestId) return;

                if (isSuccessApi(error_code)) {
                    set({ orders: result.map(mapNormalOrderToOrder), nextOrderPage: 0 });
                }
            } else if (tab === ORDER_MODE_KEY.ICEBERG) {
                const { data, error_code } = await fetchSubAccountIcebergOrders(subAccountId);
                if (get().ordersRequestId !== requestId) return;

                if (isSuccessApi(error_code)) {
                    set({ orders: data.map(mapIcebergOrderToOrder), nextOrderPage: 0 });
                }
            } else if (tab === ORDER_MODE_KEY.TWAP_LO) {
                const { data, error_code } = await fetchSubAccountTwapLoOrders(subAccountId);
                if (get().ordersRequestId !== requestId) return;

                if (isSuccessApi(error_code)) {
                    set({
                        orders: (data.content ?? []).map(mapTwapLoOrderToOrder),
                        nextOrderPage: 0,
                    });
                }
            } else {
                const { data, error_code } = await fetchSubAccountConditionalOrdersPage(
                    subAccountId,
                    page,
                );
                if (get().ordersRequestId !== requestId) return;

                if (isSuccessApi(error_code)) {
                    const newOrders = data.data.map(mapConditionalOrderToOrder);
                    set((state) => ({
                        orders: page === 1 ? newOrders : [...state.orders, ...newOrders],
                        nextOrderPage: data.nextPage ?? 0,
                    }));
                }
            }
        } catch {
        } finally {
            if (get().ordersRequestId !== requestId) return;
            set({ isLoadingOrders: false, isLoadingMoreOrders: false });
        }
    },

    fetchOrderTypes: async (exchange: string) => {
        const requestId = get().orderTypesRequestId + 1;
        set({ isLoadingOrderTypes: true, orderTypesRequestId: requestId });
        try {
            const { result, error_code } = await fetchOrderTypesAllowedForExchange(exchange);
            if (get().orderTypesRequestId !== requestId) return;

            if (isSuccessApi(error_code)) {
                set({
                    orderTypes: result?.available_order_types || [],
                    exchangeSession: result?.exchange_session || '',
                });
            }
        } catch {
        } finally {
            if (get().orderTypesRequestId !== requestId) return;
            set({ isLoadingOrderTypes: false });
        }
    },

    resetStore: () => set({ ...initialState }),
}));

registerResettableStore(useTradingStore);
