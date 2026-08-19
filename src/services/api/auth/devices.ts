import { vnscService } from '@/services/interceptor';
import type { GetUserDevicesResponse, RevokeUserDeviceResponse } from '@/types/devices';

export const getUserDevices = (): Promise<GetUserDevicesResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get('/auth/v2/users/devices')
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const revokeUserDevice = (deviceId: string): Promise<RevokeUserDeviceResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post(`/auth/v2/users/devices/${deviceId}/logout`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
