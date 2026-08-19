import { vnscService } from '@/services/interceptor';
import type { ResetPasswordResponse } from '@/types/auth/password';

export const putResetPassword = (
    token: string,
    new_password: string,
    user_type: string,
): Promise<ResetPasswordResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .put(`/auth/v1/users/password`, {
                token,
                new_password,
                user_type,
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
