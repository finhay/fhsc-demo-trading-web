'use client';

import { ChangeEvent, FormEvent, useRef, useState } from 'react';

import { FaShieldHalved } from 'react-icons/fa6';
import { RiUploadLine } from 'react-icons/ri';

import { FundVaultShell } from '@/components/quan-ly-quy/vault/FundVaultShell';
import { FUND_FORM_INPUT_CLS, PASSPHRASE_MIN_LENGTH } from '@/constants/fund';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { useFundVaultStore } from '@/stores/fund/useFundVaultStore';
import { yieldToPaint } from '@/utils/fund/fund';
import { importVaultBackup } from '@/utils/fund/fund-backup';

export const FundVaultSetup = () => {
    const trans = useTranslate();
    const t = trans.fund.vault;
    const { init, refresh, error: storeError } = useFundVaultStore();
    const [passphrase, setPassphrase] = useState('');
    const [confirm, setConfirm] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
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
        await init(passphrase);
        setIsSubmitting(false);
    };

    const handleImport = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (fileRef.current) fileRef.current.value = '';
        if (!file) return;
        try {
            await importVaultBackup(file);
            await refresh();
            toast.success(t.backup.import_done);
        } catch {
            toast.error(t.backup.import_error);
        }
    };

    return (
        <FundVaultShell
            title={t.setup.title}
            icon={<FaShieldHalved size={16} aria-hidden="true" />}
        >
            <p className="font-body-3 text-secondary">{t.setup.desc}</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <label className="flex flex-col gap-1">
                    <span className="font-caption text-secondary">{t.setup.passphrase_label}</span>
                    <input
                        type="password"
                        autoComplete="new-password"
                        className={FUND_FORM_INPUT_CLS}
                        placeholder={t.setup.passphrase_placeholder}
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                    />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="font-caption text-secondary">{t.setup.confirm_label}</span>
                    <input
                        type="password"
                        autoComplete="new-password"
                        className={FUND_FORM_INPUT_CLS}
                        placeholder={t.setup.confirm_placeholder}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                    />
                </label>
                <p className="font-caption text-secondary">
                    {t.setup.min_hint.replace('{n}', String(PASSPHRASE_MIN_LENGTH))}
                </p>
                {errorMsg && <p className="font-caption text-red">{errorMsg}</p>}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-1 flex items-center justify-center gap-2 rounded-full bg-success px-4 py-2 font-body-3-highlight text-highlight transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting && (
                        <span
                            className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-highlight border-t-transparent"
                            aria-hidden="true"
                        />
                    )}
                    {t.setup.submit}
                </button>
            </form>

            <div className="flex flex-col gap-2 border-t border-quaternary pt-3">
                <p className="font-caption text-secondary">{t.backup.import_hint}</p>
                <input
                    ref={fileRef}
                    type="file"
                    accept=".enc,application/octet-stream"
                    className="hidden"
                    onChange={handleImport}
                />
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center justify-center gap-2 rounded-full border border-quaternary bg-tertiary px-4 py-2 font-caption-highlight text-primary"
                >
                    <RiUploadLine size={12} aria-hidden="true" /> {t.backup.import}
                </button>
            </div>
        </FundVaultShell>
    );
};
