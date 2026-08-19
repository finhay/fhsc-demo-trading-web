import { vnscService } from '@/services/interceptor';
import type { MqttPrefixResponse, NotificationsResponse } from '@/types/notifications';

export const getUserNotifications = (pageNumber: number): Promise<NotificationsResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/notifications/v1/users/:user_id/notifications`, {
                params: {
                    status: 'UNREAD,READ',
                    pageNumber,
                    pageSize: 50,
                    tab: 'NEWS_V2',
                },
            })
            .then((res) => {
                resolve(res.data);
            })
            .catch((err) => {
                reject(err.response?.data || err);
            });
    });
};

export const getNotificationsMqttPrefix = (): Promise<MqttPrefixResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/notifications/v1/users/:user_id/notifications/mqtt-prefix`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((err) => {
                reject(err.response?.data || err);
            });
    });
};
