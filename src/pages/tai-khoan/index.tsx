'use client';

import { AccountAPIManagement } from '@/components/tai-khoan/AccountAPIManagement';
import { AccountDashboard } from '@/components/tai-khoan/AccountDashboard';
import { AccountDeviceManagement } from '@/components/tai-khoan/AccountDeviceManagement';
import { AccountInfo } from '@/components/tai-khoan/AccountInfo';
import { AccountSupport } from '@/components/tai-khoan/AccountSupport';
import { ACCOUNT_TABS } from '@/constants/account';
import { DefaultLayout } from '@/layouts/DefaultLayout';
import { useAccountStore } from '@/stores/account/useAccountStore';

export default function TaiKhoan() {
    const { activeTab } = useAccountStore();

    return (
        <DefaultLayout title="Tài khoản" metaDescription="Tài khoản">
            <article className="flex h-full min-h-0 gap-2 overflow-hidden">
                <section className="w-80 shrink-0 h-full min-h-0">
                    <AccountDashboard />
                </section>
                <section className="flex-1 h-full min-h-0 overflow-hidden">
                    {activeTab === ACCOUNT_TABS.INFO && <AccountInfo />}
                    {activeTab === ACCOUNT_TABS.API && <AccountAPIManagement />}
                    {activeTab === ACCOUNT_TABS.DEVICE && <AccountDeviceManagement />}
                    {activeTab === ACCOUNT_TABS.SUPPORT && <AccountSupport />}
                </section>
            </article>
        </DefaultLayout>
    );
}
