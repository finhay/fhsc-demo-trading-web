import { create } from 'zustand';

import { fetchPaperAccountAsset, registerPaperAccount } from '@/services/api/paper-trading/account';
import { getUserId } from '@/services/localStorage';
import { registerResettableStore } from '@/stores/reset-registry';
import type { PaperAccountAsset } from '@/types/paper-trading/account';
import { isSuccessApi } from '@/utils/common';
import { buildPaperAccountId } from '@/utils/paper-trading/account';

type State = {
    accountId: string;
    asset: PaperAccountAsset | null;
    isReady: boolean;
    isLoadingAsset: boolean;
};

type Actions = {
    ensureAccount: () => Promise<void>;
    fetchAsset: () => Promise<void>;
    resetStore: () => void;
};

const initialState: State = {
    accountId: '',
    asset: null,
    isReady: false,
    isLoadingAsset: false,
};

let inflightEnsure: Promise<void> | null = null;

export const usePaperAccountStore = create<State & Actions>((set, get) => ({
    ...initialState,

    /**
     * GET asset trước, chỉ register khi tài khoản chưa tồn tại — `POST /v1/accounts` vì thế
     * chỉ chạy đúng một lần trong đời tài khoản, kể cả khi endpoint đó không idempotent.
     * `accountId` suy thẳng từ `user_id` nên set được ngay, không phải chờ API.
     */
    ensureAccount: async () => {
        const accountId = buildPaperAccountId(getUserId());
        if (!accountId) return;
        if (get().isReady && get().accountId === accountId) return;
        if (inflightEnsure) return inflightEnsure;

        set({ accountId, isLoadingAsset: true });

        inflightEnsure = (async () => {
            try {
                const { data, error_code } = await fetchPaperAccountAsset(accountId);
                if (isSuccessApi(error_code)) {
                    set({ asset: data, isReady: true });
                    return;
                }
            } catch {
                // Chưa có tiểu khoản SIM — rơi xuống nhánh đăng ký bên dưới.
            }

            try {
                const { data, error_code } = await registerPaperAccount(accountId);
                if (isSuccessApi(error_code)) set({ asset: data });
            } catch {
                // Simulator lỗi tạm thời — vẫn cho app chạy, các màn sẽ tự fetch lại.
            } finally {
                set({ isReady: true });
            }
        })().finally(() => {
            inflightEnsure = null;
            set({ isLoadingAsset: false });
        });

        return inflightEnsure;
    },

    fetchAsset: async () => {
        const { accountId } = get();
        if (!accountId) return;

        set({ isLoadingAsset: true });
        try {
            const { data, error_code } = await fetchPaperAccountAsset(accountId);
            if (isSuccessApi(error_code)) set({ asset: data });
        } catch {
            // giữ nguyên số dư cũ
        } finally {
            set({ isLoadingAsset: false });
        }
    },

    resetStore: () => {
        inflightEnsure = null;
        set(initialState);
    },
}));

registerResettableStore(usePaperAccountStore);
