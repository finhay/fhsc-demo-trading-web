import { vnscService } from '@/services/interceptor';
import type { BankAccountDepositResponse } from '@/types/accounts/bank';

export const getDepositBankAccount = (type: string): Promise<BankAccountDepositResponse> => {
    return new Promise<BankAccountDepositResponse>((resolve, reject) => {
        vnscService
            .get(`/accounts/v1/users/:user_id/deposit`, {
                params: {
                    type,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
