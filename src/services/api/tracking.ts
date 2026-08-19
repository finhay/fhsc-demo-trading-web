import { vnscTracking } from '@/services/interceptor';
import { TrackingAction, TrackingCompany } from '@/types/tracking';

export const sendInsightEventV2 = (
    env: string,
    action: TrackingAction,
    screen: string,
    company: TrackingCompany,
    product: string,
    platform: string,
    user_id?: number | null,
    referrer?: string | null,
    btn?: string | null,
) => {
    const currentDate = new Date();
    const timestamp = currentDate.getTime();

    return new Promise((resolve, reject) => {
        vnscTracking
            .get(`/v2/users/insight`, {
                params: {
                    env,
                    ts: timestamp,
                    action,
                    screen,
                    company,
                    product,
                    platform,
                    device_id: user_id || null,
                    referrer: referrer || null,
                    btn: btn || null,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
