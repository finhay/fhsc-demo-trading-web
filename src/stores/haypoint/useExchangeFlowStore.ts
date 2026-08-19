import { isExpired } from 'react-jwt';
import { create } from 'zustand';

import { VOUCHER_EXCHANGE_STEPS } from '@/constants/haypoint';
import { toast } from '@/hooks/lib/useToast';
import { getTranslate } from '@/hooks/useTranslate';
import { fetchRewardsByBrandId, redeemRewardWithPoints } from '@/services/api/reward';
import { getAccessToken2FA } from '@/services/localStorage';
import { registerResettableStore } from '@/stores/reset-registry';
import { OwnedRewardItem, RewardItem } from '@/types/reward';
import { isSuccessApi } from '@/utils/common';
import { formatClaimBody } from '@/utils/haypoint';

type ExchangeFlowState = {
    brandId: string;
    step: string;
    isOpen: boolean;
    rewardList: RewardItem[];
    selectedReward: RewardItem | null;
    claimedReward: OwnedRewardItem | null;
};

type ExchangeFlowActions = {
    setStep: (step: string) => void;
    setSelectedReward: (reward: RewardItem) => void;
    proceedToOtpStep: () => Promise<void>;
    openExchangeFlow: (brandId: string) => Promise<void>;
    submitRewardClaim: (accessToken: string) => Promise<void>;
    resetStore: () => void;
};

const initialState: ExchangeFlowState = {
    brandId: '',
    step: '',
    isOpen: false,
    rewardList: [],
    selectedReward: null,
    claimedReward: null,
};

export const useExchangeFlowStore = create<ExchangeFlowState & ExchangeFlowActions>((set, get) => ({
    ...initialState,

    setStep: (step: string) => set({ step }),

    setSelectedReward: (reward: RewardItem) => {
        set({ selectedReward: reward, step: VOUCHER_EXCHANGE_STEPS.CONFIRM });
    },

    proceedToOtpStep: async () => {
        const { selectedReward } = get();
        if (!selectedReward) return;

        const token2FA = getAccessToken2FA();
        if (token2FA && !isExpired(token2FA)) {
            await get().submitRewardClaim(token2FA);
        } else {
            set({ step: VOUCHER_EXCHANGE_STEPS.QR_CODE });
        }
    },

    openExchangeFlow: async (brandId: string) => {
        set({ brandId, isOpen: true });
        try {
            const { data, error_code } = await fetchRewardsByBrandId(brandId);
            if (isSuccessApi(error_code)) {
                set({
                    rewardList: data.content || [],
                    step: VOUCHER_EXCHANGE_STEPS.SELECTION,
                });
            } else {
                set({ rewardList: [], isOpen: false });
            }
        } catch {
            set({ rewardList: [], isOpen: false });
        }
    },

    submitRewardClaim: async (accessToken: string) => {
        const { selectedReward, brandId } = get();
        if (!selectedReward) return;

        try {
            const { data, error_code } = await redeemRewardWithPoints(
                formatClaimBody(selectedReward, brandId),
                accessToken,
            );
            if (isSuccessApi(error_code)) {
                set({
                    claimedReward: data[0] || null,
                    step: VOUCHER_EXCHANGE_STEPS.SUCCESS,
                });
                toast.success(getTranslate().haypoint.redeem_ok);
            } else {
                set({ step: VOUCHER_EXCHANGE_STEPS.QR_CODE });
            }
        } catch {
            set({ step: VOUCHER_EXCHANGE_STEPS.QR_CODE });
        }
    },

    resetStore: () => {
        set(initialState);
    },
}));

registerResettableStore(useExchangeFlowStore);
