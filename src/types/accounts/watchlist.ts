export type WatchlistStockItem = {
    id: number;
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    name: string;
    reference: number;
    ceiling: number;
    floor: number;
    close: number;
    volume: number;
    average: number;
    high: number;
    low: number;
    open: number;
    totalVolume: number;
    totalValue: number;
    foreignBought: number;
    foreignSold: number;
    foreignRemain: number;
    remainBid: number | null;
    remainAsk: number | null;
    buyPrice1: number;
    buyPrice2: number;
    buyPrice3: number;
    sellPrice1: number;
    sellPrice2: number;
    sellPrice3: number;
    buyVol1: number;
    buyVol2: number;
    buyVol3: number;
    sellVol1: number;
    sellVol2: number;
    sellVol3: number;
    stockType: string;
    exchange: string;
    hasNewestNews: boolean;
};

export type WatchlistResponse = {
    error_code: string;
    message: string;
    data: {
        id: number;
        name: string;
        items: WatchlistStockItem[];
    }[];
};

export type WatchlistItem = {
    id: number;
    watchListId?: number;
    name: string;
    symbols?: string[];
    items?: WatchlistStockItem[];
    user_id?: string;
    created_at?: string;
    updated_at?: string;
};

export type CreateWatchlistPayload = {
    name: string;
    symbols: string[];
};

export type UpdateWatchlistPayload = {
    id?: number;
    watchListId?: number;
    name: string;
    symbols: string[];
};

export type CreateWatchlistResponse = {
    error_code: string;
    message: string;
    result: WatchlistItem;
};

export type UpdateWatchlistResponse = {
    error_code: string;
    message: string;
    result: WatchlistItem;
};

export type DeleteWatchlistResponse = {
    error_code: string;
    message: string;
};

export type ShareWatchlistResponse = {
    error_code: string;
    message: string;
    result: { token: string };
};

export type WatchlistDetailResponse = {
    error_code: string;
    message: string;
    result: WatchlistItem;
};

export type WatchlistPublicDetailResponse = {
    error_code: string;
    message: string;
    result: WatchlistItem;
};
