'use client';

import { ReactNode } from 'react';

import { FaLock } from 'react-icons/fa6';

type Props = {
    title: string;
    icon?: ReactNode;
    children: ReactNode;
};

export const FundVaultShell = ({ title, icon, children }: Props) => (
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-4">
        <div className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-quaternary bg-secondary p-6">
            <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success text-highlight">
                    {icon ?? <FaLock size={16} aria-hidden="true" />}
                </span>
                <h2 className="font-body-1-highlight text-primary">{title}</h2>
            </div>
            {children}
        </div>
    </div>
);
