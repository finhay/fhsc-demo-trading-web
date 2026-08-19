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
import { AUTH_MODE, SSO_ALLOWED_REDIRECT_URIS, SSO_PENDING_TTL_MS } from '@/constants/auth';
import { toast } from '@/hooks/lib/useToast';
import { useSsoTimeout } from '@/hooks/useSsoTimeout';
import { useTracking } from '@/hooks/useTracking';
import { useTranslate } from '@/hooks/useTranslate';
import { Providers } from '@/provider/provider';
import { useAuthFlowStore } from '@/stores/auth/useAuthFlowStore';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import '@/styles/globals.scss';
import { isValidSsoRedirectUri } from '@/utils/auth';

import '../../public/nprogress.css';

const AUTH_REQUIRED_PATHS = [
    '/tai-san',
    '/haybond',
    '/haypoint',
    '/quan-ly-api',
    '/quan-ly-quy',
    '/tai-khoan',
];

type Props = {
    Component: React.ComponentType<any>;
    pageProps: any;
};

export const App = ({ Component, pageProps }: Props) => {
    const router = useRouter();
    const trans = useTranslate();
    const { isAuthenticated, isInitialized } = useAuthStore();
    const openAuthDialog = useAuthFlowStore((state) => state.openAuthDialog);
    const setSsoContext = useAuthFlowStore((state) => state.setSsoContext);
    const { isLoading } = useLoadingStore();

    useTracking(process.env.NEXT_PUBLIC_GA_ID || '');
    useSsoTimeout();

    const startSsoAuthFlow = () => {
        if (!isAuthenticated) {
            openAuthDialog(AUTH_MODE.LOGIN);
            return;
        }

        openAuthDialog(
            useAuthStore.getState().profile ? AUTH_MODE.SSO_ACCOUNT_CHOOSER : AUTH_MODE.LOGIN,
        );
    };

    useEffect(() => {
        if (!isInitialized) return;
        const isAuthRequired = AUTH_REQUIRED_PATHS.some((path) => router.pathname.startsWith(path));
        if (isAuthRequired && !isAuthenticated) {
            router.replace(`/`);
        }
    }, [isInitialized, isAuthenticated, router.pathname]);

    useEffect(() => {
        if (!router.isReady || !isInitialized) return;
        const { action, client_id, redirect_uri, state, ...restQuery } = router.query;
        if (action !== AUTH_MODE.LOGIN) return;

        router.replace({ pathname: router.pathname, query: restQuery }, undefined, {
            shallow: true,
        });

        if (
            typeof client_id !== 'string' ||
            typeof redirect_uri !== 'string' ||
            typeof state !== 'string'
        ) {
            toast.error(trans.auth.sso.invalid_request);
            return;
        }

        if (!isValidSsoRedirectUri(redirect_uri)) {
            const isEmptyAllowlist = SSO_ALLOWED_REDIRECT_URIS.length === 0;
            console.error(
                isEmptyAllowlist
                    ? '[SSO] thiếu NEXT_PUBLIC_SSO_ALLOWED_REDIRECT_URIS — mọi redirect_uri đều bị từ chối'
                    : `[SSO] rejected redirect_uri: ${redirect_uri}`,
            );
            toast.error(trans.auth.sso.invalid_request);
            return;
        }

        const deadlineAt = Date.now() + SSO_PENDING_TTL_MS;
        setSsoContext({ clientId: client_id, redirectUri: redirect_uri, state }, deadlineAt);

        startSsoAuthFlow();
    }, [router.isReady, isInitialized, isAuthenticated, router.query]);

    useEffect(() => {
        if (!router.isReady || !isInitialized) return;
        if (router.query.action === AUTH_MODE.LOGIN) return;
        if (useAuthFlowStore.getState().ssoContext) return;

        useAuthFlowStore.persist.rehydrate();

        const { ssoContext, ssoDeadlineAt, ssoAuthCode, ssoRedirectTo } =
            useAuthFlowStore.getState();
        if (!ssoContext || typeof ssoDeadlineAt !== 'number') return;

        if (Date.now() >= ssoDeadlineAt) {
            useAuthFlowStore.getState().resetSsoState();
            return;
        }

        if (ssoAuthCode && ssoRedirectTo) {
            openAuthDialog(AUTH_MODE.SSO_CONSENT);
            return;
        }

        startSsoAuthFlow();
    }, [router.isReady, isInitialized, isAuthenticated]);

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
