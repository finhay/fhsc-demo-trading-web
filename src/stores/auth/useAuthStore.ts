import { create } from 'zustand';

import { toast } from '@/hooks/lib/useToast';
import { logoutAccount } from '@/services/api/accounts/login';
import { getUserPreferences, getUserProfile } from '@/services/api/accounts/profile';
import {
    clearLocalStorage,
    getAccessKey,
    getAccessToken,
    getAccessToken2FA,
    getCustId,
    getRefreshToken,
    getUserId,
    setAccessKey,
    setAccessToken,
    setAccessToken2FA,
    setCustId,
    setRefreshToken,
    setUserId,
} from '@/services/localStorage';
import { resetAllStores } from '@/stores/reset-registry';
import type { SubAccount } from '@/types/accounts/profile';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';

type AuthCredentials = {
    accessToken: string;
    accessKey: string;
    refreshToken: string;
    userId: string;
    custId: string;
    accessToken2FA?: string;
    requiredChangePassword?: boolean;
};

type UserProfile = {
    user_type: string;
    ekyc_level?: string;
    [key: string]: any;
};

type ProfileState = {
    isAuthenticated: boolean;
    accessToken: string | null;
    accessKey: string | null;
    refreshToken: string | null;
    userId: string | null;
    custId: string | null;
    accessToken2FA: string | null;
    requiredChangePassword: boolean;
    isInitialized: boolean;
    profile: UserProfile | null;
    avatarUrl: string;
    isAlphaUser: boolean;
    isLoadingProfile: boolean;
    subAccounts: SubAccount[];
    activeSubAccount: SubAccount | null;
};

type ProfileActions = {
    setAuth: (credentials: AuthCredentials) => void;
    setInitialized: (value: boolean) => void;
    setActiveSubAccount: (subAccount: SubAccount) => void;
    initFromStorage: () => void;
    initialize: () => Promise<void>;
    logout: () => Promise<void>;
    fetchProfile: () => Promise<void>;
    fetchPreferences: () => Promise<void>;
    resetStore: () => void;
};

const initialState: ProfileState = {
    isAuthenticated: false,
    accessToken: null,
    accessKey: null,
    refreshToken: null,
    userId: null,
    custId: null,
    accessToken2FA: null,
    requiredChangePassword: false,
    isInitialized: false,
    profile: null,
    avatarUrl: '',
    isAlphaUser: false,
    isLoadingProfile: false,
    subAccounts: [],
    activeSubAccount: null,
};

export const useAuthStore = create<ProfileState & ProfileActions>((set, get) => ({
    ...initialState,

    setAuth: (credentials: AuthCredentials) => {
        setAccessToken(credentials.accessToken);
        setAccessKey(credentials.accessKey);
        setRefreshToken(credentials.refreshToken);
        setUserId(credentials.userId);
        setCustId(credentials.custId);
        if (credentials.accessToken2FA) {
            setAccessToken2FA(credentials.accessToken2FA);
        }

        set({
            isAuthenticated: true,
            accessToken: credentials.accessToken,
            accessKey: credentials.accessKey,
            refreshToken: credentials.refreshToken,
            userId: credentials.userId,
            custId: credentials.custId,
            accessToken2FA: credentials.accessToken2FA ?? null,
            requiredChangePassword: credentials.requiredChangePassword ?? false,
        });
    },

    setInitialized: (value: boolean) => set({ isInitialized: value }),

    setActiveSubAccount: (subAccount: SubAccount) => set({ activeSubAccount: subAccount }),

    initFromStorage: () => {
        const accessToken = getAccessToken();
        const userId = getUserId();

        if (accessToken && userId) {
            set({
                isAuthenticated: true,
                accessToken,
                accessKey: getAccessKey(),
                refreshToken: getRefreshToken(),
                userId,
                custId: getCustId(),
                accessToken2FA: getAccessToken2FA(),
            });
        }
    },

    initialize: async () => {
        const accessToken = getAccessToken();
        if (!accessToken) {
            set({ isInitialized: true });
            return;
        }

        const { profile, isLoadingProfile } = get();
        if (profile || isLoadingProfile) {
            set({ isInitialized: true });
            return;
        }

        try {
            await Promise.all([get().fetchProfile(), get().fetchPreferences()]);
        } finally {
            set({ isInitialized: true });
        }
    },

    logout: async () => {
        resetAllStores();
        set({ ...initialState, isInitialized: true });
        try {
            await logoutAccount();
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Có lỗi xảy ra, vui lòng thử lại'));
        } finally {
            clearLocalStorage();
        }
    },

    fetchProfile: async () => {
        set({ isLoadingProfile: true });
        try {
            const { error_code, data } = await getUserProfile();
            if (isSuccessApi(error_code)) {
                const subAccounts = data.sub_accounts ?? [];
                set({
                    profile: data,
                    custId: data.cust_id,
                    subAccounts,
                    activeSubAccount: subAccounts[0] ?? null,
                });
                setCustId(data.cust_id);
            } else {
                set({ profile: null });
            }
        } catch (error: any) {
            set({ profile: null });
        } finally {
            set({ isLoadingProfile: false });
        }
    },

    fetchPreferences: async () => {
        try {
            const { error_code, data } = await getUserPreferences();
            if (isSuccessApi(error_code)) {
                set({
                    avatarUrl: data?.avatar_url || '',
                    isAlphaUser: data?.member_groups?.includes('PRIVATE') ?? false,
                });
            }
        } catch {
            set({ avatarUrl: '', isAlphaUser: false });
        }
    },

    resetStore: () => set(initialState),
}));
