import { create } from 'zustand';

import { DEFAULT_PARAMS } from '@/constants/haypoint';
import { fetchVoucherAcceptanceStores } from '@/services/api/reward';
import { registerResettableStore } from '@/stores/reset-registry';
import { OfficeItem } from '@/types/reward';
import { isSuccessApi } from '@/utils/common';

type OfficeListState = {
    offices: OfficeItem[];
    rewardId: string | null;
    isLoadingMore: boolean;
    hasMore: boolean;
    currentPage: number;
    totalPage: number;
    searchKeyword: string;
};

type OfficeListActions = {
    fetchOwnedRewardOffices: (rewardId: string, forceRefresh?: boolean) => Promise<void>;
    searchOffices: (keyword: string) => Promise<void>;
    loadMoreOffices: () => Promise<void>;
    resetStore: () => void;
};

const initialState: OfficeListState = {
    offices: [],
    rewardId: null,
    isLoadingMore: false,
    hasMore: false,
    currentPage: DEFAULT_PARAMS.PAGE,
    totalPage: 0,
    searchKeyword: '',
};

export const useOfficeListStore = create<OfficeListState & OfficeListActions>((set, get) => ({
    ...initialState,

    fetchOwnedRewardOffices: async (rewardId: string, forceRefresh = false) => {
        const { rewardId: currentRewardId, offices } = get();

        if (!forceRefresh && rewardId === currentRewardId && offices.length > 0) {
            return;
        }

        set({ rewardId, searchKeyword: '' });
        try {
            const { data, error_code } = await fetchVoucherAcceptanceStores(
                rewardId,
                DEFAULT_PARAMS.PAGE,
            );
            if (isSuccessApi(error_code)) {
                set({
                    offices: data.content || [],
                    hasMore: data.page < data.total_page,
                    currentPage: DEFAULT_PARAMS.PAGE,
                    totalPage: data.total_page,
                });
            } else {
                set({ offices: [], hasMore: false, totalPage: 0 });
            }
        } catch {
            set({ offices: [], hasMore: false, totalPage: 0 });
        }
    },

    searchOffices: async (keyword: string) => {
        const { rewardId } = get();
        if (!rewardId) return;

        set({ searchKeyword: keyword });
        try {
            const { data, error_code } = await fetchVoucherAcceptanceStores(
                rewardId,
                DEFAULT_PARAMS.PAGE,
                keyword,
            );
            if (isSuccessApi(error_code)) {
                set({
                    offices: data.content || [],
                    hasMore: data.page < data.total_page,
                    currentPage: DEFAULT_PARAMS.PAGE,
                    totalPage: data.total_page,
                });
            } else {
                set({ offices: [], hasMore: false, totalPage: 0 });
            }
        } catch {
            set({ offices: [], hasMore: false, totalPage: 0 });
        }
    },

    loadMoreOffices: async () => {
        const { rewardId, isLoadingMore, hasMore, currentPage, totalPage, searchKeyword } = get();
        if (!rewardId || isLoadingMore || !hasMore) return;

        const nextPage = currentPage + 1;
        if (nextPage > totalPage) return;

        set({ isLoadingMore: true });
        try {
            const { data, error_code, message } = await fetchVoucherAcceptanceStores(
                rewardId,
                nextPage,
                searchKeyword,
            );
            if (isSuccessApi(error_code)) {
                set((state) => ({
                    offices: [...state.offices, ...(data.content || [])],
                    hasMore: data.page < data.total_page,
                    currentPage: nextPage,
                }));
            } else {
                throw new Error(message);
            }
        } catch {
        } finally {
            set({ isLoadingMore: false });
        }
    },

    resetStore: () => {
        set(initialState);
    },
}));

registerResettableStore(useOfficeListStore);
