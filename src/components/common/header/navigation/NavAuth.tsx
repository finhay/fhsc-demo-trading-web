'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/router';

import { FaChevronDown, FaChevronRight } from 'react-icons/fa6';

import { ACCOUNT_DASHBOARD_MENU_ITEMS } from '@/constants/account';
import { AUTH_ROUTES, DEFAULT_AVATAR_URL, NextAction } from '@/constants/common';
import { useTranslate } from '@/hooks/useTranslate';
import { useAccountStore } from '@/stores/account/useAccountStore';
import { useAuthFlowStore } from '@/stores/auth/useAuthFlowStore';
import { useAuthStore } from '@/stores/auth/useAuthStore';

export const NavAuth = () => {
    const trans = useTranslate();
    const menuLabelMap = trans.account_menu.menu;
    const [isShowDropBox, setIsShowDropBox] = useState<boolean>(false);
    const { profile, logout, avatarUrl } = useAuthStore();
    const { setActiveTab } = useAccountStore();
    const { openAuthDialog } = useAuthFlowStore();
    const router = useRouter();

    useEffect(() => {
        if (!profile) setIsShowDropBox(false);
    }, [profile]);

    return (
        <>
            {profile ? (
                <nav className="flex items-center gap-2" aria-label="User authentication">
                    {profile?.next_action === NextAction.EKYC && (
                        <span className="text-primary font-caption-highlight">
                            {trans.nav_auth.acct_unverified}
                        </span>
                    )}
                    <div
                        className="relative"
                        onMouseEnter={() => setIsShowDropBox(true)}
                        onMouseLeave={() => setIsShowDropBox(false)}
                    >
                        <button
                            type="button"
                            className="flex items-center gap-2"
                            aria-label="User menu"
                            aria-expanded={isShowDropBox}
                            aria-controls="user-dropdown-menu"
                        >
                            <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-tertiary">
                                <Image
                                    src={avatarUrl || DEFAULT_AVATAR_URL}
                                    alt="User avatar"
                                    fill
                                    sizes="28px"
                                    className="object-cover object-center"
                                />
                            </div>
                            <FaChevronDown
                                size={16}
                                aria-hidden="true"
                                className={`text-primary transition-transform duration-300 ${isShowDropBox ? 'rotate-180' : ''}`}
                            />
                        </button>
                        <div
                            className={`absolute z-10 right-0 top-full w-80 pt-1 transition-all duration-100 ease-in-out ${
                                isShowDropBox
                                    ? 'opacity-100 visible'
                                    : 'opacity-0 invisible pointer-events-none'
                            }`}
                        >
                            <menu
                                id="user-dropdown-menu"
                                className="flex flex-col gap-8 bg-tertiary rounded-xl text-primary p-4"
                                role="menu"
                            >
                                <div className="flex gap-4 items-center">
                                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-tertiary">
                                        <Image
                                            src={avatarUrl || DEFAULT_AVATAR_URL}
                                            alt={trans.account_menu.avatar_alt}
                                            fill
                                            sizes="40px"
                                            className="object-cover object-center"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-body-2-highlight text-primary">
                                            {profile?.full_name}
                                        </span>
                                        <span className="font-body-3 text-highlight">
                                            {profile?.depository_number}
                                        </span>
                                    </div>
                                </div>
                                <nav
                                    className="flex flex-col gap-6"
                                    aria-label={trans.account_menu.nav_aria}
                                >
                                    {ACCOUNT_DASHBOARD_MENU_ITEMS.map((item) => {
                                        const Icon = item.icon;

                                        return (
                                            <button
                                                key={item.tab}
                                                type="button"
                                                className="flex cursor-pointer items-center justify-between"
                                                onClick={() => {
                                                    setActiveTab(item.tab);
                                                    router.push('/tai-khoan');
                                                    setIsShowDropBox(false);
                                                }}
                                                role="menuitem"
                                            >
                                                <span className="flex items-center gap-4">
                                                    <Icon size={18} className="text-secondary" />
                                                    <span className="font-body-2 text-primary">
                                                        {menuLabelMap[item.tab]}
                                                    </span>
                                                </span>
                                                <FaChevronRight
                                                    size={14}
                                                    className="text-secondary"
                                                />
                                            </button>
                                        );
                                    })}
                                </nav>
                                <button
                                    className="cursor-pointer font-body-3 text-red bg-primary px-6 py-1.5 rounded-full w-fit"
                                    onClick={logout}
                                    role="menuitem"
                                >
                                    {trans.nav_auth.logout}
                                </button>
                            </menu>
                        </div>
                    </div>
                </nav>
            ) : (
                <nav className="flex items-center gap-4" aria-label="Authentication actions">
                    {AUTH_ROUTES.map((route) => (
                        <button
                            key={route.mode}
                            type="button"
                            className={`flex items-center justify-center rounded-full font-caption-highlight py-1.5 w-28 ${
                                route.isPrimary
                                    ? 'bg-highlight text-quaternary'
                                    : 'bg-tertiary text-highlight'
                            }`}
                            onClick={() => openAuthDialog(route.mode)}
                        >
                            {trans.nav_auth[route.translationKey]}
                        </button>
                    ))}
                </nav>
            )}
        </>
    );
};
