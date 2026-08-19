import { vnscService } from '@/services/interceptor';
import { setUserType } from '@/services/localStorage';
import type {
    IdentityCardImagesResponse,
    LatestMonthlyReportResponse,
    PreferencesResponse,
    UserProfileResponse,
} from '@/types/accounts/profile';

export const getUserProfile = (): Promise<UserProfileResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get('/accounts/v2/users/:user_id/profile')
            .then((res) => {
                setUserType(res.data.data.user_type);
                resolve(res.data);
            })
            .catch((err) => reject(err.response?.data || err));
    });
};

export const getUserPreferences = (): Promise<PreferencesResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/accounts/v1/users/:user_id/preferences`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const getLatestMonthlyReport = (): Promise<LatestMonthlyReportResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/accounts/v1/users/:user_id/latest-monthly-report`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchUserIdentityCardImages = (): Promise<IdentityCardImagesResponse> => {
    return new Promise<IdentityCardImagesResponse>((resolve, reject) => {
        vnscService
            .get('/accounts/v2/users/identity-card/images')
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
