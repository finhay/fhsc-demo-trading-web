'use client';

import { useState } from 'react';

import { FaKey, FaRegCopy } from 'react-icons/fa6';
import { RiDownloadLine } from 'react-icons/ri';

import { FundVaultShell } from '@/components/quan-ly-quy/vault/FundVaultShell';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { useFundVaultStore } from '@/stores/fund/useFundVaultStore';
import { downloadBlob } from '@/utils/fund/fund';

type Props = { secretKey: string };

export const FundRecoveryKit = ({ secretKey }: Props) => {
    const trans = useTranslate();
    const t = trans.fund.vault.recovery_kit;
    const { acknowledgeRecoveryKit: acknowledge } = useFundVaultStore();
    const [acked, setAcked] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(secretKey);
        toast.success(t.copied);
    };

    const handleDownload = () => {
        const blob = new Blob([`Finhay Fund Vault — Recovery Kit\nSecret Key: ${secretKey}\n`], {
            type: 'text/plain;charset=utf-8',
        });
        downloadBlob('fund-vault-recovery-kit.txt', blob);
    };

    return (
        <FundVaultShell title={t.title} icon={<FaKey size={16} aria-hidden="true" />}>
            <p className="rounded-xl border border-red/40 bg-red/10 px-3 py-2 font-caption text-red">
                {t.warning}
            </p>
            <div className="flex flex-col gap-1">
                <span className="font-caption text-secondary">{t.secret_key_label}</span>
                <code className="select-all break-all rounded-xl border border-quaternary bg-primary px-3 py-2 font-body-3-highlight text-primary">
                    {secretKey}
                </code>
            </div>
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={handleCopy}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full border border-quaternary bg-tertiary px-4 py-2 font-caption-highlight text-primary"
                >
                    <FaRegCopy size={12} aria-hidden="true" /> {t.copy}
                </button>
                <button
                    type="button"
                    onClick={handleDownload}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full border border-quaternary bg-tertiary px-4 py-2 font-caption-highlight text-primary"
                >
                    <RiDownloadLine size={12} aria-hidden="true" /> {t.download}
                </button>
            </div>
            <label className="flex items-start gap-2 font-caption text-secondary">
                <input
                    type="checkbox"
                    checked={acked}
                    onChange={(e) => setAcked(e.target.checked)}
                    className="mt-0.5"
                />
                <span>{t.ack}</span>
            </label>
            <button
                type="button"
                disabled={!acked}
                onClick={acknowledge}
                className="rounded-full bg-success px-4 py-2 font-body-3-highlight text-highlight transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
                {t.continue}
            </button>
        </FundVaultShell>
    );
};
