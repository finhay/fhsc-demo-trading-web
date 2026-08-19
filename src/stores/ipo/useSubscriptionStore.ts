import { create } from 'zustand';

import { DEFAULT_REGISTRATION_INFO, SUBSCRIPTION_FLOW_STEPS } from '@/constants/ipo';
import { toast } from '@/hooks/lib/useToast';
import { getTranslate } from '@/hooks/useTranslate';
import { fetchIpoRegistrationBuyInfo, submitIpoRegistrationBuy } from '@/services/api/ipo-hunt';
import { getUserWithdrawalAvailableBalance } from '@/services/api/payments';
import { getUserId } from '@/services/localStorage';
import { registerResettableStore } from '@/stores/reset-registry';
import { IpoRegistrationBuyInfoData, OpportunityItem } from '@/types/ipo-hunt';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';

type SubscriptionFlowStep = (typeof SUBSCRIPTION_FLOW_STEPS)[keyof typeof SUBSCRIPTION_FLOW_STEPS];

type SubscriptionFlowState = {
    isOpen: boolean;
    step: SubscriptionFlowStep;
    selectedItem: OpportunityItem | null;
    registrationInfo: IpoRegistrationBuyInfoData;
    quantity: number;
    price: number;
    availableBalance: number | null;
    isSubmitting: boolean;
    orderId: number | null;
};

type SubscriptionFlowActions = {
    setQuantity: (quantity: number) => void;
    setPrice: (price: number) => void;
    setStep: (step: SubscriptionFlowStep) => void;
    setProceedToConfirm: (quantity: number, price: number) => void;
    openFlow: (item: OpportunityItem) => Promise<void>;
    submitRegistration: () => Promise<boolean>;
    resetStore: () => void;
};

const initialState: SubscriptionFlowState = {
    isOpen: false,
    step: SUBSCRIPTION_FLOW_STEPS.FORM,
    selectedItem: null,
    registrationInfo: DEFAULT_REGISTRATION_INFO,
    quantity: 0,
    price: 0,
    availableBalance: null,
    isSubmitting: false,
    orderId: null,
};

export const useSubscriptionStore = create<SubscriptionFlowState & SubscriptionFlowActions>(
    (set, get) => ({
        ...initialState,

        setQuantity: (quantity: number) => {
            set({ quantity });
        },

        setPrice: (price: number) => {
            set({ price });
        },

        setStep: (step: SubscriptionFlowStep) => {
            set({ step });
        },

        setProceedToConfirm: (quantity: number, price: number) => {
            set({ quantity, price, step: SUBSCRIPTION_FLOW_STEPS.CONFIRM });
        },

        openFlow: async (item: OpportunityItem) => {
            set({ selectedItem: item });
            try {
                const userId = getUserId();
                const [registrationResponse, balanceResponse] = await Promise.allSettled([
                    fetchIpoRegistrationBuyInfo(item.symbol),
                    userId ? getUserWithdrawalAvailableBalance() : Promise.reject(),
                ]);

                if (registrationResponse.status === 'fulfilled') {
                    const { error_code, message, data } = registrationResponse.value;
                    if (isSuccessApi(error_code)) {
                        const registrationInfo = data ?? DEFAULT_REGISTRATION_INFO;
                        set({
                            registrationInfo,
                            quantity: registrationInfo.min_quantity,
                            price: registrationInfo.min_price,
                            isOpen: true,
                            step: SUBSCRIPTION_FLOW_STEPS.FORM,
                        });
                    } else {
                        toast.error(message);
                    }
                } else {
                    toast.error(getTranslate().common.try_again_error);
                }

                if (balanceResponse.status === 'fulfilled') {
                    const availableBalance = balanceResponse.value.result?.availableBalance ?? null;
                    set({ availableBalance });
                } else {
                    set({ availableBalance: null });
                }
            } catch (err) {
                toast.error(getApiErrorMessage(err, getTranslate().common.try_again_error));
            }
        },

        submitRegistration: async () => {
            const { selectedItem, quantity, price } = get();
            if (!selectedItem) return false;

            set({ isSubmitting: true });
            try {
                const { error_code, message, data } = await submitIpoRegistrationBuy({
                    symbol: selectedItem.symbol,
                    quantity,
                    price,
                });

                if (isSuccessApi(error_code)) {
                    set({
                        orderId: data.id,
                        step: SUBSCRIPTION_FLOW_STEPS.OTP,
                    });
                    return true;
                } else {
                    toast.error(message);
                    return false;
                }
            } catch (err) {
                toast.error(getApiErrorMessage(err, getTranslate().common.try_again_error));
                return false;
            } finally {
                set({ isSubmitting: false });
            }
        },

        resetStore: () => {
            set(initialState);
        },
    }),
);

registerResettableStore(useSubscriptionStore);
