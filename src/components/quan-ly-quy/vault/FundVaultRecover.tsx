'use client';

import { FormEvent, useState } from 'react';

import { FaArrowRotateLeft } from 'react-icons/fa6';

import { FundVaultShell } from '@/components/quan-ly-quy/vault/FundVaultShell';
import { FUND_FORM_INPUT_CLS, PASSPHRASE_MIN_LENGTH } from '@/constants/fund';
import { useTranslate } from '@/hooks/useTranslate';
import { useFundVaultStore } from '@/stores/fund/useFundVaultStore';
import { yieldToPaint } from '@/utils/fund/fund';

type Props = { onBack: () => void };

export const FundVaultRecover = ({ onBack }: Props) => {
    const trans = useTranslate();
    const t = trans.fund.vault;
    const { recover, error: storeError } = useFundVaultStore();
    const [secretKey, setSecretKey] = useState('');
    const [passphrase, setPassphrase] = useState('');
    const [confirm, setConfirm] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const errorMsg = localError ?? (storeError ? t.errors[storeError] : null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        if (passphrase.length < PASSPHRASE_MIN_LENGTH) {
            setLocalError(t.errors.weak_passphrase);
            return;
        }
        if (passphrase !== confirm) {
            setLocalError(t.errors.mismatch);
            return;
        }
        setIsSubmitting(true);
        await yieldToPaint();
        await recover(secretKey, passphrase);
        setIsSubmitting(false);
    };

    return (
        <FundVaultShell
            title={t.recover.title}
            icon={<FaArrowRotateLeft size={16} aria-hidden="true" />}
        >
            <p className="font-body-3 text-secondary">{t.recover.desc}</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <label className="flex flex-col gap-1">
                    <span className="font-caption text-secondary">
                        {t.recover.secret_key_label}
                    </span>
                    <input
                        type="text"
                        className={FUND_FORM_INPUT_CLS}
                        placeholder={t.recover.secret_key_placeholder}
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                    />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="font-caption text-secondary">
                        {t.recover.new_passphrase_label}
                    </span>
                    <input
                        type="password"
                        autoComplete="new-password"
                        className={FUND_FORM_INPUT_CLS}
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                    />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="font-caption text-secondary">{t.recover.confirm_label}</span>
                    <input
                        type="password"
                        autoComplete="new-password"
                        className={FUND_FORM_INPUT_CLS}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                    />
                </label>
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
                    {t.recover.submit}
                </button>
            </form>
            <button
                type="button"
                onClick={onBack}
                className="self-start font-caption-highlight text-blue"
            >
                {t.recover.back}
            </button>
        </FundVaultShell>
    );
};
