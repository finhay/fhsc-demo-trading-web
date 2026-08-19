'use client';

import Image from 'next/image';

import { useTranslate } from '@/hooks/useTranslate';

export const AuthUI = () => {
    const trans = useTranslate();

    return (
        <aside className="hidden sm:flex w-1/2 flex-col items-center justify-center gap-4 text-center text-primary bg-[#54545433] p-4 rounded-xl">
            <p className="font-body-2-highlight">{trans.auth.login.auth_sidebar_headline}</p>
            <Image
                src="https://cdn1.finhay.com.vn/vnsc-prod/1777863552264.2024-Gemini_Generated_Image.png"
                alt={trans.auth.login.auth_sidebar_image_alt}
                width={240}
                height={120}
                className="w-60 h-auto object-cover"
            />
            <p className="font-body-3 text-center whitespace-pre-line">
                {trans.auth.login.auth_sidebar_body}
            </p>
        </aside>
    );
};
