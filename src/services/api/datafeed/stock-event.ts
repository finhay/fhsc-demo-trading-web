import { vnscServiceDatafeed } from '@/services/interceptor';
import type { StockNewsResponse } from '@/types/datafeed/stock-event';

export const fetchStockNews = (params: {
    stock: string;
    fromDate?: string;
    toDate?: string;
}): Promise<StockNewsResponse> => {
    return new Promise((resolve, reject) => {
        vnscServiceDatafeed
            .get('/news', { params })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
