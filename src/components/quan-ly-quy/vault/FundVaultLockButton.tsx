'use client';

import { FaLock } from 'react-icons/fa6';

import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { useFundVaultStore } from '@/stores/fund/useFundVaultStore';

export const FundVaultLockButton = () => {
    const trans = useTranslate();
    const t = trans.fund.vault.lock;
    const { lock, status } = useFundVaultStore();

    const handleLock = () => {
        lock();
        toast.success(t.locked_toast);
    };

    if (status !== 'unlocked') return null;

    return (
        <button
            type="button"
            onClick={handleLock}
            className="flex items-center gap-2 rounded-full bg-tertiary px-4 py-2 font-caption-highlight text-primary"
        >
            <FaLock size={12} aria-hidden="true" />
            <span>{t.button}</span>
        </button>
    );
};
