import { paperTradingService } from '@/services/interceptor';
import type {
    PaperInstrumentsResponse,
    PaperQuoteResponse,
    PaperSessionsResponse,
} from '@/types/paper-trading/market';

export const searchPaperInstruments = (
    keyword: string,
    exchange?: string,
): Promise<PaperInstrumentsResponse> => {
    return new Promise((resolve, reject) => {
        paperTradingService
            .get('/v1/market/instruments', {
                params: {
                    q: keyword,
                    exchange,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchPaperQuote = (symbol: string): Promise<PaperQuoteResponse> => {
    return new Promise((resolve, reject) => {
        paperTradingService
            .get(`/v1/market/instruments/${symbol}`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchPaperMarketSessions = (): Promise<PaperSessionsResponse> => {
    return new Promise((resolve, reject) => {
        paperTradingService
            .get('/v1/market/sessions')
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
