'use client';

import { useForm, useStore } from '@tanstack/react-form';

import { FC, useEffect } from 'react';

import { InputField } from '@/components/common/feature/InputField';
import { Dialog } from '@/components/common/ui/Dialog';
import { toast } from '@/hooks/lib/useToast';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { getOrderedWatchlistSymbols, useWatchlistStore } from '@/stores/common/useWatchlistStore';
import type { WatchlistItem } from '@/types/accounts/watchlist';

type Props = {
    open: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    watchlist?: WatchlistItem | null;
};

export const FormWatchlistModal: FC<Props> = ({ open, onClose, mode, watchlist }) => {
    const { startLoading, stopLoading } = useLoadingStore();
    const { updateWatchlist, createWatchlist } = useWatchlistStore();

    const isEdit = mode === 'edit';
    const title = isEdit ? 'Sửa danh mục' : 'Tạo danh mục';
    const submitLabel = isEdit ? 'Lưu danh mục' : 'Tạo danh mục';

    const handleCreateWatchlist = async (name: string) => {
        const { success, message } = await createWatchlist(name);
        if (success) {
            toast.success('Tạo danh mục thành công');
        } else {
            toast.error(message || 'Lỗi tạo danh mục');
        }
    };

    const form = useForm({
        defaultValues: {
            name: '',
        },
        onSubmit: async ({ value }) => {
            const name = value.name.trim();

            startLoading();
            try {
                if (isEdit) {
                    if (!watchlist) return;
                    await updateWatchlist({
                        id: watchlist.id,
                        name,
                        symbols: getOrderedWatchlistSymbols(watchlist),
                    });
                } else await handleCreateWatchlist(name);
            } finally {
                stopLoading();
            }

            form.reset();
            onClose();
        },
    });

    const name = useStore(form.store, (state) => state.values.name);
    const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
    const isSubmittable =
        useStore(form.store, (state) => state.canSubmit) && !isSubmitting && !!name.trim();

    useEffect(() => {
        if (open && isEdit && watchlist?.name) {
            form.setFieldValue('name', watchlist.name);
        }

        if (!open) {
            form.reset();
        }
    }, [open]);

    if (!open) return null;

    return (
        <Dialog title={title} onClose={onClose} maxWidth="max-w-sm">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
                className="flex flex-col gap-4"
            >
                <form.Field name="name">
                    {(field) => (
                        <InputField
                            id="watchlist-name"
                            type="text"
                            label={'Tên danh mục'}
                            placeholder={'Đặt tên danh mục'}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            maxLength={20}
                        />
                    )}
                </form.Field>

                <button
                    type="submit"
                    disabled={!isSubmittable}
                    className={`w-full rounded-xl px-4 py-2 font-body-3-highlight transition-all ${
                        !isSubmittable
                            ? 'cursor-not-allowed bg-disabled text-disabled'
                            : 'bg-highlight text-quaternary hover:bg-highlight/80'
                    }`}
                >
                    {submitLabel}
                </button>
            </form>
        </Dialog>
    );
};
