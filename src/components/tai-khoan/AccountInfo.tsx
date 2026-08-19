'use client';

import { useEffect, useRef, useState } from 'react';

import { FaFile } from 'react-icons/fa6';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { PDFViewer } from '@/components/common/feature/PDFViewer';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { useTranslate } from '@/hooks/useTranslate';
import {
    fetchContractTermsByType,
    fetchUserEnterpriseContracts,
} from '@/services/api/accounts/contracts';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import type { EnterpriseContract } from '@/types/pages/account';
import { base64ToPdfUrl, getSubAccountLabel } from '@/utils/account';
import { isSuccessApi } from '@/utils/common';

export const AccountInfo = () => {
    const trans = useTranslate();
    const { profile, subAccounts, isLoadingProfile } = useAuthStore();
    const { startLoading, stopLoading } = useLoadingStore();
    const [contracts, setContracts] = useState<EnterpriseContract[]>([]);
    const [isLoadingContracts, setIsLoadingContracts] = useState(true);
    const [viewerPdfUrl, setViewerPdfUrl] = useState<string | null>(null);
    const [viewerTitle, setViewerTitle] = useState<string>('');
    const [viewerError, setViewerError] = useState<string | null>(null);
    const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
    const pdfUrlCacheRef = useRef<Record<string, string>>({});
    const hasBankAccount = Boolean(profile?.bank_account_number?.trim());

    const openPdfViewer = (url: string | null, title: string, error?: string | null) => {
        setViewerTitle(title);
        setViewerPdfUrl(url);
        setViewerError(error ?? (url ? null : trans.account.info.pdf_not_found));
        setIsPdfViewerOpen(true);
    };

    const handleContractClick = async (contract: EnterpriseContract) => {
        startLoading();
        try {
            const cachedUrl = pdfUrlCacheRef.current[contract.contract_type];
            if (cachedUrl) {
                openPdfViewer(cachedUrl, contract.title);
                return;
            }

            const { error_code, message, result } = await fetchContractTermsByType(
                contract.contract_type,
            );
            if (isSuccessApi(error_code) && result) {
                const url = base64ToPdfUrl(result);
                pdfUrlCacheRef.current[contract.contract_type] = url;
                openPdfViewer(url, contract.title);
                return;
            }

            openPdfViewer(null, contract.title, message || trans.account.info.pdf_load_error);
        } catch {
            openPdfViewer(null, contract.title, trans.account.info.pdf_load_error);
        } finally {
            stopLoading();
        }
    };

    const loadContracts = async () => {
        setIsLoadingContracts(true);
        const { error_code, data } = await fetchUserEnterpriseContracts();
        if (isSuccessApi(error_code)) {
            setContracts(data ?? []);
        }
        setIsLoadingContracts(false);
    };

    useEffect(() => {
        loadContracts();
    }, []);

    useEffect(() => {
        const cache = pdfUrlCacheRef.current;
        return () => {
            Object.values(cache).forEach((url) => URL.revokeObjectURL(url));
        };
    }, []);

    return (
        <section className="flex size-full flex-col gap-2 rounded-xl">
            <PDFViewer
                isOpen={isPdfViewerOpen}
                pdfUrl={viewerPdfUrl}
                title={viewerTitle}
                error={viewerError}
                onClose={() => {
                    setIsPdfViewerOpen(false);
                    setViewerError(null);
                }}
            />
            <header className="flex items-center gap-2">
                <h2 className="font-heading-4 text-primary">{trans.account.info.title}</h2>
            </header>
            <main className="flex flex-1 min-h-0 flex-col gap-2">
                <section className="flex gap-2">
                    <article className="flex flex-1 min-w-0 flex-col gap-4 rounded-xl bg-secondary p-3">
                        <h3 className="font-body-2-highlight text-primary">
                            {trans.account.info.personal_title}
                        </h3>
                        {isLoadingProfile ? (
                            <div className="h-40">
                                <Skeleton />
                            </div>
                        ) : (
                            <dl className="flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <dt className="flex-1 font-body-2 text-secondary">
                                        {trans.account.info.personal_name_label}
                                    </dt>
                                    <dd className="flex-1 text-right font-body-2 text-primary">
                                        {profile?.full_name || '--'}
                                    </dd>
                                </div>
                                <div className="flex items-center gap-2">
                                    <dt className="flex-1 font-body-2 text-secondary">
                                        {trans.account.info.custody_number_label}
                                    </dt>
                                    <dd className="flex-1 text-right font-body-2 text-primary">
                                        {profile?.depository_number || '--'}
                                    </dd>
                                </div>
                                <div className="flex items-center gap-2">
                                    <dt className="flex-1 font-body-2 text-secondary">
                                        {trans.account.info.email_label}
                                    </dt>
                                    <dd className="flex-1 text-right font-body-2 text-primary">
                                        {profile?.email || '--'}
                                    </dd>
                                </div>
                                <div className="flex items-center gap-2">
                                    <dt className="flex-1 font-body-2 text-secondary">
                                        {trans.account.info.address_label}
                                    </dt>
                                    <dd className="flex-1 text-right font-body-2 text-primary">
                                        {profile?.address || '--'}
                                    </dd>
                                </div>
                            </dl>
                        )}
                    </article>
                    <article className="flex flex-1 min-w-0 flex-col gap-4 rounded-xl bg-secondary p-3">
                        <div className="flex items-center gap-4">
                            <h3 className="font-body-1-highlight text-primary">
                                {trans.account.info.bank_title}
                            </h3>
                            {hasBankAccount && (
                                <span className="rounded-full border border-highlight bg-tertiary px-3 py-1 font-body-3 text-primary">
                                    {trans.account.info.bank_verified}
                                </span>
                            )}
                        </div>
                        {isLoadingProfile ? (
                            <div className="h-32">
                                <Skeleton />
                            </div>
                        ) : (
                            <dl className="flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <dt className="flex-1 font-body-2 text-secondary">
                                        {trans.account.info.bank_account_name_label}
                                    </dt>
                                    <dd className="flex-1 text-right font-body-2 text-primary">
                                        {profile?.bank_account_name || '--'}
                                    </dd>
                                </div>
                                <div className="flex items-center gap-2">
                                    <dt className="flex-1 font-body-2 text-secondary">
                                        {trans.account.info.bank_account_number_label}
                                    </dt>
                                    <dd className="flex-1 text-right font-body-2 text-primary">
                                        {profile?.bank_account_number || '--'}
                                    </dd>
                                </div>
                                <div className="flex items-center gap-2">
                                    <dt className="flex-1 font-body-2 text-secondary">
                                        {trans.account.info.bank_name_label}
                                    </dt>
                                    <dd className="flex-1 text-right font-body-2 text-primary">
                                        {profile?.bank_name || '--'}
                                    </dd>
                                </div>
                            </dl>
                        )}
                    </article>
                </section>
                <section className="flex gap-2">
                    <article className="flex flex-1 min-w-0 flex-col gap-4 rounded-xl bg-secondary p-3">
                        <h3 className="font-body-2-highlight text-primary">
                            {trans.account.info.sub_accounts_title}
                        </h3>
                        {isLoadingProfile ? (
                            <div className="h-36">
                                <Skeleton />
                            </div>
                        ) : (
                            <dl className="flex flex-col gap-4">
                                {subAccounts.length ? (
                                    subAccounts.map((account) => (
                                        <div
                                            key={account.sub_account_id}
                                            className="flex items-center gap-2"
                                        >
                                            <dt className="flex-1 font-body-2 text-secondary">
                                                {getSubAccountLabel(
                                                    account.product_type_name,
                                                    account.account_type,
                                                )}
                                            </dt>
                                            <dd className="flex-1 text-right font-body-2 text-primary">
                                                {account.sub_account_ext || '--'}
                                            </dd>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <dt className="flex-1 font-body-2 text-secondary">
                                            {trans.account.info.sub_account_label}
                                        </dt>
                                        <dd className="flex-1 text-right font-body-2 text-primary">
                                            --
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        )}
                    </article>
                    <article className="flex flex-1 min-w-0 flex-col gap-4 rounded-xl bg-secondary p-3">
                        <h3 className="font-body-2-highlight text-primary">
                            {trans.account.info.contracts_title}
                        </h3>
                        {isLoadingContracts ? (
                            <div className="h-36">
                                <Skeleton />
                            </div>
                        ) : (
                            <ul className="flex flex-col gap-4">
                                {contracts.length ? (
                                    contracts.map((contract) => (
                                        <li key={`${contract.contract_type}-${contract.title}`}>
                                            <button
                                                type="button"
                                                onClick={() => handleContractClick(contract)}
                                                className="flex items-center gap-2 text-left"
                                            >
                                                <FaFile
                                                    size={24}
                                                    className="shrink-0 text-highlight"
                                                />
                                                <p className="font-body-2 text-primary">
                                                    {contract.title}
                                                </p>
                                            </button>
                                        </li>
                                    ))
                                ) : (
                                    <EmptyState />
                                )}
                            </ul>
                        )}
                    </article>
                </section>
            </main>
        </section>
    );
};
