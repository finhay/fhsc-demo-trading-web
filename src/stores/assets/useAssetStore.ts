import { create } from 'zustand';

import { fetchPaperAccountPortfolio } from '@/services/api/paper-trading/account';
import { usePaperAccountStore } from '@/stores/paper-trading/usePaperAccountStore';
import { registerResettableStore } from '@/stores/reset-registry';
import type { AssetsSummary } from '@/types/accounts/assets';
import type { PortfolioItem } from '@/types/trade/portfolio';
import { isSuccessApi } from '@/utils/common';
import { buildPaperAssetsSummary } from '@/utils/paper-trading/assets';
import { mapPaperPortfolioItem } from '@/utils/paper-trading/portfolio';

type AssetState = {
    assetsSummary: AssetsSummary | null;
    isSummaryLoading: boolean;
    portfolio: PortfolioItem[];
    isPortfolioLoading: boolean;
};

type AssetActions = {
    fetchAssetsSummary: () => Promise<void>;
    fetchPortfolio: () => Promise<void>;
    setSummaryLoading: (loading: boolean) => void;
    resetStore: () => void;
};

const initialState: AssetState = {
    assetsSummary: null,
    isSummaryLoading: true,
    portfolio: [],
    isPortfolioLoading: true,
};

export const useAssetStore = create<AssetState & AssetActions>((set) => ({
    ...initialState,

    /** Tổng quan / phân bổ dựng từ `GET /v1/accounts/{id}/asset`. */
    fetchAssetsSummary: async () => {
        set({ isSummaryLoading: true });
        try {
            await usePaperAccountStore.getState().fetchAsset();
            const { asset } = usePaperAccountStore.getState();
            set({ assetsSummary: buildPaperAssetsSummary(asset) });
        } finally {
            set({ isSummaryLoading: false });
        }
    },

    fetchPortfolio: async () => {
        const { accountId } = usePaperAccountStore.getState();
        if (!accountId) {
            set({ portfolio: [], isPortfolioLoading: false });
            return;
        }

        set({ isPortfolioLoading: true });
        try {
            const { data, error_code } = await fetchPaperAccountPortfolio(accountId);
            if (isSuccessApi(error_code)) {
                const portfolio = (data?.portfolio ?? []).map(mapPaperPortfolioItem);
                set({ portfolio });
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
