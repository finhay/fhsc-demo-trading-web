import type { Metadata, Viewport } from 'next';

import 'swiper/css';
import 'swiper/css/navigation';

import { AuthFlow } from '@/components/auth/AuthFlow';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { GlobalSpinner } from '@/components/common/ui/GlobalSpinner';
import { ToastContainer } from '@/components/common/ui/Toast';
import { inter } from '@/config/fonts';
import { DefaultLayout } from '@/layouts/DefaultLayout';
import { Providers } from '@/provider/provider';
import '@/styles/globals.scss';

export const metadata: Metadata = {
    title: {
        default: 'FHSC Demo Trading',
        template: '%s | FHSC Demo Trading',
    },
    description: 'Demo giao dịch chứng khoán',
    icons: {
        icon: {
            url: 'https://cdn1.finhay.com.vn/vnsc-prod/1776678011822.8657-favicon.png',
            type: 'image/png',
        },
        shortcut: {
            url: 'https://cdn1.finhay.com.vn/vnsc-prod/1776678011822.8657-favicon.png',
            type: 'image/png',
        },
        apple: {
            url: 'https://cdn1.finhay.com.vn/vnsc-prod/1776678011822.8657-favicon.png',
            type: 'image/png',
        },
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="vi">
            <body className={inter.className}>
                <Providers>
                    <AuthGuard />
                    <DefaultLayout>{children}</DefaultLayout>
                    <ToastContainer />
                    <AuthFlow />
                    <GlobalSpinner />
                </Providers>
            </body>
        </html>
    );
}
