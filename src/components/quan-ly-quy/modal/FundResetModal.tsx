import { Dialog } from '@/components/common/ui/Dialog';
import { useTranslate } from '@/hooks/useTranslate';

type Props = {
    onClose: () => void;
    onConfirmReset: () => void;
};
export const FundResetModal = ({ onClose, onConfirmReset }: Props) => {
    const trans = useTranslate();
    return (
        <Dialog title={trans.fund.modal.reset_title} onClose={onClose} maxWidth="max-w-md">
            <div className="flex flex-col gap-2">
                <p className="whitespace-pre-line font-body-3 text-secondary">
                    {trans.fund.modal.reset_body}
                </p>
                <footer className="flex gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex flex-1 items-center justify-center rounded-full border border-tertiary bg-tertiary px-4 py-2 font-body-3-highlight text-primary transition-colors hover:bg-quaternary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {trans.fund.modal.reset_cancel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirmReset}
                        aria-label={trans.fund.modal.reset_confirm}
                        className="flex flex-1 items-center justify-center rounded-full bg-red/20 px-4 py-2 font-body-3-highlight text-red transition-colors hover:bg-red/30 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {trans.fund.modal.reset_confirm}
                    </button>
                </footer>
            </div>
        </Dialog>
    );
};
