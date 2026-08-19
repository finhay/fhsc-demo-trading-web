export const getAccessToken = () => {
    return window.localStorage.getItem('access_token');
};

export const setAccessToken = (token: string) => {
    window.localStorage.setItem('access_token', token);
};

export const getAccessKey = () => {
    return window.localStorage.getItem('access_key');
};

export const setAccessKey = (key: string) => {
    window.localStorage.setItem('access_key', key);
};

export const getRefreshToken = () => {
    return window.localStorage.getItem('refresh_token');
};

export const setRefreshToken = (token: string) => {
    window.localStorage.setItem('refresh_token', token);
};

export const getUserId = () => {
    return window.localStorage.getItem('user_id');
};

export const setUserId = (userId: string) => {
    window.localStorage.setItem('user_id', userId);
};

export const getCustId = () => {
    return window.localStorage.getItem('cust_id');
};

export const setCustId = (custId: string) => {
    window.localStorage.setItem('cust_id', custId);
};

export const getUserType = () => {
    return window.localStorage.getItem('user_type');
};

export const setUserType = (userType: string) => {
    window.localStorage.setItem('user_type', userType);
};

export const getAccessToken2FA = () => {
    return window.localStorage.getItem('access_token_2FA');
};

export const setAccessToken2FA = (token: string) => {
    if (token && token.trim()) {
        window.localStorage.setItem('access_token_2FA', token);
    } else {
        window.localStorage.removeItem('access_token_2FA');
    }
};

export const removeAccessToken2FA = () => {
    window.localStorage.removeItem('access_token_2FA');
};

export const getDeviceId = () => {
    return window.localStorage.getItem('device_id');
};

export const setDeviceId = (deviceId: string) => {
    window.localStorage.setItem('device_id', deviceId);
};

export const LOCAL_WATCHLIST_KEY = 'local_watchlist';

export type LocalWatchlistRecord = {
    id: number;
    name: string;
    symbols: string[];
};

const isLocalWatchlistRecord = (value: unknown): value is LocalWatchlistRecord => {
    if (!value || typeof value !== 'object') return false;
    const record = value as Record<string, unknown>;
    return (
        typeof record.id === 'number' &&
        typeof record.name === 'string' &&
        Array.isArray(record.symbols) &&
        record.symbols.every((symbol) => typeof symbol === 'string')
    );
};

export const getLocalWatchlists = (): LocalWatchlistRecord[] => {
    if (typeof window === 'undefined') return [];

    try {
        const raw = window.localStorage.getItem(LOCAL_WATCHLIST_KEY);
        if (!raw) return [];

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed.filter(isLocalWatchlistRecord);
    } catch {
        return [];
    }
};

export const setLocalWatchlists = (watchlists: LocalWatchlistRecord[]) => {
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(LOCAL_WATCHLIST_KEY, JSON.stringify(watchlists));
};

export const removeLocalWatchlists = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(LOCAL_WATCHLIST_KEY);
};

export const clearLocalStorage = () => {
    const deviceId = getDeviceId();
    const localWatchlists = window.localStorage.getItem(LOCAL_WATCHLIST_KEY);
    window.localStorage.clear();
    if (deviceId) {
        setDeviceId(deviceId);
    }
    if (localWatchlists) {
        window.localStorage.setItem(LOCAL_WATCHLIST_KEY, localWatchlists);
    }
};
