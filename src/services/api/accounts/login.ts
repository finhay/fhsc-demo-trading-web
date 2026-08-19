import { vnscService } from '@/services/interceptor';
import { getDeviceId } from '@/services/localStorage';
import type { LoginIndividualResponse, LoginPayload, LogoutResponse } from '@/types/accounts/login';

export const loginIndividual = (payload: LoginPayload): Promise<LoginIndividualResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .put('/accounts/v1/login', payload)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const logoutAccount = (): Promise<LogoutResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post(`/accounts/v1/logout`, {
                all_device: false,
                device_id: getDeviceId(),
                fcm_token: '',
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
