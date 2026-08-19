'use client';

import { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/router';

import { FaCheck, FaCircleInfo, FaCopy, FaEye, FaEyeSlash, FaKey, FaTrash } from 'react-icons/fa6';

import { Skeleton } from '@/components/common/ui/Skeleton';
import { AccountRevokeKeyModal } from '@/components/tai-khoan/AccountRevokeKeyModal';
import { DEFAULT_SCOPES } from '@/constants/account';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import {
    generateApiKey,
    getApiKeys,
    revealApiSecret,
    revokeApiKey,
} from '@/services/api/auth/openapi';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import type { ApiKeyItem } from '@/types/openapi';
import { getApiErrorMessage } from '@/utils/common';

export const AccountAPIManagement = () => {
    const trans = useTranslate();
    const { userId, custId } = useAuthStore();
    const { startLoading, stopLoading } = useLoadingStore();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState<string | null>(null);
    const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
    const [isSecretVisible, setIsSecretVisible] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchActiveApiKey = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const { data } = await getApiKeys();
            const activeKey = data?.find((k: ApiKeyItem) => k.status === 'ACTIVE');
            if (activeKey) {
                setApiKey(activeKey.apiKey);
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.account.openapi.error_generic));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerate = async () => {
        startLoading();
        try {
            const { data } = await generateApiKey({
                userId: Number(userId),
                custId: custId ?? '',
                scopes: DEFAULT_SCOPES,
            });
            setApiKey(data?.apiKey ?? '');
            toast.success(trans.account.openapi.generate_success);
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.account.openapi.error_generic));
        } finally {
            stopLoading();
        }
    };

    const handleRevoke = async () => {
        if (!apiKey) return;
        startLoading();
        try {
            await revokeApiKey(apiKey);
            setApiKey('');
            setApiSecret(null);
            setIsRevokeModalOpen(false);
            toast.success(trans.account.openapi.revoke_success);
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.account.openapi.error_generic));
        } finally {
            stopLoading();
        }
    };

    const resolveApiSecret = async (): Promise<string | undefined> => {
        if (apiSecret) return apiSecret;
        startLoading();
        try {
            const { data } = await revealApiSecret(apiKey);
            setApiSecret(data.apiSecret);
            return data.apiSecret;
        } catch {
            throw new Error('reveal_failed');
        } finally {
            stopLoading();
        }
    };

    const handleCopyField = async (field: 'apiKey' | 'secret' | 'all') => {
        try {
            let text = '';
            if (field === 'apiKey') {
                text = apiKey;
            } else if (field === 'secret' || field === 'all') {
                const secret = await resolveApiSecret();
                if (!secret) return;
                text = field === 'all' ? `API Key: ${apiKey}\nSecret Key: ${secret}` : secret;
            }
            navigator.clipboard.writeText(text);
            if (field === 'all') toast.success(trans.account.openapi.copy_success);
            setCopiedField(field);
            if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
            copyTimerRef.current = setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.account.openapi.error_reveal_secret));
        }
    };

    const handleToggleSecret = async () => {
        if (!apiSecret) {
            try {
                await resolveApiSecret();
            } catch (err) {
                toast.error(getApiErrorMessage(err, trans.account.openapi.error_reveal_secret));
                return;
            }
        }
        setIsSecretVisible((prev) => !prev);
    };

    useEffect(() => {
        fetchActiveApiKey();
        return () => {
            if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
        };
    }, [userId, router]);

    return (
        <section className="flex w-full flex-col gap-2">
            {isRevokeModalOpen && (
                <AccountRevokeKeyModal
                    onRevoke={handleRevoke}
                    onClose={() => setIsRevokeModalOpen(false)}
                />
            )}
            <h1 className="font-heading-4 text-primary">{trans.account.openapi.title}</h1>
            <main className="flex h-full justify-center rounded-xl bg-secondary py-12">
                <section className="flex w-full max-w-4xl flex-col gap-2">
                    {isLoading ? (
                        <div className="h-56">
                            <Skeleton />
                        </div>
                    ) : apiKey ? (
                        <article className="flex flex-col gap-4">
                            <header>
                                <aside className="flex items-start gap-4">
                                    <FaCircleInfo className="shrink-0 text-blue" size={16} />
                                    <div className="flex flex-col gap-2">
                                        <p className="font-body-3 text-blue">
                                            {trans.account.openapi.info_expiry}
                                        </p>
                                        <p className="font-body-3 text-blue">
                                            {trans.account.openapi.info_revoke}
                                        </p>
                                    </div>
                                </aside>
                            </header>
                            <dl className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <dt className="font-body-1-highlight text-primary">
                                        {trans.account.openapi.api_key_label}
                                    </dt>
                                    <dd className="flex w-full items-center justify-between gap-2 rounded-xl bg-quaternary px-3 py-4">
                                        <span className="break-all font-body-2 text-primary">
                                            {apiKey}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopyField('apiKey')}
                                            className="shrink-0 text-secondary transition-colors hover:text-primary"
                                        >
                                            {copiedField === 'apiKey' ? (
                                                <FaCheck size={16} />
                                            ) : (
                                                <FaCopy size={16} />
                                            )}
                                        </button>
                                    </dd>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <dt className="font-body-1-highlight text-primary">
                                        {trans.account.openapi.secret_key_label}
                                    </dt>
                                    <dd className="flex w-full items-center justify-between gap-2 rounded-xl bg-quaternary px-3 py-4">
                                        <span className="font-body-2 tracking-widest text-primary">
                                            {isSecretVisible && apiSecret
                                                ? apiSecret
                                                : '•'.repeat(16)}
                                        </span>
                                        <span className="flex shrink-0 items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={handleToggleSecret}
                                                aria-label={
                                                    isSecretVisible
                                                        ? trans.account.openapi.hide_secret
                                                        : trans.account.openapi.show_secret
                                                }
                                                className="text-secondary transition-colors hover:text-primary disabled:opacity-50"
                                            >
                                                {isSecretVisible ? (
                                                    <FaEyeSlash size={20} />
                                                ) : (
                                                    <FaEye size={20} />
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleCopyField('secret')}
                                                className="text-secondary transition-colors hover:text-primary"
                                            >
                                                {copiedField === 'secret' ? (
                                                    <FaCheck size={16} />
                                                ) : (
                                                    <FaCopy size={16} />
                                                )}
                                            </button>
                                        </span>
                                    </dd>
                                </div>
                            </dl>
                            <footer className="flex justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsRevokeModalOpen(true)}
                                    className="flex w-80 items-center justify-center gap-2 rounded-full bg-red py-2.5 text-primary transition-colors hover:bg-red"
                                >
                                    <FaTrash size={16} />
                                    <span className="font-body-3-highlight">
                                        {trans.account.openapi.revoke}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleCopyField('all')}
                                    className="flex w-80 items-center justify-center gap-2 rounded-full bg-highlight py-2.5 text-quaternary transition-colors hover:bg-highlight"
                                >
                                    {copiedField === 'all' ? (
                                        <FaCheck size={16} />
                                    ) : (
                                        <FaCopy size={16} />
                                    )}
                                    <span className="font-body-3-highlight">
                                        {trans.account.openapi.copy}
                                    </span>
                                </button>
                            </footer>
                        </article>
                    ) : (
                        <article className="flex flex-col items-center justify-center gap-4">
                            <header className="flex flex-col items-center gap-4">
                                <FaKey className="text-secondary" size={64} />
                                <p className="text-center font-body-3 text-secondary">
                                    {trans.account.openapi.empty_desc}
                                </p>
                            </header>
                            <button
                                type="button"
                                onClick={handleGenerate}
                                className="flex w-80 items-center justify-center gap-2 rounded-full bg-highlight py-2.5 transition-colors hover:bg-highlight"
                            >
                                <FaKey size={16} className="text-quaternary" />
                                <span className="font-body-3-highlight text-quaternary">
                                    {trans.account.openapi.generate}
                                </span>
                            </button>
                        </article>
                    )}
                </section>
            </main>
        </section>
    );
};
