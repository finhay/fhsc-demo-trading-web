import { create } from 'zustand';

import { toast } from '@/hooks/lib/useToast';
import {
    createWatchlist as createWatchlistApi,
    deleteWatchlistById,
    fetchWatchlists as fetchWatchlistsApi,
    updateWatchlistById,
} from '@/services/api/accounts/watchlist';
import { fetchStocksMetadataBySymbolsV4 } from '@/services/api/datafeed/stock-info';
import { fetchSubAccountStockPortfolio } from '@/services/api/trade/portfolio';
import {
    type LocalWatchlistRecord,
    getLocalWatchlists,
    setLocalWatchlists,
} from '@/services/localStorage';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { registerResettableStore } from '@/stores/reset-registry';
import type {
    UpdateWatchlistPayload,
    WatchlistItem,
    WatchlistStockItem,
} from '@/types/accounts/watchlist';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';
import { mapStockToWatchlistItem } from '@/utils/trading/shared';

type WatchlistMutationResult = { success: boolean; message?: string };

type WatchListState = {
    watchlists: WatchlistItem[];
    currentWatchList: WatchlistItem | null;
    ownedWatchlist: WatchlistItem | null;
    isOwnedLoading: boolean;
};

type WatchListActions = {
    setWatchlists: (watchlists: WatchlistItem[]) => void;
    setCurrentWatchList: (watchList: WatchlistItem | null) => void;

    fetchWatchlists: () => Promise<void>;
    fetchOwnedPortfolio: () => Promise<void>;
    createWatchlist: (name: string) => Promise<WatchlistMutationResult>;
    deleteWatchlist: (id: number) => Promise<WatchlistMutationResult>;
    updateWatchlist: (payload: UpdateWatchlistPayload) => Promise<void>;
    addStockToWatchlist: (item: WatchlistStockItem) => Promise<boolean>;
    removeStockFromWatchlist: (symbol: string) => Promise<boolean>;

    resetStore: () => void;
};

const initialState: WatchListState = {
    watchlists: [],
    currentWatchList: null,
    ownedWatchlist: null,
    isOwnedLoading: false,
};

export const OWNED_WATCHLIST_ID = -1;

export const isOwnedWatchlist = (watchlist: WatchlistItem | null | undefined): boolean =>
    watchlist?.id === OWNED_WATCHLIST_ID;

const normalizeSymbols = (symbols: string[]): string[] => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const s of symbols) {
        const u = s.trim().toUpperCase();
        if (!u || seen.has(u)) continue;
        seen.add(u);
        out.push(u);
    }
    return out;
};

export const getOrderedWatchlistSymbols = (watchlist: WatchlistItem): string[] => {
    const raw =
        watchlist.symbols && watchlist.symbols.length > 0
            ? watchlist.symbols
            : (watchlist.items?.map((i) => i.symbol) ?? []);

    return normalizeSymbols(raw);
};

const isGuest = () => !useAuthStore.getState().profile;

const generateLocalWatchlistId = (records: LocalWatchlistRecord[]): number => {
    const maxId = records.reduce((max, record) => Math.max(max, record.id), 0);
    return Math.max(Date.now(), maxId + 1);
};

const createLocalWatchlist = (name: string): LocalWatchlistRecord => {
    const records = getLocalWatchlists();
    const created: LocalWatchlistRecord = {
        id: generateLocalWatchlistId(records),
        name,
        symbols: [],
    };
    setLocalWatchlists([...records, created]);
    return created;
};

const updateLocalWatchlist = (payload: UpdateWatchlistPayload) => {
    const targetId = payload.watchListId ?? payload.id;
    if (targetId === undefined) return;

    const records = getLocalWatchlists();
    setLocalWatchlists(
        records.map((record) =>
            record.id === targetId
                ? { ...record, name: payload.name, symbols: normalizeSymbols(payload.symbols) }
                : record,
        ),
    );
};

const deleteLocalWatchlist = (id: number) => {
    setLocalWatchlists(getLocalWatchlists().filter((record) => record.id !== id));
};

const hydrateLocalWatchlists = async (
    records: LocalWatchlistRecord[],
): Promise<WatchlistItem[]> => {
    const allSymbols = normalizeSymbols(records.flatMap((record) => record.symbols));

    const itemBySymbol = new Map<string, WatchlistStockItem>();
    if (allSymbols.length > 0) {
        try {
            const { result, error_code } = await fetchStocksMetadataBySymbolsV4(allSymbols);
            if (isSuccessApi(error_code)) {
                result.map(mapStockToWatchlistItem).forEach((item) => {
                    itemBySymbol.set(item.symbol, item);
                });
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Không thể tải danh mục theo dõi'));
        }
    }

    return records.map((record) => ({
        id: record.id,
        name: record.name,
        items: normalizeSymbols(record.symbols)
            .map((symbol) => itemBySymbol.get(symbol))
            .filter((item): item is WatchlistStockItem => Boolean(item)),
    }));
};

const reconcileCurrentWatchList = (
    watchlists: WatchlistItem[],
    current: WatchlistItem | null,
): WatchlistItem | null => {
    if (!current || isOwnedWatchlist(current)) return current;
    return watchlists.find((item) => item.id === current.id) ?? null;
};

export const useWatchlistStore = create<WatchListState & WatchListActions>((set, get) => ({
    ...initialState,

    setWatchlists: (watchlists: WatchlistItem[]) => set({ watchlists }),

    setCurrentWatchList: (watchList: WatchlistItem | null) => set({ currentWatchList: watchList }),

    fetchWatchlists: async () => {
        if (isGuest()) {
            let records = getLocalWatchlists();
            if (records.length === 0) {
                records = [createLocalWatchlist('Danh mục của tôi')];
            }

            const watchlists = await hydrateLocalWatchlists(records);
            set((state) => ({
                watchlists,
                currentWatchList: reconcileCurrentWatchList(watchlists, state.currentWatchList),
            }));
            return;
        }

        const { error_code, data } = await fetchWatchlistsApi();
        if (isSuccessApi(error_code) && Array.isArray(data)) {
            set((state) => ({
                watchlists: data,
                currentWatchList: reconcileCurrentWatchList(data, state.currentWatchList),
            }));
        }
    },

    fetchOwnedPortfolio: async () => {
        const { activeSubAccount } = useAuthStore.getState();
        if (!activeSubAccount) return;

        set({ isOwnedLoading: true });
        try {
            const { data, error_code } = await fetchSubAccountStockPortfolio(
                activeSubAccount.sub_account_id,
            );
            if (!isSuccessApi(error_code)) return;

            const symbols = (data.portfolio || []).map((item) => item.symbol);

            let items: WatchlistStockItem[] = [];
            if (symbols.length > 0) {
                const { result, error_code: stocksErrorCode } =
                    await fetchStocksMetadataBySymbolsV4(symbols);
                if (isSuccessApi(stocksErrorCode)) {
                    items = result.map(mapStockToWatchlistItem);
                }
            }

            const owned: WatchlistItem = {
                id: OWNED_WATCHLIST_ID,
                name: 'Đang sở hữu',
                symbols,
                items,
            };
            set({ ownedWatchlist: owned, currentWatchList: owned });
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Không thể tải danh mục đang sở hữu'));
        } finally {
            set({ isOwnedLoading: false });
        }
    },

    createWatchlist: async (name: string) => {
        if (isGuest()) {
            createLocalWatchlist(name);
            await get().fetchWatchlists();
            return { success: true };
        }

        try {
            const { error_code, message } = await createWatchlistApi({ name, symbols: [] });
            if (!isSuccessApi(error_code)) return { success: false, message };

            await get().fetchWatchlists();
            return { success: true };
        } catch {
            return { success: false };
        }
    },

    deleteWatchlist: async (id: number) => {
        if (isGuest()) {
            deleteLocalWatchlist(id);
            return { success: true };
        }

        try {
            const { error_code, message } = await deleteWatchlistById({ id });
            return { success: isSuccessApi(error_code), message };
        } catch {
            return { success: false };
        }
    },

    updateWatchlist: async (payload: UpdateWatchlistPayload) => {
        if (payload.id === OWNED_WATCHLIST_ID || payload.watchListId === OWNED_WATCHLIST_ID) {
            toast.error('Vui lòng chọn danh mục');
            return;
        }

        const applyUpdated = () => {
            toast.success('Lưu danh mục thành công');

            set((state) => {
                const current = state.currentWatchList;
                const isCurrent =
                    current &&
                    (current.id === payload.id ||
                        current.id === payload.watchListId ||
                        current.watchListId === payload.id ||
                        current.watchListId === payload.watchListId);
                if (!current || !isCurrent) return state;

                const order = new Map(payload.symbols.map((symbol, index) => [symbol, index]));
                const reorderedItems = [...(current.items ?? [])].sort(
                    (a, b) =>
                        (order.get(a.symbol) ?? Number.MAX_SAFE_INTEGER) -
                        (order.get(b.symbol) ?? Number.MAX_SAFE_INTEGER),
                );
                const updated: WatchlistItem = {
                    ...current,
                    name: payload.name,
                    items: reorderedItems,
                };

                return {
                    currentWatchList: updated,
                    watchlists: state.watchlists.map((item) =>
                        item.id === updated.id ? updated : item,
                    ),
                };
            });
        };

        if (isGuest()) {
            updateLocalWatchlist(payload);
            applyUpdated();
            return;
        }

        try {
            const { error_code, message } = await updateWatchlistById(payload);
            if (!isSuccessApi(error_code)) {
                toast.error(message);
                return;
            }

            applyUpdated();
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Lỗi cập nhật danh mục'));
        }
    },

    addStockToWatchlist: async (item: WatchlistStockItem) => {
        const current = get().currentWatchList;
        if (!current || isOwnedWatchlist(current)) {
            toast.error('Vui lòng chọn danh mục');
            return false;
        }

        const symbol = item.symbol.trim().toUpperCase();
        const existingSymbols = getOrderedWatchlistSymbols(current);
        if (existingSymbols.includes(symbol)) return false;

        const nextSymbols = [...existingSymbols, symbol];

        const applyAdded = () => {
            set((state) => {
                const target = state.currentWatchList;
                if (!target || target.id !== current.id) return state;
                const updated: WatchlistItem = {
                    ...target,
                    items: [...(target.items ?? []), item],
                };
                return {
                    currentWatchList: updated,
                    watchlists: state.watchlists.map((w) => (w.id === updated.id ? updated : w)),
                };
            });

            toast.success(`Đã thêm ${symbol} vào ${current.name}`);
        };

        if (isGuest()) {
            updateLocalWatchlist({ id: current.id, name: current.name, symbols: nextSymbols });
            applyAdded();
            return true;
        }

        try {
            const { error_code, message } = await updateWatchlistById({
                id: current.id,
                name: current.name,
                symbols: nextSymbols,
            });
            if (isSuccessApi(error_code)) {
                applyAdded();
                return true;
            }

            toast.error(message);
            return false;
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Không thể cập nhật danh mục'));
            return false;
        }
    },

    removeStockFromWatchlist: async (symbol: string) => {
        const current = get().currentWatchList;
        if (!current || isOwnedWatchlist(current)) {
            toast.error('Vui lòng chọn danh mục');
            return false;
        }

        const normalized = symbol.trim().toUpperCase();
        const existingSymbols = getOrderedWatchlistSymbols(current);
        if (!existingSymbols.includes(normalized)) return false;

        const nextSymbols = existingSymbols.filter((item) => item !== normalized);

        const applyRemoved = () => {
            set((state) => {
                const target = state.currentWatchList;
                if (!target || target.id !== current.id) return state;
                const updated: WatchlistItem = {
                    ...target,
                    items: (target.items ?? []).filter((it) => it.symbol !== normalized),
                };
                return {
                    currentWatchList: updated,
                    watchlists: state.watchlists.map((w) => (w.id === updated.id ? updated : w)),
                };
            });

            toast.success(`Đã xóa ${normalized} khỏi ${current.name}`);
        };

        if (isGuest()) {
            updateLocalWatchlist({ id: current.id, name: current.name, symbols: nextSymbols });
            applyRemoved();
            return true;
        }

        try {
            const { error_code, message } = await updateWatchlistById({
                id: current.id,
                name: current.name,
                symbols: nextSymbols,
            });
            if (!isSuccessApi(error_code)) {
                toast.error(message);
                return false;
            }

            applyRemoved();
            return true;
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Không thể cập nhật danh mục'));
            return false;
        }
    },

    resetStore: () => set(initialState),
}));

registerResettableStore(useWatchlistStore);
