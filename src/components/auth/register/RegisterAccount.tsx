'use client';

import { useForm, useStore } from '@tanstack/react-form';

import { useState } from 'react';

import { FaFileLines } from 'react-icons/fa6';

import { InputField } from '@/components/common/feature/InputField';
import { PDFViewer } from '@/components/common/feature/PDFViewer';
import { Dialog } from '@/components/common/ui/Dialog';
import { AUTH_MODE, AUTH_VALIDATE, STEPS_REGISTER } from '@/constants/auth';
import { toast } from '@/hooks/lib/useToast';
import {
    fetchPublicTermsAndConditionTemplates,
    fetchTermsAndConditionPreviewById,
} from '@/services/api/accounts/contracts';
import { checkPhoneRegisteredStatus } from '@/services/api/accounts/register';
import { useAuthFlowStore } from '@/stores/auth/useAuthFlowStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { validatePhone } from '@/utils/auth';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';

type TermTemplate = {
    id: number;
    title: string;
};

export const RegisterAccount = () => {
    const { startLoading, stopLoading, isLoading } = useLoadingStore();
    const { registerSetStep, registerSetPhone, openAuthDialog } = useAuthFlowStore();

    const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);
    const [termsList, setTermsList] = useState<TermTemplate[]>([]);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isPdfOpen, setIsPdfOpen] = useState<boolean>(false);
    const [pdfTitle, setPdfTitle] = useState<string>('');

    const form = useForm({
        defaultValues: {
            phone: '',
        },
        onSubmit: async ({ value }) => {
            await handleCheckPhone(value.phone || '');
        },
    });

    const phone = useStore(form.store, (state) => state.values.phone);
    const canSubmit = useStore(
        form.store,
        (state) => state.canSubmit && !state.isSubmitting && !!phone,
    );

    const handleOpenTerms = async () => {
        setIsTermsOpen(true);
        if (termsList.length > 0) return;

        startLoading();
        try {
            const { error_code, message, data } = await fetchPublicTermsAndConditionTemplates();
            if (isSuccessApi(error_code)) {
                setTermsList(data.map(({ id, title }) => ({ id, title })));
            } else {
                toast.error(message);
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Có lỗi xảy ra, vui lòng thử lại'));
        } finally {
            stopLoading();
        }
    };

    const handleViewTerm = async (id: number, title: string) => {
        startLoading();
        setPdfTitle(title);
        try {
            const { error_code, message, data } = await fetchTermsAndConditionPreviewById(id);
            if (isSuccessApi(error_code)) {
                const binaryString = atob(data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: 'application/pdf' });
                setPdfUrl(URL.createObjectURL(blob));
                setIsPdfOpen(true);
            } else {
                toast.error(message);
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Có lỗi xảy ra, vui lòng thử lại'));
        } finally {
            stopLoading();
        }
    };

    const handleClosePdf = () => {
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
        setIsPdfOpen(false);
        setPdfTitle('');
    };

    const handleCheckPhone = async (phoneParam: string) => {
        try {
            const { error_code, message, result } = await checkPhoneRegisteredStatus(phoneParam);

            if (isSuccessApi(error_code)) {
                if (!result.registered) {
                    registerSetPhone(phoneParam);
                    registerSetStep(STEPS_REGISTER.VERIFY_OTP);
                } else {
                    toast.error('Số điện thoại đã được sử dụng');
                }
            } else {
                toast.error(message);
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Có lỗi xảy ra, vui lòng thử lại'));
        }
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }}
            className="flex w-1/2 flex-col gap-4 rounded-xl"
        >
            <form.Field
                name="phone"
                validators={{
                    onChange: ({ value }) => validatePhone(value, AUTH_VALIDATE),
                }}
            >
                {(field) => (
                    <InputField
                        id="auth-dialog-register-phone"
                        type="tel"
                        label={'Số điện thoại'}
                        placeholder={'Nhập số điện thoại của bạn'}
                        error={field.state.meta.errors?.[0]}
                        value={field.state.value || ''}
                        onInput={(e) => {
                            const input = e.target as HTMLInputElement;
                            input.value = input.value.replace(/[^0-9]/g, '');
                        }}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                    />
                )}
            </form.Field>
            <p className="font-body-3 text-secondary">
                {'Bằng việc “Tiếp tục”, bạn đồng ý với'}{' '}
                <button
                    type="button"
                    onClick={handleOpenTerms}
                    className="cursor-pointer text-primary hover:underline bg-transparent border-0 p-0 font-body-3"
                >
                    {'Điều khoản và điều kiện sử dụng sản phẩm FHSC'}
                </button>
            </p>
            <footer className="flex flex-col items-center gap-2">
                <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`w-2/3 font-body-3-highlight rounded-full px-4 py-2 transition-all ${
                        canSubmit
                            ? 'bg-highlight text-quaternary hover:opacity-90'
                            : 'bg-disabled text-disabled cursor-not-allowed'
                    }`}
                >
                    {'Tiếp tục'}
                </button>
                <p className="font-body-3 text-primary">{'Hoặc'}</p>
                <button
                    type="button"
                    onClick={() => openAuthDialog(AUTH_MODE.LOGIN)}
                    className="w-2/3 px-4 py-2 rounded-full font-body-3-highlight text-highlight bg-success cursor-pointer"
                >
                    {'Bạn đã có tài khoản?'}
                </button>
            </footer>
            {isTermsOpen && (
                <Dialog
                    title={'Điều khoản và điều kiện sử dụng sản phẩm FHSC'}
                    onClose={() => setIsTermsOpen(false)}
                >
                    <div className="flex flex-col gap-2">
                        {termsList.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleViewTerm(item.id, item.title)}
                                className="bg-tertiary flex items-center gap-2 p-3 rounded-xl cursor-pointer text-left disabled:opacity-50"
                            >
                                <FaFileLines size={20} className="text-green shrink-0" />
                                <span className="font-body-3-highlight text-green">
                                    {item.title}
                                </span>
                            </button>
                        ))}
                    </div>
                </Dialog>
            )}
            <PDFViewer
                isOpen={isPdfOpen}
                pdfUrl={pdfUrl}
                title={pdfTitle}
                onClose={handleClosePdf}
            />
        </form>
    );
};
