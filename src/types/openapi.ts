export type ApiKeyItem = {
    id: number;
    apiKey: string;
    apiSecret?: string;
    userId: number;
    custId: string;
    scopes: string[];
    tier: string;
    status: 'ACTIVE' | 'INACTIVE' | 'REVOKED';
    expiresAt: string | null;
    createdAt: string;
};

export type GetApiKeysResponse = {
    data: ApiKeyItem[];
};

export type GenerateApiKeyResponse = {
    message: string;
    data: ApiKeyItem;
};

export type RevealSecretResponse = {
    data: {
        apiSecret: string;
    };
};
