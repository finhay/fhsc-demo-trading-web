import dayjs from 'dayjs';

import { StockPriceMessageList } from '@/proto/stock';
import { vnscServiceDatafeed } from '@/services/interceptor';
import type {
    PriceHistoriesChartResponse,
    StockChartLineResponse,
    StockInfoV4Response,
    StockListingResponse,
    StockOwnershipResponse,
    StockProfileResponse,
    StockRealtimeResponse,
    StockScreenerItem,
    StockScreenerParams,
    StockScreenerResponse,
    StocksInfoV2Response,
    TradingHistoryResponse,
    TransactionLogResponse,
} from '@/types/datafeed/stock-info';
import { isSuccessApi } from '@/utils/common';

export const decodeStockPriceProtobufByQueryParam = (
    name: string,
    value: string,
): Promise<StockPriceMessageList> => {
    return new Promise<StockPriceMessageList>((resolve, reject) => {
        vnscServiceDatafeed
            .get(`/stock-info`, {
                params: {
                    [name]: value,
                },
                responseType: 'arraybuffer',
            })
            .then((res) => {
                const buffer = new Uint8Array(res.data);
                const desData = StockPriceMessageList.decode(buffer);
                resolve(desData);
            })
            .catch((err) => reject(err.response?.data || err));
    });
};

export const decodeOddLotStockPriceProtobufByQueryParam = (
    name: string,
    value: string,
): Promise<StockPriceMessageList> => {
    return new Promise<StockPriceMessageList>((resolve, reject) => {
        vnscServiceDatafeed
            .get(`/odd-stock-info`, {
                params: {
                    [name]: value,
                },
                responseType: 'arraybuffer',
            })
            .then((res) => {
                const buffer = new Uint8Array(res.data);
                const desData = StockPriceMessageList.decode(buffer);
                resolve(desData);
            })
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchAllStocksInfoV2 = (): Promise<StocksInfoV2Response> => {
    return new Promise<StocksInfoV2Response>((resolve, reject) => {
        vnscServiceDatafeed
            .get(`/v2/stocks-info`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const searchStocksBySymbolKeyword = (symbol: string): Promise<StockInfoV4Response> => {
    return new Promise<StockInfoV4Response>((resolve, reject) => {
        vnscServiceDatafeed
            .get(`/v4/stocks-info`, {
                params: {
                    symbol: symbol.toUpperCase(),
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchStocksMetadataBySymbolsV4 = (
    symbols: string | string[],
): Promise<StockInfoV4Response> => {
    const symbolStr = Array.isArray(symbols) ? symbols?.join(',') : symbols;
    return new Promise<StockInfoV4Response>((resolve, reject) => {
        vnscServiceDatafeed
            .get(`/v4/stocks-info`, {
                params: {
                    symbols: symbolStr,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchStockIntradayChartLine = (symbol: string): Promise<StockChartLineResponse> => {
    return new Promise<StockChartLineResponse>((resolve, reject) => {
        vnscServiceDatafeed
            .get(`/stock-chart-line`, {
                params: {
                    symbol,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchStockRealtime = (symbol: string): Promise<StockRealtimeResponse> => {
    return new Promise<StockRealtimeResponse>((resolve, reject) => {
        vnscServiceDatafeed
            .get(`/stock-realtime`, {
                params: {
                    symbol,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchOddStockRealtime = (symbol: string): Promise<StockRealtimeResponse> => {
    return new Promise<StockRealtimeResponse>((resolve, reject) => {
        vnscServiceDatafeed
            .get(`/odd-stock-realtime`, {
                params: {
                    symbol,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchPriceHistoriesChart = (
    symbol: string,
    resolution: string = '1D',
    from: number = dayjs().subtract(1, 'year').unix(),
    to: number = dayjs().unix(),
): Promise<PriceHistoriesChartResponse> => {
    return new Promise<PriceHistoriesChartResponse>((resolve, reject) => {
        vnscServiceDatafeed
            .get(`/price-histories-chart`, {
                params: {
                    symbol,
                    resolution,
                    from,
                    to,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchForeignTradingHistory = (symbol: string): Promise<TradingHistoryResponse> => {
    return new Promise<TradingHistoryResponse>((resolve, reject) => {
        vnscServiceDatafeed
            .get(`/stocks/${symbol}/trading/foreign/history`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchProprietaryTradingHistory = (symbol: string): Promise<TradingHistoryResponse> => {
    return new Promise<TradingHistoryResponse>((resolve, reject) => {
        vnscServiceDatafeed
            .get(`/stocks/${symbol}/trading/proprietary/history`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchStockTransactionLog = (
    symbol: string,
    lastSequence?: number,
): Promise<TransactionLogResponse> => {
    return new Promise<TransactionLogResponse>((resolve, reject) => {
        const params: Record<string, any> = {
            symbol,
            type: 'TRANS_LOG',
            size: 50,
        };
        if (lastSequence !== undefined) {
            params.last_sequence = lastSequence;
        }
        vnscServiceDatafeed
            .get(`/v1/translog`, {
                params,
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchStockProfile = (symbol: string): Promise<StockProfileResponse> => {
    return new Promise<StockProfileResponse>((resolve, reject) => {
        vnscServiceDatafeed
            .get(`/stocks/${symbol}/profile`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchStockListing = (symbol: string): Promise<StockListingResponse> => {
    return new Promise<StockListingResponse>((resolve, reject) => {
        vnscServiceDatafeed
            .get(`/stocks/${symbol}/listing`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchStockScreener = (
    params?: StockScreenerParams,
): Promise<StockScreenerResponse> => {
    return new Promise<StockScreenerResponse>((resolve, reject) => {
        vnscServiceDatafeed
            .get(`/stocks`, {
                params,
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchAllStockScreener = async (
    params: Omit<StockScreenerParams, 'page'>,
): Promise<StockScreenerItem[]> => {
    const pageSize = params.page_size ?? 50;
    const allItems: StockScreenerItem[] = [];
    let page = 1;

    while (true) {
        const { data, error_code } = await fetchStockScreener({
            ...params,
            page,
            page_size: pageSize,
        });
        if (!isSuccessApi(error_code) || !data) break;
        const items = data.items ?? [];
        allItems.push(...items);
        if (items.length < pageSize) break;
        page += 1;
    }

    return allItems;
};

export const fetchStockOwnership = (symbol: string): Promise<StockOwnershipResponse> => {
    return new Promise<StockOwnershipResponse>((resolve, reject) => {
        vnscServiceDatafeed
            .get(`/stocks/${symbol}/ownership`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
