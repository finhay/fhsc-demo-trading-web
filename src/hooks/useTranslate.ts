import { useRouter } from 'next/router';

import { en } from '@/language/en';
import { vi } from '@/language/vi';

export const useTranslate = () => {
    const { locale } = useRouter();
    const trans = locale === 'en' ? en : vi;

    return trans;
};

export const getTranslate = () => {
    if (typeof window === 'undefined') return vi;
    const locale = window.location.pathname.split('/')[1];
    return locale === 'en' ? en : vi;
};
