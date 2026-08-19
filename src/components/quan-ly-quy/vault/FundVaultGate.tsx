'use client';

import { ReactNode, useEffect } from 'react';

import { FundRecoveryKit } from '@/components/quan-ly-quy/vault/FundRecoveryKit';
import { FundVaultSetup } from '@/components/quan-ly-quy/vault/FundVaultSetup';
import { FundVaultUnlock } from '@/components/quan-ly-quy/vault/FundVaultUnlock';
import { useFundDataStore } from '@/stores/fund/useFundDataStore';
import { useFundInvestorStore } from '@/stores/fund/useFundInvestorStore';
import { useFundTradeStore } from '@/stores/fund/useFundTradeStore';
import { useFundVaultStore } from '@/stores/fund/useFundVaultStore';

type Props = { children: ReactNode };

export const FundVaultGate = ({ children }: Props) => {
    const { status, pendingRecoveryKit, refresh, bumpActivity } = useFundVaultStore();

    useEffect(() => {
        refresh();
    }, [refresh]);

    useEffect(() => {
        if (status === 'locked') {
            useFundDataStore.getState().resetStore();
            useFundTradeStore.getState().resetStore();
            useFundInvestorStore.getState().resetStore();
        }
    }, [status]);

    useEffect(() => {
        if (status !== 'unlocked') return;
        const onActivity = () => bumpActivity();
        window.addEventListener('pointerdown', onActivity);
        window.addEventListener('keydown', onActivity);
        return () => {
            window.removeEventListener('pointerdown', onActivity);
            window.removeEventListener('keydown', onActivity);
        };
    }, [status, bumpActivity]);

    if (status === 'loading') {
        return <div className="flex min-h-0 flex-1 items-center justify-center" aria-busy="true" />;
    }
    if (status === 'uninitialized') return <FundVaultSetup />;
    if (status === 'locked') return <FundVaultUnlock />;
    if (pendingRecoveryKit) return <FundRecoveryKit secretKey={pendingRecoveryKit} />;
    return <>{children}</>;
};
