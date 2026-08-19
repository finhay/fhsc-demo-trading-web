import { create } from 'zustand';

import { TRANSFER_TYPE } from '@/constants/haypoint';
import { fetchHaypointTransactionHistory, fetchUserHaypoint } from '@/services/api/reward';
import { registerResettableStore } from '@/stores/reset-registry';
import { PointHistoryItem } from '@/types/reward';
import { isSuccessApi } from '@/utils/common';

type PointState = {
    points: number;
    isLoadingPoints: boolean;
    historyPointIn: PointHistoryItem[];
    historyPointOut: PointHistoryItem[];
    nextOffsetIn: number | null;
    nextOffsetOut: number | null;
    isLoadingMoreIn: boolean;
    isLoadingMoreOut: boolean;
};

type PointActions = {
    fetchPointBalance: () => Promise<void>;
    fetchPointHistories: () => Promise<void>;
    loadMorePointInHistories: () => Promise<void>;
    loadMorePointOutHistories: () => Promise<void>;
    resetStore: () => void;
};

const initialState: PointState = {
    points: 0,
    isLoadingPoints: true,
    historyPointIn: [],
    historyPointOut: [],
    nextOffsetIn: null,
    nextOffsetOut: null,
    isLoadingMoreIn: false,
    isLoadingMoreOut: false,
};

export const usePointStore = create<PointState & PointActions>((set, get) => ({
    ...initialState,

    fetchPointBalance: async () => {
        set({ isLoadingPoints: true });
        try {
            const { data, error_code } = await fetchUserHaypoint();
            if (isSuccessApi(error_code)) {
                set({ points: data.amount });
            } else {
                set({ points: 0 });
            }
        } catch {
            set({ points: 0 });
        } finally {
            set({ isLoadingPoints: false });
        }
    },

    fetchPointHistories: async () => {
        try {
            const [responseIn, responseOut] = await Promise.all([
                fetchHaypointTransactionHistory(TRANSFER_TYPE.IN),
                fetchHaypointTransactionHistory(TRANSFER_TYPE.OUT),
            ]);

            if (isSuccessApi(responseIn.error_code) && isSuccessApi(responseOut.error_code)) {
                set({
                    historyPointIn: responseIn.data.histories,
                    historyPointOut: responseOut.data.histories,
                    nextOffsetIn: responseIn.data.next_offset,
                    nextOffsetOut: responseOut.data.next_offset,
                });
            } else {
                set({
                    historyPointIn: [],
                    historyPointOut: [],
                    nextOffsetIn: null,
                    nextOffsetOut: null,
                });
            }
        } catch {
            set({
                historyPointIn: [],
                historyPointOut: [],
                nextOffsetIn: null,
                nextOffsetOut: null,
            });
        }
    },

    loadMorePointInHistories: async () => {
        const { isLoadingMoreIn, nextOffsetIn } = get();
        if (isLoadingMoreIn || nextOffsetIn === null) return;

        set({ isLoadingMoreIn: true });
        try {
            const { data, error_code, message } = await fetchHaypointTransactionHistory(
                TRANSFER_TYPE.IN,
                nextOffsetIn,
            );
            if (isSuccessApi(error_code)) {
                set((state) => ({
                    historyPointIn: [...state.historyPointIn, ...data.histories],
                    nextOffsetIn: data.next_offset,
                }));
            } else {
                throw new Error(message);
            }
        } catch {
        } finally {
            set({ isLoadingMoreIn: false });
        }
    },

    loadMorePointOutHistories: async () => {
        const { isLoadingMoreOut, nextOffsetOut } = get();
        if (isLoadingMoreOut || nextOffsetOut === null) return;

        set({ isLoadingMoreOut: true });
        try {
            const { data, error_code, message } = await fetchHaypointTransactionHistory(
                TRANSFER_TYPE.OUT,
                nextOffsetOut,
            );
            if (isSuccessApi(error_code)) {
                set((state) => ({
                    historyPointOut: [...state.historyPointOut, ...data.histories],
                    nextOffsetOut: data.next_offset,
                }));
            } else {
                throw new Error(message);
            }
        } catch {
        } finally {
            set({ isLoadingMoreOut: false });
        }
    },

    resetStore: () => {
        set(initialState);
    },
}));

registerResettableStore(usePointStore);
