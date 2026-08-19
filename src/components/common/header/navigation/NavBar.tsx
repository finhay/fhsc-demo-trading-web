'use client';

import { Fragment } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { NavAuth } from '@/components/common/header/navigation/NavAuth';
import { NavProducts } from '@/components/common/header/navigation/NavProducts';
import { StatusBadge } from '@/components/common/header/network-status/StatusBadge';
import { HEADER_ROUTES } from '@/constants/common';
import { useTranslate } from '@/hooks/useTranslate';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useMarketIndexStore } from '@/stores/common/useMarketIndexStore';

export const NavBar = () => {
    const trans = useTranslate();
    const { profile } = useAuthStore();
    const { now } = useMarketIndexStore();
    const time = now
        ? new Date(now).toLocaleTimeString('vi-VN', {
              timeZone: 'Asia/Ho_Chi_Minh',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
          })
        : '';
    const router = useRouter();
    const route = String(router.route);

    const isRouteActive = (item: (typeof HEADER_ROUTES)[number]) =>
        'partialMatch' in item && item.partialMatch
            ? item.activeRoutes.some((r) => route.includes(r))
            : item.activeRoutes.includes(route);

    const getAvailableRoutes = (item: (typeof HEADER_ROUTES)[number]) => {
        if ('requireAuth' in item && item.requireAuth && !profile) return false;
        return true;
    };

    return (
        <section className="bg-primary flex items-center px-2 py-1 gap-4">
            <Link href="/" aria-label="Go to homepage">
                <Image
                    src="https://cdn1.finhay.com.vn/vnsc-prod/1767153996783.1545-Frame%202612150.png?w=256"
                    width={100}
                    height={40}
                    className="w-25 h-auto object-contain"
                    alt="FHSC"
                    priority={true}
                />
            </Link>
            <nav className="flex-1" aria-label="Main navigation">
                <ul className="flex gap-8 items-center list-none">
                    {HEADER_ROUTES.filter(getAvailableRoutes).map((item) => {
                        const active = isRouteActive(item);

                        return (
                            <Fragment key={item.path}>
                                <li className="group relative">
                                    <Link
                                        href={item.path}
                                        className={`flex items-center gap-2 py-2 ${
                                            active
                                                ? 'text-primary font-body-3-highlight'
                                                : 'text-secondary font-body-3'
                                        }`}
                                    >
                                        {
                                            trans.nav_bar[
                                                item.translationKey as keyof typeof trans.nav_bar
                                            ]
                                        }
                                    </Link>
                                </li>
                                {item.translationKey === 'assets' && <NavProducts />}
                            </Fragment>
                        );
                    })}
                </ul>
            </nav>
            <span className="font-body-3 text-primary tabular-nums">{time}</span>
            <StatusBadge />
            <NavAuth />
        </section>
    );
};
