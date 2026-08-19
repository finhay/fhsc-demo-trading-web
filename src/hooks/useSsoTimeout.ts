import { useEffect } from 'react';

import { SSO_ERROR_CODE } from '@/constants/auth';
import { useAuthFlowStore } from '@/stores/auth/useAuthFlowStore';

export const useSsoTimeout = () => {
    const ssoDeadlineAt = useAuthFlowStore((state) => state.ssoDeadlineAt);
    const cancelSso = useAuthFlowStore((state) => state.cancelSso);

    useEffect(() => {
        if (!ssoDeadlineAt) return;

        const expire = () => cancelSso(SSO_ERROR_CODE.SESSION_EXPIRED);

        const remaining = ssoDeadlineAt - Date.now();
        if (remaining <= 0) {
            expire();
            return;
        }

        const timeoutId = setTimeout(expire, remaining);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && Date.now() >= ssoDeadlineAt) {
                expire();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [ssoDeadlineAt, cancelSso]);
};
