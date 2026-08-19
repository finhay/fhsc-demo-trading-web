import { create } from 'zustand';

import { getAssetsSummaryV3, getAssetsSummaryV4 } from '@/services/api/accounts/assets';
import { getSubAccountTransaction } from '@/services/api/payments';
import { fetchSubAccountStockPortfolio } from '@/services/api/trade/portfolio';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { registerResettableStore } from '@/stores/reset-registry';
import type { AssetsSummary } from '@/types/accounts/assets';
import type { SubAccountTransactionItem } from '@/types/payments';
import type { PortfolioItem } from '@/types/trade/portfolio';
import { isSuccessApi } from '@/utils/common';

type AssetState = {
    transactions: SubAccountTransactionItem[];
    currentPage: number;
    hasMoreData: boolean;
    isInitialLoading: boolean;
    isLoadingMore: boolean;
    subAccountId: string | null;
    assetsSummary: AssetsSummary | null;
    isSummaryLoading: boolean;
    portfolio: PortfolioItem[];
    isPortfolioLoading: boolean;
};

type AssetActions = {
    loadMoreTransactions: () => Promise<void>;
    refetchTransactions: (subAccountId: string) => Promise<void>;
    fetchTransactions: (subAccountId: string, page: number, shouldReset?: boolean) => Promise<void>;
    fetchAssetsSummary: () => Promise<void>;
    fetchPortfolio: (subAccountId?: string) => Promise<void>;
    setSummaryLoading: (loading: boolean) => void;
    resetStore: () => void;
};

const TRANSACTION_PAGE_SIZE = 20;

const initialState: AssetState = {
    transactions: [],
    currentPage: 1,
    hasMoreData: true,
    isInitialLoading: true,
    isLoadingMore: false,
    subAccountId: null,
    assetsSummary: null,
    isSummaryLoading: true,
    portfolio: [],
    isPortfolioLoading: true,
};

export const useAssetStore = create<AssetState & AssetActions>((set, get) => ({
    ...initialState,

    loadMoreTransactions: async () => {
        const { currentPage, subAccountId, isInitialLoading, isLoadingMore, hasMoreData } = get();

        if (!subAccountId || isInitialLoading || isLoadingMore || !hasMoreData) return;

        await get().fetchTransactions(subAccountId, currentPage, false);
    },

    refetchTransactions: async (subAccountId: string) => {
        set({
            transactions: [],
            currentPage: 1,
            hasMoreData: true,
            subAccountId,
        });
        await get().fetchTransactions(subAccountId, 1, true);
    },

    fetchTransactions: async (subAccountId: string, page: number, shouldReset = false) => {
        set(
            shouldReset
                ? { isInitialLoading: true, isLoadingMore: false }
                : { isLoadingMore: true, isInitialLoading: false },
        );

        try {
            const { data, error_code } = await getSubAccountTransaction(
                subAccountId,
                page,
                'COMPLETED',
            );

            if (isSuccessApi(error_code)) {
                const items = Array.isArray(data.transactions) ? data.transactions : [];
                set((state) => ({
                    transactions: shouldReset ? items : [...state.transactions, ...items],
                    currentPage: page + 1,
                    hasMoreData: items.length >= TRANSACTION_PAGE_SIZE,
                }));
            } else {
                set({ hasMoreData: false });
            }
        } catch {
            set({ hasMoreData: false });
        } finally {
            set({
                isInitialLoading: false,
                isLoadingMore: false,
            });
        }
    },

    fetchAssetsSummary: async () => {
        set({ isSummaryLoading: true });
        try {
            const { profile } = useAuthStore.getState();
            const { data, error_code } =
                profile?.ekyc_level === 'LEVEL_0'
                    ? await getAssetsSummaryV4()
                    : await getAssetsSummaryV3();
            if (isSuccessApi(error_code)) {
                set({ assetsSummary: data });
            }
        } finally {
            set({ isSummaryLoading: false });
        }
    },

    fetchPortfolio: async (subAccountId?: string) => {
        if (!subAccountId) {
            set({ portfolio: [], isPortfolioLoading: false });
            return;
        }
        set({ isPortfolioLoading: true });
        try {
            const { data, error_code } = await fetchSubAccountStockPortfolio(subAccountId);
            if (isSuccessApi(error_code)) {
                set({ portfolio: data.portfolio || [] });
            }
        } catch {
            set({ portfolio: [] });
        } finally {
            set({ isPortfolioLoading: false });
        }
    },

    setSummaryLoading: (loading: boolean) => set({ isSummaryLoading: loading }),

    resetStore: () => set(initialState),
}));

registerResettableStore(useAssetStore);
