'use client';

import { useEffect, useState } from 'react';

import { FaChevronDown } from 'react-icons/fa6';

import { useClickOutside } from '@/hooks/lib/useClickOutside';
import { useTranslate } from '@/hooks/useTranslate';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { SubAccount } from '@/types/accounts/profile';
import { formatSubAccountLabel } from '@/utils/assets';
import { hasSubAccountPermission } from '@/utils/common';

type Props = {
    permission?: string;
    variant?: 'standalone' | 'embedded';
    borderClass?: string;
};

export const SubAccounts = ({
    permission,
    variant = 'standalone',
    borderClass = 'border-quaternary',
}: Props) => {
    const trans = useTranslate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const { subAccounts, activeSubAccount, setActiveSubAccount } = useAuthStore();

    const visibleSubAccounts = permission
        ? subAccounts.filter((account) => hasSubAccountPermission(account, permission))
        : subAccounts;

    const dropdownRef = useClickOutside<HTMLDivElement>(() => {
        setIsDropdownOpen(false);
    }, isDropdownOpen);

    const handleSelectAccount = (account: SubAccount) => {
        setActiveSubAccount(account);
        setIsDropdownOpen(false);
    };

    useEffect(() => {
        if (!permission || visibleSubAccounts.length === 0) return;
        const isActiveVisible = visibleSubAccounts.some(
            (account) => account.sub_account_id === activeSubAccount?.sub_account_id,
        );
        if (!isActiveVisible) {
            setActiveSubAccount(visibleSubAccounts[0]);
        }
    }, [permission, visibleSubAccounts, activeSubAccount, setActiveSubAccount]);

    return (
        <section
            ref={dropdownRef}
            className="relative w-full"
            aria-label={trans.sub_account.aria_label}
        >
            <button
                type="button"
                className={`flex justify-between items-center gap-2 w-full rounded-xl px-3 cursor-pointer select-none ${
                    variant === 'embedded'
                        ? `border ${borderClass} bg-transparent py-2`
                        : 'bg-secondary py-2.5'
                }`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
                aria-haspopup="listbox"
            >
                <span className="font-body-3-highlight text-primary">
                    {activeSubAccount
                        ? formatSubAccountLabel(activeSubAccount)
                        : trans.sub_account.placeholder}
                </span>
                <FaChevronDown
                    className={`text-secondary text-base shrink-0 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                    aria-hidden="true"
                />
            </button>
            {isDropdownOpen && visibleSubAccounts.length > 0 && (
                <ul
                    className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-tertiary bg-secondary"
                    role="listbox"
                    aria-label={trans.sub_account.placeholder}
                >
                    {visibleSubAccounts.map((account) => {
                        const isSelected =
                            activeSubAccount?.sub_account_id === account.sub_account_id;
                        return (
                            <li key={account.sub_account_id}>
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={isSelected}
                                    onClick={() => handleSelectAccount(account)}
                                    className={`flex w-full items-center px-3 py-2 text-left font-body-3-highlight transition-colors ${
                                        isSelected
                                            ? 'bg-tertiary text-primary'
                                            : 'text-secondary hover:bg-tertiary hover:text-primary'
                                    }`}
                                >
                                    {formatSubAccountLabel(account)}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
};
