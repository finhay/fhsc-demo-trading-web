'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NavAuth } from '@/components/common/header/navigation/NavAuth';
import { StatusBadge } from '@/components/common/header/network-status/StatusBadge';
import { HEADER_ROUTES } from '@/constants/common';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useMarketIndexStore } from '@/stores/common/useMarketIndexStore';

const NAV_BAR = {
    market: 'Thị trường',
    board: 'Bảng giá',
    assets: 'Tài sản',
    trade: 'Giao dịch',
};

export const NavBar = () => {
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
    const route = usePathname();

    const isRouteActive = (item: (typeof HEADER_ROUTES)[number]) =>
        'partialMatch' in item && item.partialMatch
            ? item.activeRoutes.some((r) => route.includes(r))
            : item.activeRoutes.includes(route);

    const getAvailableRoutes = (item: (typeof HEADER_ROUTES)[number]) => {
        if ('requireAuth' in item && item.requireAuth && !profile) return false;
        return true;
    };

    return (
        <section className="base-primary flex items-center px-2 py-1 gap-4">
            <div className="flex flex-1 items-center gap-16">
                <div className="flex items-center gap-4">
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
                    <span className="flex items-center gap-1.5 rounded-md px-1.5 py-[3px] bg-[linear-gradient(90deg,#7BE85A_0%,#9FFF69_31.73%,#AEFF6D_70.19%,#B4F781_100%)]">
                        <span className="relative size-5 shrink-0" aria-hidden>
                            <svg
                                className="absolute text-quaternary"
                                width={17.5}
                                height={12.7273}
                                viewBox="0 0 17.5 12.7273"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{ top: '16.67%', left: '4.17%' }}
                            >
                                <path
                                    d="M12.7273 0C13.9931 0 15.207 0.50284 16.1021 1.3979C16.9972 2.29296 17.5 3.50692 17.5 4.77273V7.95455C17.5 9.22035 16.9972 10.4343 16.1021 11.3294C15.207 12.2244 13.9931 12.7273 12.7273 12.7273H4.77273C3.50692 12.7273 2.29296 12.2244 1.3979 11.3294C0.502839 10.4343 0 9.22035 0 7.95455V4.77273C0 3.50692 0.502839 2.29296 1.3979 1.3979C2.29296 0.50284 3.50692 0 4.77273 0H12.7273ZM12.7273 1.59091H4.77273C3.9564 1.59091 3.1713 1.90466 2.57981 2.46728C1.98832 3.0299 1.6357 3.79833 1.59489 4.61364L1.59091 4.77273V7.95455C1.59091 8.77087 1.90466 9.55598 2.46728 10.1475C3.0299 10.7389 3.79833 11.0916 4.61364 11.1324L4.77273 11.1364H12.7273C13.5436 11.1364 14.3287 10.8226 14.9202 10.26C15.5117 9.69738 15.8643 8.92894 15.9051 8.11364L15.9091 7.95455V4.77273C15.9091 3.9564 15.5953 3.1713 15.0327 2.57981C14.4701 1.98832 13.7017 1.6357 12.8864 1.59489L12.7273 1.59091ZM7.15909 3.97727V5.56818H8.75V7.15909H7.1583L7.15909 8.75H5.56818L5.56739 7.15909H3.97727V5.56818H5.56818V3.97727H7.15909ZM13.5227 7.15909V8.75H11.9318V7.15909H13.5227ZM11.9318 3.97727V5.56818H10.3409V3.97727H11.9318Z"
                                    fill="currentColor"
                                />
                            </svg>
                        </span>
                        <span className="body-4-highlight text-quaternary whitespace-nowrap">
                            Demo Trading
                        </span>
                    </span>
                </div>
                <nav aria-label="Main navigation">
                    <ul className="flex gap-8 items-center list-none">
                        {HEADER_ROUTES.filter(getAvailableRoutes).map((item) => {
                            const active = isRouteActive(item);

                            return (
                                <li key={item.path} className="group relative">
                                    <Link
                                        href={item.path}
                                        className={`flex items-center gap-2 py-2 ${
                                            active
                                                ? 'text-primary body-4-highlight'
                                                : 'text-secondary body-4'
                                        }`}
                                    >
                                        {NAV_BAR[item.translationKey as keyof typeof NAV_BAR]}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
            <span className="body-4 text-primary tabular-nums">{time}</span>
            <StatusBadge />
            <NavAuth />
        </section>
    );
};
