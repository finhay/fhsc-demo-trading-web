'use client';

import { FormEvent, useState } from 'react';

import { FaLockOpen } from 'react-icons/fa6';

import { FundVaultRecover } from '@/components/quan-ly-quy/vault/FundVaultRecover';
import { FundVaultShell } from '@/components/quan-ly-quy/vault/FundVaultShell';
import { FUND_FORM_INPUT_CLS } from '@/constants/fund';
import { useTranslate } from '@/hooks/useTranslate';
import { useFundVaultStore } from '@/stores/fund/useFundVaultStore';
import { yieldToPaint } from '@/utils/fund/fund';

export const FundVaultUnlock = () => {
    const trans = useTranslate();
    const t = trans.fund.vault;
    const { unlock, requiresSecretKey, error: storeError } = useFundVaultStore();
    const [passphrase, setPassphrase] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mode, setMode] = useState<'unlock' | 'recover'>('unlock');
    const errorMsg = storeError ? t.errors[storeError] : null;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await yieldToPaint();
        await unlock(passphrase, requiresSecretKey ? secretKey : undefined);
        setIsSubmitting(false);
    };

    if (mode === 'recover') return <FundVaultRecover onBack={() => setMode('unlock')} />;

    return (
        <FundVaultShell title={t.unlock.title} icon={<FaLockOpen size={16} aria-hidden="true" />}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <label className="flex flex-col gap-1">
                    <span className="font-caption text-secondary">{t.unlock.passphrase_label}</span>
                    <input
                        type="password"
                        autoComplete="current-password"
                        className={FUND_FORM_INPUT_CLS}
                        placeholder={t.unlock.passphrase_placeholder}
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                        autoFocus
                    />
                </label>
                {requiresSecretKey && (
                    <label className="flex flex-col gap-1">
                        <span className="font-caption text-secondary">
                            {t.unlock.secret_key_label}
                        </span>
                        <input
                            type="text"
                            className={FUND_FORM_INPUT_CLS}
                            placeholder={t.unlock.secret_key_placeholder}
                            value={secretKey}
                            onChange={(e) => setSecretKey(e.target.value)}
                        />
                        <span className="font-caption text-secondary">
                            {t.unlock.secret_key_hint}
                        </span>
                    </label>
                )}
                {errorMsg && <p className="font-caption text-red">{errorMsg}</p>}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 rounded-full bg-success px-4 py-2 font-body-3-highlight text-highlight transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting && (
                        <span
                            className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-highlight border-t-transparent"
                            aria-hidden="true"
                        />
                    )}
                    {t.unlock.submit}
                </button>
            </form>
            <button
                type="button"
                onClick={() => setMode('recover')}
                className="self-start font-caption-highlight text-blue"
            >
                {t.unlock.forgot}
            </button>
        </FundVaultShell>
    );
};
