import { ANALYTICS_EVENTS } from '@/constants/analytics';

declare global {
    interface Window {
        dataLayer: Record<string, unknown>[];
    }
}

type AnalyticsEventParams = Record<string, string | number | boolean | undefined>;

const pushDataLayerEvent = (event: string, params: AnalyticsEventParams = {}) => {
    if (typeof window === 'undefined') return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event,
        ...params,
    });
};

export const trackRegisterSuccess = () => {
    pushDataLayerEvent(ANALYTICS_EVENTS.REGISTER_SUCCESS, {
        method: 'web',
        event_category: 'auth',
    });
};
