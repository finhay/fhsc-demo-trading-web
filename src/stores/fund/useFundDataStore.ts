import { create } from 'zustand';

import { FUND_TAB, RECORD_TYPE } from '@/constants/fund';
import { Holding, Investor, Transaction, encAdd, encLoadAllLenient, fundDb } from '@/db/fund';
import { toast } from '@/hooks/lib/useToast';
import { getTranslate } from '@/hooks/useTranslate';
import { useFundVaultStore } from '@/stores/fund/useFundVaultStore';
import { registerResettableStore } from '@/stores/reset-registry';
import type { FundTab } from '@/types/pages/fund';
import {
    StockSummary,
    calcInvestorCash,
    calcInvestorNav,
    calcPortfolioSummary,
} from '@/utils/fund/fund';

export type InvestorRow = Investor & {
    nav: number;
    cash: number;
    stock_value: number;
    return_pct: number;
};

type FundDataState = {
    investors: Investor[];
    investorRows: InvestorRow[];
    holdings: Holding[];
    transactions: Transaction[];
    prices: Record<string, number>;
    stockNames: Record<string, string>;
    portfolioSummary: StockSummary[];
    selectedInvestor: Investor | null;
    isDetailOpen: boolean;
    activeTab: FundTab;
};

type FundDataActions = {
    setStockNames: (names: Record<string, string>) => void;
    selectInvestor: (
        investor: Investor | null,
        options?: { presentation?: 'dialog' | 'inline' },
    ) => void;
    setActiveTab: (tab: FundTab) => void;
    setPrices: (prices: Record<string, number>) => void;
    loadData: () => Promise<void>;
    addInvestor: (investor: Omit<Investor, 'id'>) => Promise<void>;
    clearAllData: () => Promise<void>;
    resetStore: () => void;
};

const initialState: FundDataState = {
    investors: [],
    investorRows: [],
    holdings: [],
    transactions: [],
    prices: {},
    stockNames: {},
    portfolioSummary: [],
    selectedInvestor: null,
    isDetailOpen: false,
    activeTab: FUND_TAB.DASHBOARD as FundTab,
};

const buildInvestorRows = (
    investors: Investor[],
    holdings: Holding[],
    transactions: Transaction[],
    prices: Record<string, number>,
): InvestorRow[] =>
    investors.map((inv) => {
        const nav = calcInvestorNav(inv, holdings, transactions, prices);
        const cash = calcInvestorCash(inv, transactions);
        const stock_value = nav - cash;
        const capital = inv.von_uy_thac_vnd;
        const return_pct = capital > 0 ? ((nav - capital) / capital) * 100 : 0;
        return { ...inv, nav, cash, stock_value, return_pct };
    });

export const useFundDataStore = create<FundDataState & FundDataActions>((set, get) => ({
    ...initialState,

    setStockNames: (names) => set((s) => ({ stockNames: { ...s.stockNames, ...names } })),

    selectInvestor: (investor, options) => {
        const presentation = options?.presentation ?? 'dialog';
        set({
            selectedInvestor: investor,
            isDetailOpen: investor !== null && presentation === 'dialog',
        });
    },

    setActiveTab: (tab) => set({ activeTab: tab }),

    setPrices: (prices) => {
        const { investors, holdings, transactions } = get();
        const investorRows = buildInvestorRows(investors, holdings, transactions, prices);
        const portfolioSummary = calcPortfolioSummary(holdings, prices);
        set({ prices, investorRows, portfolioSummary });
    },

    loadData: async () => {
        const dek = useFundVaultStore.getState().dek;
        if (!dek) return;
        const [investorsRes, holdingsRes, transactionsRes] = await Promise.all([
            encLoadAllLenient<Investor>(fundDb.investors, dek, RECORD_TYPE.INVESTOR),
            encLoadAllLenient<Holding>(fundDb.holdings, dek, RECORD_TYPE.HOLDING),
            encLoadAllLenient<Transaction>(fundDb.transactions, dek, RECORD_TYPE.TRANSACTION),
        ]);
        const failedCount =
            investorsRes.failedCount + holdingsRes.failedCount + transactionsRes.failedCount;
        if (failedCount > 0) {
            const t = getTranslate().fund.common.messages;
            toast.error(`${t.decode_skipped_prefix}${failedCount}${t.decode_skipped_suffix}`);
        }
        const investors = investorsRes.rows;
        const holdings = holdingsRes.rows;
        const transactions = transactionsRes.rows;
        const { prices } = get();
        const investorRows = buildInvestorRows(investors, holdings, transactions, prices);
        const portfolioSummary = calcPortfolioSummary(holdings, prices);
        set({ investors, investorRows, holdings, transactions, portfolioSummary });
    },

    addInvestor: async (investor) => {
        const dek = useFundVaultStore.getState().dek;
        if (!dek) return;
        await encAdd(fundDb.investors, dek, RECORD_TYPE.INVESTOR, investor);
        await get().loadData();
    },

    clearAllData: async () => {
        await fundDb.transaction(
            'rw',
            [
                fundDb.investors,
                fundDb.transactions,
                fundDb.holdings,
                fundDb.nav_snapshots,
                fundDb.import_batches,
            ],
            async () => {
                await Promise.all([
                    fundDb.investors.clear(),
                    fundDb.transactions.clear(),
                    fundDb.holdings.clear(),
                    fundDb.nav_snapshots.clear(),
                    fundDb.import_batches.clear(),
                ]);
            },
        );
        set(initialState);
    },

    resetStore: () => {
        set(initialState);
    },
}));

registerResettableStore(useFundDataStore);
