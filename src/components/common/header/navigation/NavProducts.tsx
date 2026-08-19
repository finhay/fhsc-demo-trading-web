'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { FaChevronRight } from 'react-icons/fa';

import {
    ACCOUNT_TYPE,
    OTHER_PRODUCTS_NAV,
    OtherProductNavItem,
    OtherProductNavSection,
} from '@/constants/common';
import { useTranslate } from '@/hooks/useTranslate';
import { useAuthStore } from '@/stores/auth/useAuthStore';

export const NavProducts = () => {
    const trans = useTranslate();
    const { profile } = useAuthStore();
    const router = useRouter();
    const route = String(router.route);
    const isEnterprise = profile?.user_type === ACCOUNT_TYPE.ENTERPRISE;
    const isIndividual = profile?.user_type === ACCOUNT_TYPE.INDIVIDUAL;

    const isItemAvailable = (item: OtherProductNavItem) => {
        if (item.requireAuth && !profile) return false;
        if (item.requireEnterprise && !isEnterprise) return false;
        if (item.requireIndividual && !isIndividual) return false;
        return true;
    };

    const isItemActive = (item: OtherProductNavItem) =>
        item.partialMatch
            ? item.activeRoutes.some((r) => route.includes(r))
            : item.activeRoutes.includes(route);

    const availableSections = OTHER_PRODUCTS_NAV.sections
        .map((section) => ({
            ...section,
            children: section.children.filter(isItemAvailable),
        }))
        .filter((section) => section.children.length > 0);

    if (availableSections.length === 0) return null;

    const isParentActive = availableSections.some((section) => section.children.some(isItemActive));

    const renderSection = (section: OtherProductNavSection) => {
        const sectionTitle = trans.nav_bar[section.sectionKey as keyof typeof trans.nav_bar];

        return (
            <div key={section.sectionKey} className="flex w-[280px] flex-col gap-6">
                <p className="font-body-3 text-secondary">{sectionTitle}</p>
                <ul className="flex flex-col gap-6 list-none">
                    {section.children.map((item) => {
                        const title =
                            trans.nav_bar[item.translationKey as keyof typeof trans.nav_bar];
                        const description =
                            trans.nav_bar[item.descriptionKey as keyof typeof trans.nav_bar];
                        const isActive = isItemActive(item);
                        const titleColor = isActive ? 'text-highlight' : 'text-primary';

                        return (
                            <li key={item.path}>
                                <Link
                                    href={item.path}
                                    className="group/item flex cursor-pointer items-center gap-3"
                                >
                                    <div className="relative size-9 shrink-0 overflow-hidden rounded-xl border border-quaternary">
                                        <Image
                                            src={item.icon}
                                            alt=""
                                            width={36}
                                            height={36}
                                            className="size-full object-contain p-2"
                                        />
                                    </div>
                                    <div className="flex min-w-0 flex-col gap-1">
                                        <span
                                            className={`flex items-center gap-3 font-body-3-highlight group-hover/item:text-highlight ${titleColor}`}
                                        >
                                            {title}
                                            <FaChevronRight
                                                size={12}
                                                className="hidden shrink-0 text-highlight group-hover/item:block"
                                            />
                                        </span>
                                        <span className="font-caption text-secondary group-hover/item:text-primary">
                                            {description}
                                        </span>
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    };

    return (
        <li className="group relative">
            <span
                className={`flex cursor-pointer items-center gap-2 py-2 ${
                    isParentActive
                        ? 'text-primary font-body-3-highlight'
                        : 'text-secondary font-body-3'
                }`}
            >
                {trans.nav_bar.other_products}
            </span>
            <div className="invisible absolute left-0 top-full z-20 opacity-0 transition-all duration-100 ease-in-out group-hover:visible group-hover:opacity-100">
                <div className="flex gap-6 rounded-xl bg-tertiary px-4 py-6">
                    {availableSections.map(renderSection)}
                </div>
            </div>
        </li>
    );
};
