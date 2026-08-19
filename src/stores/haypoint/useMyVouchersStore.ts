import { create } from 'zustand';

import { fetchOwnedVouchers } from '@/services/api/reward';
import { registerResettableStore } from '@/stores/reset-registry';
import { OwnedRewardItem } from '@/types/reward';
import { isSuccessApi } from '@/utils/common';

type MyVouchersState = {
    vouchers: OwnedRewardItem[];
    isLoadingVouchers: boolean;
    selectedVoucher: OwnedRewardItem | null;
    isDetailOpen: boolean;
};

type MyVouchersActions = {
    openVoucherDetail: (voucher: OwnedRewardItem) => void;
    fetchOwnedRewards: () => Promise<void>;
    resetStore: () => void;
};

const initialState: MyVouchersState = {
    vouchers: [],
    isLoadingVouchers: true,
    selectedVoucher: null,
    isDetailOpen: false,
};

export const useMyVouchersStore = create<MyVouchersState & MyVouchersActions>((set) => ({
    ...initialState,

    openVoucherDetail: (voucher: OwnedRewardItem) =>
        set({ selectedVoucher: voucher, isDetailOpen: true }),

    fetchOwnedRewards: async () => {
        set({ isLoadingVouchers: true });
        try {
            const { data, error_code } = await fetchOwnedVouchers();
            if (isSuccessApi(error_code)) {
                set({ vouchers: data });
            } else {
                set({ vouchers: [] });
            }
        } catch {
            set({ vouchers: [] });
        } finally {
            set({ isLoadingVouchers: false });
        }
    },

    resetStore: () => {
        set(initialState);
    },
}));

registerResettableStore(useMyVouchersStore);
