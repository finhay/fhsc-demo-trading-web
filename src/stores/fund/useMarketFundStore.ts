import { create } from 'zustand';

import {
    EMPTY_FUND_MARKET_SUMMARY,
    FUND_LIST_TABS,
    FUND_NAV_CHART_DEFAULT_PERIOD,
} from '@/constants/market';
import {
    fetchFundCertificateDetail,
    fetchFundCertificateList,
    fetchFundCertificates,
    fetchFundListing,
    fetchFundMarketSummary,
    fetchFundNavHistories,
    fetchFundTopFundFlow,
    fetchFundTopGrowth,
} from '@/services/api/fund';
import { getAccessToken } from '@/services/localStorage';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import type {
    FundCertificateDetail,
    FundCertificateItem,
    FundListing,
    FundMarketSummary,
    FundNavHistoryItem,
    FundTopFundFlowItem,
    FundTopGrowthItem,
} from '@/types/pages/fund';
import { isSuccessApi } from '@/utils/common';

type MarketFundState = {
    isOpen: boolean;
    selectedFundName: string | null;

    certificates: FundCertificateItem[];

    summary: FundMarketSummary;
    topInvestor: FundTopGrowthItem[];
    topAum: FundTopGrowthItem[];
    topFundFlow: FundTopFundFlowItem[];
    hasSummaryData: boolean;

    detail: FundCertificateDetail | null;
    listing: FundListing | null;
    navHistories: FundNavHistoryItem[];
};

type MarketFundActions = {
    fetchCertificates: () => Promise<void>;
    fetchPublicCertificates: () => Promise<void>;
    fetchSummary: () => Promise<void>;
    fetchDetail: (fundName: string) => Promise<boolean>;
    openSummary: () => Promise<void>;
    openDetail: (fundName: string) => Promise<void>;
    selectFund: (fundName: string) => Promise<void>;
    backToSummary: () => Promise<void>;
    closeModal: () => void;
    clearSummary: () => void;
    clearDetail: () => void;
    resetStore: () => void;
};

const initialState: MarketFundState = {
    isOpen: false,
    selectedFundName: null,

    certificates: [],

    summary: EMPTY_FUND_MARKET_SUMMARY,
    topInvestor: [],
    topAum: [],
    topFundFlow: [],
    hasSummaryData: false,

    detail: null,
    listing: null,
    navHistories: [],
};

let detailRequestId = 0;

export const useMarketFundStore = create<MarketFundState & MarketFundActions>((set, get) => ({
    ...initialState,

    fetchCertificates: async () => {
        if (!getAccessToken()) {
            await get().fetchPublicCertificates();
            return;
        }

        try {
            const { data, error_code } = await fetchFundCertificateList();
            if (isSuccessApi(error_code) && (data?.length ?? 0) > 0) {
                set({ certificates: data ?? [] });
                return;
            }
        } catch {
            await get().fetchPublicCertificates();
            return;
        }

        await get().fetchPublicCertificates();
    },

    fetchPublicCertificates: async () => {
        const results = await Promise.allSettled(
            FUND_LIST_TABS.map((fundType) =>
                fetchFundCertificates(fundType).then((response) => ({ fundType, response })),
            ),
        );

        const merged: FundCertificateItem[] = [];
        const seen = new Set<string>();

        results.forEach((result) => {
            if (result.status !== 'fulfilled') return;
            const { fundType, response } = result.value;
            const { data, error_code } = response;
            if (!isSuccessApi(error_code)) return;
            (data ?? []).forEach((item) => {
                if (seen.has(item.name)) return;
                seen.add(item.name);
                merged.push({ ...item, type: item.type || fundType });
            });
        });

        set({ certificates: merged });
    },

    fetchSummary: async () => {
        try {
            const [summaryResult, investorResult, aumResult, flowResult] = await Promise.allSettled(
                [
                    fetchFundMarketSummary(),
                    fetchFundTopGrowth('INVESTOR'),
                    fetchFundTopGrowth('AUM'),
                    fetchFundTopFundFlow(),
                ],
            );

            const investors =
                investorResult.status === 'fulfilled' &&
                isSuccessApi(investorResult.value.error_code)
                    ? (investorResult.value.data ?? [])
                    : [];
            const aums =
                aumResult.status === 'fulfilled' && isSuccessApi(aumResult.value.error_code)
                    ? (aumResult.value.data ?? [])
                    : [];
            const flows =
                flowResult.status === 'fulfilled' && isSuccessApi(flowResult.value.error_code)
                    ? (flowResult.value.data ?? [])
                    : [];

            let summary = EMPTY_FUND_MARKET_SUMMARY;
            if (
                summaryResult.status === 'fulfilled' &&
                isSuccessApi(summaryResult.value.error_code) &&
                summaryResult.value.data
            ) {
                const data = summaryResult.value.data;
                summary = {
                    month: data.month ?? null,
                    fundsBeatingVnIndex: data.funds_beating_vn_index ?? null,
                    netFundFlow: data.net_fund_flow ?? null,
                    aumChangePercent: data.aum_change_percent ?? null,
                };
            }

            set({
                summary,
                topInvestor: investors,
                topAum: aums,
                topFundFlow: flows,
                hasSummaryData: true,
            });
        } catch {
            set({
                summary: EMPTY_FUND_MARKET_SUMMARY,
                topInvestor: [],
                topAum: [],
                topFundFlow: [],
                hasSummaryData: true,
            });
        }
    },

    fetchDetail: async (fundName) => {
        const requestId = ++detailRequestId;
        try {
            const [detailResult, listingResult, navResult] = await Promise.all([
                fetchFundCertificateDetail(fundName),
                fetchFundListing(fundName),
                fetchFundNavHistories(fundName, FUND_NAV_CHART_DEFAULT_PERIOD),
            ]);
            if (requestId !== detailRequestId) return false;

            const detail = isSuccessApi(detailResult.error_code)
                ? (detailResult.result ?? null)
                : null;
            if (!detail) return false;

            set({
                selectedFundName: fundName,
                detail,
                listing: isSuccessApi(listingResult.error_code)
                    ? (listingResult.data ?? null)
                    : null,
                navHistories: isSuccessApi(navResult.error_code)
                    ? (navResult.result?.nav_histories ?? [])
                    : [],
            });
            return true;
        } catch {
            return false;
        }
    },

    openSummary: async () => {
        const { startLoading, stopLoading } = useLoadingStore.getState();
        startLoading();
        try {
            await get().fetchSummary();
            set({ isOpen: true, selectedFundName: null });
        } finally {
            stopLoading();
        }
    },

    openDetail: async (fundName) => {
        const { startLoading, stopLoading } = useLoadingStore.getState();
        startLoading();
        try {
            const isLoaded = await get().fetchDetail(fundName);
            if (isLoaded) set({ isOpen: true });
        } finally {
            stopLoading();
        }
    },

    selectFund: async (fundName) => {
        const { startLoading, stopLoading } = useLoadingStore.getState();
        startLoading();
        try {
            await get().fetchDetail(fundName);
        } finally {
            stopLoading();
        }
    },

    backToSummary: async () => {
        get().clearDetail();
        if (get().hasSummaryData) return;

        const { startLoading, stopLoading } = useLoadingStore.getState();
        startLoading();
        try {
            await get().fetchSummary();
        } finally {
            stopLoading();
        }
    },

    closeModal: () => {
        get().clearSummary();
        get().clearDetail();
        set({ isOpen: false });
    },

    clearSummary: () => {
        set({
            summary: EMPTY_FUND_MARKET_SUMMARY,
            topInvestor: [],
            topAum: [],
            topFundFlow: [],
            hasSummaryData: false,
        });
    },

    clearDetail: () => {
        detailRequestId += 1;
        set({
            selectedFundName: null,
            detail: null,
            listing: null,
            navHistories: [],
        });
    },

    resetStore: () => {
        set(initialState);
    },
}));
