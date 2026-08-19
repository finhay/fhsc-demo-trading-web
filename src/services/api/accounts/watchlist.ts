import { vnscService } from '@/services/interceptor';
import type {
    CreateWatchlistPayload,
    CreateWatchlistResponse,
    DeleteWatchlistResponse,
    UpdateWatchlistPayload,
    UpdateWatchlistResponse,
    WatchlistResponse,
} from '@/types/accounts/watchlist';

export const fetchWatchlists = (): Promise<WatchlistResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get('/accounts/v2/watchlist')
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const createWatchlist = (
    payload: CreateWatchlistPayload,
): Promise<CreateWatchlistResponse> => {
    return new Promise<CreateWatchlistResponse>((resolve, reject) => {
        vnscService
            .post('/accounts/v2/watchlist', payload)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const updateWatchlistById = (
    payload: UpdateWatchlistPayload,
): Promise<UpdateWatchlistResponse> => {
    return new Promise<UpdateWatchlistResponse>((resolve, reject) => {
        vnscService
            .put(`/accounts/v2/watchlist/${payload.watchListId || payload.id}`, payload)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const deleteWatchlistById = (payload: { id: number }): Promise<DeleteWatchlistResponse> => {
    return new Promise<DeleteWatchlistResponse>((resolve, reject) => {
        vnscService
            .delete(`/accounts/watchlist/${payload?.id}`, { data: payload })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
