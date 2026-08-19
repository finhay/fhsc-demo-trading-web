'use client';

import Image from 'next/image';

import { AUTH_MODE } from '@/constants/auth';
import { useTranslate } from '@/hooks/useTranslate';
import { useAuthFlowStore } from '@/stores/auth/useAuthFlowStore';

type Props = {
    button?: boolean;
    title?: string;
    description?: string;
};

export const EmptyState = ({ button, title, description }: Props) => {
    const trans = useTranslate();
    const { openAuthDialog } = useAuthFlowStore();
    return (
        <figure className="flex flex-col items-center justify-center h-full gap-4">
            <Image
                src="https://cdn1.finhay.com.vn/vnsc-prod/1772378356561.4795-empty.png"
                alt=""
                role="presentation"
                width={100}
                height={100}
                priority
                style={{ width: '100px', height: '100px' }}
            />
            <figcaption className="font-body-2 text-secondary text-center">
                {description ||
                    (button ? trans.empty_state.no_information : trans.empty_state.no_data)}
            </figcaption>
            {button && (
                <button
                    className="text-quaternary bg-highlight rounded-full w-28 py-1.5 font-body-3-highlight cursor-pointer"
                    onClick={() => openAuthDialog(AUTH_MODE.LOGIN)}
                >
                    {title || trans.empty_state.login}
                </button>
            )}
        </figure>
    );
};
