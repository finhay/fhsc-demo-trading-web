import { useEffect } from 'react';

import Head from 'next/head';
import { useRouter } from 'next/router';

import nProgress from 'nprogress';
import 'swiper/css';
import 'swiper/css/navigation';

import { AuthFlow } from '@/components/auth/AuthFlow';
import { AnalyticsScripts } from '@/components/common/feature/AnalyticsScripts';
import { Spinner } from '@/components/common/ui/Spinner';
import { ToastContainer } from '@/components/common/ui/Toast';
import { useTracking } from '@/hooks/useTracking';
import { Providers } from '@/provider/provider';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import '@/styles/globals.scss';

import '../../public/nprogress.css';

const AUTH_REQUIRED_PATHS = ['/tai-san'];

type Props = {
    Component: React.ComponentType<any>;
    pageProps: any;
};

export const App = ({ Component, pageProps }: Props) => {
    const router = useRouter();
    const { isAuthenticated, isInitialized } = useAuthStore();
    const { isLoading } = useLoadingStore();

    useTracking(process.env.NEXT_PUBLIC_GA_ID || '');

    useEffect(() => {
        if (!isInitialized) return;
        const isAuthRequired = AUTH_REQUIRED_PATHS.some((path) => router.pathname.startsWith(path));
        if (isAuthRequired && !isAuthenticated) {
            router.replace(`/`);
        }
    }, [isInitialized, isAuthenticated, router.pathname]);

    useEffect(() => {
        const handleStart = () => {
            nProgress.start();
        };
        const handleStop = () => {
            nProgress.done();
        };

        router.events.on('routeChangeStart', handleStart);
        router.events.on('routeChangeComplete', handleStop);
        router.events.on('routeChangeError', handleStop);

        return () => {
            router.events.off('routeChangeStart', handleStart);
            router.events.off('routeChangeComplete', handleStop);
            router.events.off('routeChangeError', handleStop);
        };
    }, [router.events]);

    return (
        <>
            <Head>
                <meta name="robots" content="max-image-preview:large"></meta>
                <title>Finhay</title>
                <meta name="description" content="Finhay" />
                <link
                    rel="icon"
                    href="https://cdn1.finhay.com.vn/vnsc-prod/1776678011822.8657-favicon.png"
                />
            </Head>
            <AnalyticsScripts />
            <Providers>
                <Component {...pageProps} />
                <ToastContainer />
                <AuthFlow />
                <Spinner isLoading={isLoading} />
            </Providers>
        </>
    );
};

export default App;
