import { create } from 'zustand';

import {
    BTN_ORDERS_HISTORIES,
    BTN_OWNERSHIP_HISTORIES,
    TERM_BUY_FLOW_STEPS,
    TERM_SELL_FLOW_STEPS,
} from '@/constants/haybond';
import { toast } from '@/hooks/lib/useToast';
import { getTranslate } from '@/hooks/useTranslate';
import { fetchHayBondOrdersHistories } from '@/services/api/bond-enterprise/orders';
import {
    fetchHayBondPackages as fetchPackages,
    fetchHayBondPackagesDynamic as fetchPackagesDynamic,
} from '@/services/api/bond-enterprise/packages';
import {
    fetchHayBondDynamicOwnershipHistories,
    fetchHayBondOwnershipHistories,
} from '@/services/api/bond-enterprise/saving-books';
import { registerResettableStore } from '@/stores/reset-registry';
import type { HaybondOrdersHistoryItem } from '@/types/bond-enterprise/orders';
import type { HaybondPackageItem } from '@/types/bond-enterprise/packages';
import type {
    HaybondDynamicOwnershipHistoryItem,
    HaybondOwnershipHistoryItem,
    HaybondSavingBookDetailData,
} from '@/types/bond-enterprise/saving-books';
import type {
    HaybondClosingPreviewUi,
    HaybondTermBuyData,
    HaybondTermBuyFlowStep,
    HaybondTermSellFlowStep,
} from '@/types/pages/haybond';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';

type Paginated<T> = {
    isLoading: boolean;
    isLoadMore: boolean;
    content: T[];
    page: number;
    totalPages: number;
};

type State = {
    packages: HaybondPackageItem[];
    packagesDynamic: HaybondPackageItem[];
    isLoadingPackages: boolean;
    ownershipHistories: Paginated<HaybondOwnershipHistoryItem>;
    ownershipHistoriesDynamic: Paginated<HaybondDynamicOwnershipHistoryItem>;
    ordersHistories: Paginated<HaybondOrdersHistoryItem>;
    ownershipFilter: string;
    ordersFilter: string;
    isOverlayLoading: boolean;
    acceptTC: boolean;
    termBuyData: HaybondTermBuyData;
    dataClosing: HaybondClosingPreviewUi;
    dataDetailSaving: Omit<HaybondSavingBookDetailData, 'estimate_date_receive_coupon'> & {
        allow_close: boolean;
        message: string;
        end_expect?: string;
        close_date?: string | null;
        end_early_interest_rate?: number;
        estimate_date_receive_coupon?: string | null;
    };
    isBuyOpen: boolean;
    buyStep: HaybondTermBuyFlowStep;
    buyPackageId: number;
    isSellOpen: boolean;
    sellStep: HaybondTermSellFlowStep;
    sellSavingBookId: string;
};

type Actions = {
    loadHome: () => Promise<void>;
    fetchOwnershipHistories: (params?: {
        page?: number;
        status?: string;
        isLoadMore?: boolean;
    }) => Promise<void>;
    fetchOwnershipHistoriesDynamic: (params?: {
        page?: number;
        status?: string;
        isLoadMore?: boolean;
    }) => Promise<void>;
    fetchOrdersHistories: (params?: {
        page?: number;
        status?: string;
        isLoadMore?: boolean;
    }) => Promise<void>;
    setOwnershipFilter: (status: string) => void;
    setOrdersFilter: (status: string) => void;
    setIsOverlayLoading: (value: boolean) => void;
    setAcceptTC: (value: boolean) => void;
    setTermBuyData: (data: Partial<HaybondTermBuyData>) => void;
    setDataClosing: (data: Partial<HaybondClosingPreviewUi>) => void;
    setDataDetailSaving: (data: Partial<State['dataDetailSaving']>) => void;
    resetTermBuyData: () => void;
    openBuy: (packageId: number) => void;
    setBuyStep: (step: HaybondTermBuyFlowStep) => void;
    resetBuyFlow: () => void;
    openSell: (savingBookId: string) => void;
    setSellStep: (step: HaybondTermSellFlowStep) => void;
    resetSellFlow: () => void;
    resetStore: () => void;
};

const emptyPaginated = <T>(): Paginated<T> => ({
    isLoading: true,
    isLoadMore: false,
    content: [],
    page: 0,
    totalPages: 0,
});

const initialTermBuyData: HaybondTermBuyData = {
    symbol: '',
    bondAmount: 0,
    price: 0,
    start: '',
    status: '',
    packageInfo: {
        id: 0,
        name: '',
        interest_rate: 0,
    },
    estimateInfo: {
        estimated_quantity: 0,
        total_amount: 0,
        estimated_profit: 0,
        execute_at: '',
        fee: 0,
    },
    agreementData: [],
    contract: {
        pathFile: '',
        signed: false,
        title: '',
    },
    isOrderList: false,
};

const initialDataClosing: HaybondClosingPreviewUi = {
    id: '',
    name: '',
    start_date: '',
    execute_date: '',
    amount: 0,
    early_profit: 0,
    profit: 0,
    trading_fee: 0,
    net_amount: 0,
    symbol: '',
    quantity: 0,
    price: 0,
};

const initialState: State = {
    packages: [],
    packagesDynamic: [],
    isLoadingPackages: true,
    ownershipHistories: emptyPaginated(),
    ownershipHistoriesDynamic: emptyPaginated(),
    ordersHistories: emptyPaginated(),
    ownershipFilter: BTN_OWNERSHIP_HISTORIES.KEY_ALL,
    ordersFilter: BTN_ORDERS_HISTORIES.KEY_ALL,
    isOverlayLoading: false,
    acceptTC: false,
    termBuyData: initialTermBuyData,
    dataClosing: initialDataClosing,
    dataDetailSaving: {
        allow_close: false,
        message: '',
        total_amount: 0,
        interest_rate: 0,
        estimate_date_receive_coupon: null,
        gross_profit: 0,
        delta_buy_sell: 0,
        coupon_amount: 0,
        days_in_period: 0,
        sell_early: false,
        cash_histories: [],
        start: '',
        end: '',
        symbol: '',
        status: '',
        term: { term_name: '', term: 0 },
        fee: 0,
        tax: 0,
    },
    isBuyOpen: false,
    buyStep: TERM_BUY_FLOW_STEPS.ORDER,
    buyPackageId: 0,
    isSellOpen: false,
    sellStep: TERM_SELL_FLOW_STEPS.WARNING,
    sellSavingBookId: '',
};

export const useHaybondStore = create<State & Actions>((set, get) => ({
    ...initialState,

    loadHome: async () => {
        set({ isLoadingPackages: true });
        try {
            const [packagesRes, packagesDynamicRes] = await Promise.all([
                fetchPackages(),
                fetchPackagesDynamic(),
            ]);
            if (isSuccessApi(packagesRes.error_code)) {
                set({ packages: packagesRes.data });
            } else {
                toast.error(packagesRes.message);
            }
            if (isSuccessApi(packagesDynamicRes.error_code)) {
                set({ packagesDynamic: packagesDynamicRes.data });
            } else {
                toast.error(packagesDynamicRes.message);
            }
            await Promise.all([
                get().fetchOwnershipHistories({
                    page: 1,
                    status: BTN_OWNERSHIP_HISTORIES.KEY_HOLDING,
                    isLoadMore: false,
                }),
                get().fetchOwnershipHistoriesDynamic({
                    page: 1,
                    status: BTN_OWNERSHIP_HISTORIES.KEY_HOLDING,
                    isLoadMore: false,
                }),
                get().fetchOrdersHistories({
                    page: 1,
                    status: BTN_ORDERS_HISTORIES.KEY_ALL,
                    isLoadMore: false,
                }),
            ]);
        } catch (err) {
            toast.error(getApiErrorMessage(err, getTranslate().common.try_again_error));
        } finally {
            set({ isLoadingPackages: false });
        }
    },

    fetchOwnershipHistories: async ({ page = 0, status, isLoadMore = false } = {}) => {
        const filter = status ?? get().ownershipFilter;
        if (isLoadMore) {
            set((s) => ({
                ownershipHistories: { ...s.ownershipHistories, isLoadMore: true },
            }));
        } else {
            set((s) => ({
                ownershipHistories: { ...s.ownershipHistories, isLoading: true },
                ownershipFilter: filter,
            }));
        }
        try {
            const { error_code, message, data } = await fetchHayBondOwnershipHistories({
                page,
                status: filter,
            });
            if (isSuccessApi(error_code)) {
                set((s) => ({
                    ownershipHistories: {
                        isLoading: false,
                        isLoadMore: false,
                        page: data.page,
                        totalPages: data.totalPages,
                        content: isLoadMore
                            ? [...s.ownershipHistories.content, ...data.content]
                            : data.content,
                    },
                }));
            } else {
                set((s) => ({
                    ownershipHistories: {
                        ...s.ownershipHistories,
                        isLoading: false,
                        isLoadMore: false,
                    },
                }));
                toast.error(message);
            }
        } catch (err) {
            set((s) => ({
                ownershipHistories: {
                    ...s.ownershipHistories,
                    isLoading: false,
                    isLoadMore: false,
                },
            }));
            toast.error(getApiErrorMessage(err, getTranslate().common.try_again_error));
        }
    },

    fetchOwnershipHistoriesDynamic: async ({ page = 0, status, isLoadMore = false } = {}) => {
        const filter = status ?? get().ownershipFilter;
        if (isLoadMore) {
            set((s) => ({
                ownershipHistoriesDynamic: {
                    ...s.ownershipHistoriesDynamic,
                    isLoadMore: true,
                },
            }));
        } else {
            set((s) => ({
                ownershipHistoriesDynamic: {
                    ...s.ownershipHistoriesDynamic,
                    isLoading: true,
                },
            }));
        }
        try {
            const { error_code, message, data } = await fetchHayBondDynamicOwnershipHistories({
                page,
                status: filter,
            });
            if (isSuccessApi(error_code)) {
                const list = Array.isArray(data) ? data : [];
                set((s) => ({
                    ownershipHistoriesDynamic: {
                        isLoading: false,
                        isLoadMore: false,
                        page,
                        totalPages: page + (list.length > 0 ? 1 : 0),
                        content: isLoadMore
                            ? [...s.ownershipHistoriesDynamic.content, ...list]
                            : list,
                    },
                }));
            } else {
                set((s) => ({
                    ownershipHistoriesDynamic: {
                        ...s.ownershipHistoriesDynamic,
                        isLoading: false,
                        isLoadMore: false,
                    },
                }));
                toast.error(message);
            }
        } catch (err) {
            set((s) => ({
                ownershipHistoriesDynamic: {
                    ...s.ownershipHistoriesDynamic,
                    isLoading: false,
                    isLoadMore: false,
                },
            }));
            toast.error(getApiErrorMessage(err, getTranslate().common.try_again_error));
        }
    },

    fetchOrdersHistories: async ({ page = 0, status, isLoadMore = false } = {}) => {
        const filter = status ?? get().ordersFilter;
        if (isLoadMore) {
            set((s) => ({
                ordersHistories: { ...s.ordersHistories, isLoadMore: true },
            }));
        } else {
            set((s) => ({
                ordersHistories: { ...s.ordersHistories, isLoading: true },
                ordersFilter: filter,
            }));
        }
        try {
            const { error_code, message, data } = await fetchHayBondOrdersHistories({
                page,
                status: filter,
            });
            if (isSuccessApi(error_code)) {
                set((s) => ({
                    ordersHistories: {
                        isLoading: false,
                        isLoadMore: false,
                        page: data.page,
                        totalPages: data.totalPages,
                        content: isLoadMore
                            ? [...s.ordersHistories.content, ...data.content]
                            : data.content,
                    },
                }));
            } else {
                set((s) => ({
                    ordersHistories: {
                        ...s.ordersHistories,
                        isLoading: false,
                        isLoadMore: false,
                    },
                }));
                toast.error(message);
            }
        } catch (err) {
            set((s) => ({
                ordersHistories: {
                    ...s.ordersHistories,
                    isLoading: false,
                    isLoadMore: false,
                },
            }));
            toast.error(getApiErrorMessage(err, getTranslate().common.try_again_error));
        }
    },

    setOwnershipFilter: (status) => set({ ownershipFilter: status }),
    setOrdersFilter: (status) => set({ ordersFilter: status }),
    setIsOverlayLoading: (value) => set({ isOverlayLoading: value }),
    setAcceptTC: (value) => set({ acceptTC: value }),
    setTermBuyData: (data) =>
        set((s) => ({
            termBuyData: { ...s.termBuyData, ...data },
        })),
    setDataClosing: (data) =>
        set((s) => ({
            dataClosing: { ...s.dataClosing, ...data },
        })),
    setDataDetailSaving: (data) =>
        set((s) => ({
            dataDetailSaving: { ...s.dataDetailSaving, ...data },
        })),
    resetTermBuyData: () => set({ termBuyData: initialTermBuyData, acceptTC: false }),

    openBuy: (packageId) =>
        set({
            isBuyOpen: true,
            buyStep: TERM_BUY_FLOW_STEPS.ORDER,
            buyPackageId: packageId,
        }),
    setBuyStep: (step) => set({ buyStep: step }),
    resetBuyFlow: () =>
        set({
            isBuyOpen: false,
            buyStep: TERM_BUY_FLOW_STEPS.ORDER,
            buyPackageId: 0,
        }),

    openSell: (savingBookId) =>
        set({
            isSellOpen: true,
            sellStep: TERM_SELL_FLOW_STEPS.WARNING,
            sellSavingBookId: savingBookId,
        }),
    setSellStep: (step) => set({ sellStep: step }),
    resetSellFlow: () =>
        set({
            isSellOpen: false,
            sellStep: TERM_SELL_FLOW_STEPS.WARNING,
            sellSavingBookId: '',
        }),

    resetStore: () => set(initialState),
}));

registerResettableStore(useHaybondStore);
