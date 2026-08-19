'use client';

import { FaTrash, FaTriangleExclamation } from 'react-icons/fa6';

import { Dialog } from '@/components/common/ui/Dialog';
import { useTranslate } from '@/hooks/useTranslate';

type Props = {
    onRevoke: () => void;
    onClose: () => void;
};

export const AccountRevokeKeyModal = ({ onRevoke, onClose }: Props) => {
    const trans = useTranslate();

    return (
        <Dialog onClose={onClose} maxWidth="max-w-sm">
            <div className="flex flex-col items-center justify-center h-full gap-10">
                <header className="flex flex-col items-center gap-6">
                    <FaTriangleExclamation className="text-red" size={40} />
                    <div className="flex flex-col items-center gap-3 text-center">
                        <h2 className="font-heading-4 text-primary">
                            {trans.account.openapi.confirm_revoke_title}
                        </h2>
                        <p className="font-body-3 text-secondary">
                            {trans.account.openapi.confirm_revoke_desc}
                        </p>
                    </div>
                </header>
                <footer className="flex flex-col gap-3 w-full">
                    <button
                        type="button"
                        onClick={onRevoke}
                        className="w-full flex items-center justify-center gap-2 bg-red hover:bg-red/90 text-quaternary rounded-full py-2.5 transition-colors"
                    >
                        <FaTrash size={16} className="text-primary" />
                        <span className="font-body-3-highlight text-primary">
                            {trans.account.openapi.revoke}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full flex items-center justify-center bg-secondary hover:bg-secondary/80 text-highlight rounded-full py-2.5 transition-colors"
                    >
                        <span className="font-body-3-highlight">{trans.account.openapi.close}</span>
                    </button>
                </footer>
            </div>
        </Dialog>
    );
};
