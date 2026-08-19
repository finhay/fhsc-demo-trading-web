import { vnscServiceDatafeed } from '@/services/interceptor';
import type { IndexRealtimeResponse } from '@/types/datafeed/index-data';

export const fetchIndexRealtime = (index: string): Promise<IndexRealtimeResponse> => {
    return new Promise<IndexRealtimeResponse>((resolve, reject) => {
        vnscServiceDatafeed
            .get(`/index-realtime`, {
                params: {
                    index,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
