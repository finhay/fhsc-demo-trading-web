import { vnscService } from '@/services/interceptor';
import { getDeviceId } from '@/services/localStorage';
import type {
    GenerateApiKeyResponse,
    GetApiKeysResponse,
    RevealSecretResponse,
} from '@/types/openapi';

export const getApiKeys = (): Promise<GetApiKeysResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/auth/v1/openapi/api-keys/user/:user_id`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const generateApiKey = (params: {
    userId: number;
    custId: string;
    scopes: string[];
}): Promise<GenerateApiKeyResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post('/auth/v1/openapi/api-keys/generate', {
                userId: params.userId,
                custId: params.custId,
                scopes: params.scopes,
                deviceId: getDeviceId(),
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const revealApiSecret = (apiKey: string): Promise<RevealSecretResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/auth/v1/openapi/api-keys/${apiKey}/secret`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const revokeApiKey = (apiKey: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post(`/auth/v1/openapi/api-keys/${apiKey}/revoke`)
            .then(() => resolve())
            .catch((err) => reject(err.response?.data || err));
    });
};
