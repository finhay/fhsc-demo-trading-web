'use client';

import Image from 'next/image';

import { RiArrowRightSLine } from 'react-icons/ri';

import { ACCOUNT_DASHBOARD_MENU_ITEMS } from '@/constants/account';
import { DEFAULT_AVATAR_URL } from '@/constants/common';
import { useTranslate } from '@/hooks/useTranslate';
import { useAccountStore } from '@/stores/account/useAccountStore';
import { useAuthStore } from '@/stores/auth/useAuthStore';

export const AccountDashboard = () => {
    const trans = useTranslate();
    const { profile, avatarUrl, custId, userId } = useAuthStore();
    const { activeTab, setActiveTab } = useAccountStore();
    const menuLabelMap = trans.account_menu.menu;
    const isLevel3 = profile?.ekyc_level === 'LEVEL_3';

    return (
        <aside className="flex h-full w-full flex-col gap-8 rounded-xl bg-secondary p-4">
            <header className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-tertiary">
                        <Image
                            src={avatarUrl || DEFAULT_AVATAR_URL}
                            alt={trans.account_menu.avatar_alt}
                            width={48}
                            height={48}
                            className="size-full object-cover"
                        />
                    </div>
                    <div className="h-14 min-w-0">
                        <p className="truncate font-body-1-highlight text-primary">
                            {profile?.full_name || ''}
                        </p>
                        <p className="truncate font-body-2 text-secondary">
                            {profile?.depository_number || custId || ''}
                        </p>
                    </div>
                </div>
                {isLevel3 && (
                    <span className="w-fit whitespace-nowrap rounded-full border border-highlight bg-tertiary px-3 py-1 font-body-3 text-primary">
                        {trans.account.dashboard.ready_to_trade}
                    </span>
                )}
            </header>
            <nav className="flex-1" aria-label={trans.account_menu.nav_aria}>
                <ul className="flex flex-col gap-8">
                    {ACCOUNT_DASHBOARD_MENU_ITEMS.map((item) => {
                        const Icon = item.icon;

                        return (
                            <li key={item.tab}>
                                <button
                                    type="button"
                                    className="flex w-full items-center gap-2"
                                    onClick={() => setActiveTab(item.tab)}
                                >
                                    <Icon size={24} className="shrink-0 text-secondary" />
                                    <span
                                        className={`flex-1 text-left font-body-2 ${
                                            activeTab === item.tab
                                                ? 'text-primary'
                                                : 'text-secondary'
                                        }`}
                                    >
                                        {menuLabelMap[item.tab]}
                                    </span>
                                    <RiArrowRightSLine
                                        size={24}
                                        className="shrink-0 text-secondary"
                                    />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
};
