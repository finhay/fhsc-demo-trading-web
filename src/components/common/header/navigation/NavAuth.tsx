'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';

import { FaChevronDown } from 'react-icons/fa6';

import { AUTH_ROUTES, DEFAULT_AVATAR_URL, NextAction } from '@/constants/common';
import { useAuthFlowStore } from '@/stores/auth/useAuthFlowStore';
import { useAuthStore } from '@/stores/auth/useAuthStore';

const NAV_AUTH = {
    login: 'Đăng nhập',
    register: 'Đăng ký',
    acct_unverified: 'Tài khoản chưa được định danh',
    profile: 'Hồ sơ',
    logout: 'Đăng xuất',
};

export const NavAuth = () => {
    const [isShowDropBox, setIsShowDropBox] = useState<boolean>(false);
    const { profile, logout, avatarUrl } = useAuthStore();
    const { openAuthDialog } = useAuthFlowStore();

    useEffect(() => {
        if (!profile) setIsShowDropBox(false);
    }, [profile]);

    return (
        <>
            {profile ? (
                <nav className="flex items-center gap-2" aria-label="User authentication">
                    {profile?.next_action === NextAction.EKYC && (
                        <span className="text-primary body-5-highlight">
                            {'Tài khoản chưa được định danh'}
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
                            <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full base-tertiary">
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
                                className="flex flex-col gap-8 base-tertiary rounded-xl text-primary p-4"
                                role="menu"
                            >
                                <div className="flex gap-4 items-center">
                                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full base-tertiary">
                                        <Image
                                            src={avatarUrl || DEFAULT_AVATAR_URL}
                                            alt={'Ảnh đại diện người dùng'}
                                            fill
                                            sizes="40px"
                                            className="object-cover object-center"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="body-3-highlight text-primary">
                                            {profile?.full_name}
                                        </span>
                                        <span className="body-4 text-highlight">
                                            {profile?.depository_number}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    className="cursor-pointer body-4 text-red base-primary px-6 py-1.5 rounded-full w-fit"
                                    onClick={logout}
                                    role="menuitem"
                                >
                                    {'Đăng xuất'}
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
                            className={`flex items-center justify-center rounded-full body-5-highlight py-1.5 w-28 ${
                                route.isPrimary
                                    ? 'base-highlight text-quaternary'
                                    : 'base-tertiary text-highlight'
                            }`}
                            onClick={() => openAuthDialog(route.mode)}
                        >
                            {NAV_AUTH[route.translationKey]}
                        </button>
                    ))}
                </nav>
            )}
        </>
    );
};
