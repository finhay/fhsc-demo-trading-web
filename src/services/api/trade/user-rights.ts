import { vnscService } from '@/services/interceptor';
import type {
    UserRightRegisterPayload,
    UserRightRegisterResponse,
    UserRightsFilters,
    UserRightsResponse,
} from '@/types/trade/user-rights';

export const fetchAccountUserRights = (
    accountId: string,
    filters?: UserRightsFilters,
): Promise<UserRightsResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/trade/v5/account/${accountId}/user-rights`, {
                params: filters,
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const registerAccountUserRight = (
    accountId: string,
    data: UserRightRegisterPayload,
): Promise<UserRightRegisterResponse> => {
    const { caMastId, quantity } = data;
    return new Promise((resolve, reject) => {
        vnscService
            .post(`/trade/account/${accountId}/register-user-right`, {
                caMastId,
                quantity: Number(quantity),
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
