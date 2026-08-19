import { create } from 'zustand';

import { fetchAllStocksInfoV2, fetchStockRealtime } from '@/services/api/datafeed/stock-info';
import type { StockPrice, StocksInfoV2Item } from '@/types/datafeed/stock-info';
import { isSuccessApi } from '@/utils/common';

type DetailModalType = 'stock' | 'index';

type StockInfoStore = {
    selectedStock: StockPrice | null;
    selectedSearchStock: StockPrice | null;
    isOpenDetailModal: boolean;
    detailModalType: DetailModalType;
    detailIndex: string | null;
    allStocks: StocksInfoV2Item[];
    setSelectedStock: (stock: StockPrice | null) => void;
    setSelectedSearchStock: (stock: StockPrice | null) => void;
    setIsOpenDetailModal: (isOpen: boolean) => void;
    openStockDetail: (symbol: string) => void;
    openIndexDetail: (index: string) => void;
    closeStockDetail: () => void;
    fetchStockInfo: (symbol: string, isSearch?: boolean) => Promise<void>;
    fetchAllStocks: () => Promise<void>;
};

let allStocksPromise: Promise<void> | null = null;
let tradingStockRequestId = 0;
let searchStockRequestId = 0;

export const useStockInfoStore = create<StockInfoStore>((set, get) => ({
    selectedStock: null,
    selectedSearchStock: null,
    isOpenDetailModal: false,
    detailModalType: 'stock',
    detailIndex: null,
    allStocks: [],

    setSelectedStock: (stock: StockPrice | null) => set({ selectedStock: stock }),
    setSelectedSearchStock: (stock: StockPrice | null) => set({ selectedSearchStock: stock }),
    setIsOpenDetailModal: (isOpen: boolean) => set({ isOpenDetailModal: isOpen }),

    openStockDetail: (symbol: string) => {
        if (get().selectedStock?.symbol !== symbol) {
            set({ selectedStock: { symbol } as StockPrice });
        }
        set({ isOpenDetailModal: true, detailModalType: 'stock' });
        get().fetchStockInfo(symbol);
    },

    openIndexDetail: (index: string) =>
        set({ isOpenDetailModal: true, detailModalType: 'index', detailIndex: index }),

    closeStockDetail: () =>
        set({
            isOpenDetailModal: false,
            selectedStock: null,
            detailModalType: 'stock',
            detailIndex: null,
        }),

    fetchStockInfo: async (symbol: string, isSearch: boolean = false) => {
        const requestId = isSearch ? ++searchStockRequestId : ++tradingStockRequestId;
        const { error_code, result } = await fetchStockRealtime(symbol);
        const latestRequestId = isSearch ? searchStockRequestId : tradingStockRequestId;
        if (requestId !== latestRequestId) return;
        if (isSuccessApi(error_code)) {
            const item: StockPrice = {
                ...result,
                floorCode: result.floorCode ?? 'STO',
            };
            if (isSearch) {
                set({ selectedSearchStock: item });
            } else {
                set({ selectedStock: item });
            }
        }
    },

    fetchAllStocks: async () => {
        if (get().allStocks.length > 0) return;
        if (allStocksPromise) return allStocksPromise;
        allStocksPromise = (async () => {
            try {
                const { result, error_code } = await fetchAllStocksInfoV2();
                if (isSuccessApi(error_code)) {
                    set({ allStocks: result });
                }
            } finally {
                allStocksPromise = null;
            }
        })();
        return allStocksPromise;
    },
}));
