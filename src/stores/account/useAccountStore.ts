import { create } from 'zustand';

import { ACCOUNT_TABS } from '@/constants/account';

type AccountTab = (typeof ACCOUNT_TABS)[keyof typeof ACCOUNT_TABS];

type AccountState = {
    activeTab: AccountTab;
};

type AccountActions = {
    setActiveTab: (tab: AccountTab) => void;
};

export const useAccountStore = create<AccountState & AccountActions>((set) => ({
    activeTab: ACCOUNT_TABS.INFO,
    setActiveTab: (tab) => set({ activeTab: tab }),
}));
