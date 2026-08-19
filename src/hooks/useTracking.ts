import { useEffect } from 'react';

import { useRouter } from 'next/router';

declare global {
    interface Window {
        gtag: (...args: unknown[]) => void;
    }
}

export const useTracking = (gaTrackingId: string) => {
    const router = useRouter();

    useEffect(() => {
        const handleRouteChange = (url: string) => {
            if (typeof window.gtag === 'function' && gaTrackingId) {
                window.gtag('config', gaTrackingId, { page_path: url });
            }
        };

        router.events.on('routeChangeComplete', handleRouteChange);
        router.events.on('hashChangeComplete', handleRouteChange);

        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
            router.events.off('hashChangeComplete', handleRouteChange);
        };
    }, [router.events, gaTrackingId]);
};
