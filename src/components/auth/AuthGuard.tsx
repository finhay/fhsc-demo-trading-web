'use client';

import { useEffect } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { useAuthStore } from '@/stores/auth/useAuthStore';

const AUTH_REQUIRED_PATHS = ['/tai-san'];

export const AuthGuard = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, isInitialized } = useAuthStore();

    useEffect(() => {
        if (!isInitialized) return;
        const isAuthRequired = AUTH_REQUIRED_PATHS.some((path) => pathname.startsWith(path));
        if (isAuthRequired && !isAuthenticated) {
            router.replace('/');
        }
    }, [isInitialized, isAuthenticated, pathname, router]);

    return null;
};
