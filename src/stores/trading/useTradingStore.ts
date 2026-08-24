import { create } from 'zustand';

import { TAB_INFORMATION, TRADE_LITERAL } from '@/constants/trading';
import { fetchPaperOrderBook } from '@/services/api/paper-trading/orders';
import { registerResettableStore } from '@/stores/reset-registry';
import type { TradeOrderBookRow } from '@/types/pages/trading';
import { isSuccessApi } from '@/utils/common';
import { mapPaperOrderToRow } from '@/utils/paper-trading/order-book';

type TradingState = {
    buyPrice: number;
    buyQuantity: number;
    sellPrice: number;
    sellQuantity: number;
    activeTradeSide: string;

    orders: TradeOrderBookRow[];
    isLoadingOrders: boolean;
    ordersRequestId: number;
    selectedTabInfor: string;
    isChartFullscreen: boolean;
};

type TradingActions = {
    setBuyPrice: (price: number) => void;
    setBuyQuantity: (qty: number) => void;
    setSellPrice: (price: number) => void;
    setSellQuantity: (qty: number) => void;
    setActiveTradeSide: (side: string) => void;
    setSelectedTabInfor: (tab: string) => void;

    toggleChartFullscreen: () => void;
    addPlacedOrdersToBook: (rows: TradeOrderBookRow[]) => void;
    patchOrdersInBook: (patches: Partial<TradeOrderBookRow>[]) => void;

    fetchOrders: (accountId: string, options?: { silent?: boolean }) => Promise<void>;

    resetStore: () => void;
};

const initialState: TradingState = {
    buyPrice: 0,
    buyQuantity: 0,
    sellPrice: 0,
    sellQuantity: 0,
    activeTradeSide: TRADE_LITERAL.BUY,
    orders: [],
    isLoadingOrders: false,
    ordersRequestId: 0,
    selectedTabInfor: TAB_INFORMATION[0].key,
    isChartFullscreen: false,
};

export const useTradingStore = create<TradingState & TradingActions>((set, get) => ({
    ...initialState,

    setBuyPrice: (price: number) => set({ buyPrice: price }),
    setBuyQuantity: (qty: number) => set({ buyQuantity: qty }),
    setSellPrice: (price: number) => set({ sellPrice: price }),
    setSellQuantity: (qty: number) => set({ sellQuantity: qty }),
    setActiveTradeSide: (side: string) => set({ activeTradeSide: side }),
    setSelectedTabInfor: (tab: string) => set({ selectedTabInfor: tab }),

    toggleChartFullscreen: () => set((state) => ({ isChartFullscreen: !state.isChartFullscreen })),

    addPlacedOrdersToBook: (rows) => {
        if (!rows.length) return;
        const newIds = new Set(rows.map((row) => row.orderId));
        set((state) => ({
            orders: [...rows, ...state.orders.filter((order) => !newIds.has(order.orderId))],
        }));
    },

    patchOrdersInBook: (patches) => {
        if (!patches.length) return;
        const byId = new Map(patches.map((patch) => [patch.orderId, patch]));
        set((state) => ({
            orders: state.orders.map((order) =>
                byId.has(order.orderId) ? { ...order, ...byId.get(order.orderId) } : order,
            ),
        }));
    },

    /** `silent` dùng cho các tick polling — không bật skeleton để bảng khỏi nhấp nháy. */
    fetchOrders: async (accountId: string, options?: { silent?: boolean }) => {
        const requestId = get().ordersRequestId + 1;
        set({ ordersRequestId: requestId, ...(options?.silent ? {} : { isLoadingOrders: true }) });
        try {
            const { data, error_code } = await fetchPaperOrderBook(accountId);
            if (get().ordersRequestId !== requestId) return;

            if (isSuccessApi(error_code)) {
                set({ orders: (data ?? []).map(mapPaperOrderToRow) });
            }
        } catch {
        } finally {
            if (get().ordersRequestId !== requestId) return;
            set({ isLoadingOrders: false });
        }
    },

    resetStore: () => set({ ...initialState }),
}));

registerResettableStore(useTradingStore);
