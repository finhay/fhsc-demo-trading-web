import { vnscServiceDatafeed } from '@/services/interceptor';
import type { JittaBySymbolResponse } from '@/types/datafeed/jitta';

export const fetchJittaDetailBySymbol = (symbol: string): Promise<JittaBySymbolResponse> => {
    return new Promise<JittaBySymbolResponse>((resolve, reject) => {
        vnscServiceDatafeed
            .get(`/v1/jitta/symbols/${symbol}`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
