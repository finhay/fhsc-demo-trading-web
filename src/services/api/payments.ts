import { vnscService } from '@/services/interceptor';
import {
    CiBalanceResponse,
    SubAccountResponse,
    SubAccountTransactionResponse,
    TransferFeeResponse,
    TransferMoneyResponse,
    WithdrawMoneyResponse,
    WithdrawPayload,
    WithdrawalAvailableBalanceResponse,
} from '@/types/payments';
import { generateDeviceId } from '@/utils/common';

export const withdrawToDefaultBank = (
    sub_account_id: string,
    amount: string,
    otp: string,
    phone?: string,
    email?: string,
): Promise<WithdrawMoneyResponse> => {
    return new Promise((resolve, reject) => {
        const payload: WithdrawPayload = {
            sub_account_id,
            amount,
            otp,
            ...(phone ? { phone } : {}),
            ...(!phone && email ? { email } : {}),
        };

        vnscService
            .post(
                `/payments/v3/users/sub-accounts/${sub_account_id}/withdraw/default-bank`,
                payload,
            )
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchPaymentSubAccounts = (): Promise<SubAccountResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/payments/v2/users/:user_id/sub-account`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const calculateTransferFee = (
    sub_account_id: string,
    amount: number,
    to_sub_account: string,
): Promise<TransferFeeResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/payments/v1/users/:user_id/sub-account/${sub_account_id}/transfer`, {
                params: {
                    amount,
                    to_sub_account,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const transferMoney = async (
    sub_account_id: string,
    amount: number,
    to_sub_account: string,
): Promise<TransferMoneyResponse> => {
    const device_id = await generateDeviceId();
    return new Promise((resolve, reject) => {
        vnscService
            .post(`/payments/v1/users/:user_id/sub-account/${sub_account_id}/transfer`, {
                amount,
                to_sub_account,
                device_type: 'WEB',
                device_id,
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const getSubAccountTransaction = (
    subAccountId: string,
    page: number,
    transaction_status = 'COMPLETED',
): Promise<SubAccountTransactionResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/payments/v3/users/:user_id/sub-accounts/${subAccountId}/transactions`, {
                params: {
                    size: 20,
                    page,
                    transaction_status,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const getSubAccountCiBalance = (subAccountId: string): Promise<CiBalanceResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/payments/v1/users/:user_id/sub-account/${subAccountId}/ci-balance`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const getSubAccountWithdrawalAvailableBalance = (
    subAccountId: string,
): Promise<WithdrawalAvailableBalanceResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/payments/v2/users/${subAccountId}/withdrawal/available-balance`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const getUserWithdrawalAvailableBalance =
    (): Promise<WithdrawalAvailableBalanceResponse> => {
        return new Promise((resolve, reject) => {
            vnscService
                .get(`/payments/v1/users/:user_id/withdrawal-available-balance`)
                .then((res) => resolve(res.data))
                .catch((err) => reject(err.response?.data || err));
        });
    };
