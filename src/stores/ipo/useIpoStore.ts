import { create } from 'zustand';

import { toast } from '@/hooks/lib/useToast';
import { getTranslate } from '@/hooks/useTranslate';
import { fetchUserIdentityCardImages } from '@/services/api/accounts/profile';
import {
    confirmIpoHuntTermsAndCondition,
    fetchIpoHuntTermsAndCondition,
    fetchIpoOpportunities,
    fetchMyIpoRegistrationBuys,
} from '@/services/api/ipo-hunt';
import { registerResettableStore } from '@/stores/reset-registry';
import { IpoRegistrationBuyItem, OpportunityItem } from '@/types/ipo-hunt';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';

type IpoState = {
    opportunities: OpportunityItem[];
    isLoadingOpportunities: boolean;
    registrationList: IpoRegistrationBuyItem[];
    isLoadingRegistrationList: boolean;
    isOnboardingVisible: boolean;
};

type IpoActions = {
    loadPageData: () => Promise<void>;
    confirmOnboarding: () => Promise<void>;
    checkEkycStatus: (item: OpportunityItem) => Promise<boolean>;
    refetchLists: () => Promise<void>;
    resetStore: () => void;
};

const initialState: IpoState = {
    opportunities: [],
    isLoadingOpportunities: true,
    registrationList: [],
    isLoadingRegistrationList: true,
    isOnboardingVisible: false,
};

export const useIpoStore = create<IpoState & IpoActions>((set) => ({
    ...initialState,

    loadPageData: async () => {
        set({ isLoadingOpportunities: true, isLoadingRegistrationList: true });
        try {
            const [opportunitiesRes, termAndConditionRes, registrationsRes] = await Promise.all([
                fetchIpoOpportunities(),
                fetchIpoHuntTermsAndCondition(),
                fetchMyIpoRegistrationBuys(),
            ]);

            if (
                isSuccessApi(opportunitiesRes.error_code) &&
                isSuccessApi(termAndConditionRes.error_code) &&
                isSuccessApi(registrationsRes.error_code)
            ) {
                set({
                    opportunities: opportunitiesRes.data.items,
                    isOnboardingVisible: !termAndConditionRes.data.confirm,
                    registrationList: registrationsRes.data,
                });
            } else {
                if (!isSuccessApi(opportunitiesRes.error_code)) {
                    toast.error(opportunitiesRes.message);
                }
                if (!isSuccessApi(termAndConditionRes.error_code)) {
                    toast.error(termAndConditionRes.message);
                }
                if (!isSuccessApi(registrationsRes.error_code)) {
                    toast.error(registrationsRes.message);
                }
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, getTranslate().common.try_again_error));
        } finally {
            set({ isLoadingOpportunities: false, isLoadingRegistrationList: false });
        }
    },

    confirmOnboarding: async () => {
        try {
            const { error_code, message } = await confirmIpoHuntTermsAndCondition();
            if (isSuccessApi(error_code)) {
                set({ isOnboardingVisible: false });
            } else {
                toast.error(message);
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, getTranslate().common.try_again_error));
        }
    },

    checkEkycStatus: async (item: OpportunityItem) => {
        if (!item.require_digital_signature) {
            return true;
        }

        try {
            const { error_code, message, data } = await fetchUserIdentityCardImages();
            if (isSuccessApi(error_code)) {
                return data?.has_id_card_images || false;
            } else {
                toast.error(message);
                return false;
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, getTranslate().common.try_again_error));
            return false;
        }
    },

    refetchLists: async () => {
        set({ isLoadingOpportunities: true, isLoadingRegistrationList: true });
        try {
            const [opportunitiesRes, registrationsRes] = await Promise.all([
                fetchIpoOpportunities(),
                fetchMyIpoRegistrationBuys(),
            ]);

            if (
                isSuccessApi(opportunitiesRes.error_code) &&
                isSuccessApi(registrationsRes.error_code)
            ) {
                set({
                    opportunities: opportunitiesRes.data.items,
                    registrationList: registrationsRes.data,
                });
            } else {
                if (!isSuccessApi(opportunitiesRes.error_code)) {
                    toast.error(opportunitiesRes.message);
                }
                if (!isSuccessApi(registrationsRes.error_code)) {
                    toast.error(registrationsRes.message);
                }
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, getTranslate().common.try_again_error));
        } finally {
            set({ isLoadingOpportunities: false, isLoadingRegistrationList: false });
        }
    },

    resetStore: () => {
        set(initialState);
    },
}));

registerResettableStore(useIpoStore);
