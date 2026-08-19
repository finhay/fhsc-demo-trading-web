import { vnscService } from '@/services/interceptor';
import type {
    AgreementsResponse,
    HaybondBondOwnershipResponse,
    HaybondClosingPreviewResponse,
    HaybondClosingResponse,
    HaybondDynamicOwnershipHistoriesResponse,
    HaybondFlexibleSummaryResponse,
    HaybondInvestmentDetailResponse,
    HaybondOwnershipHistoriesResponse,
    HaybondSavingBookDetailResponse,
    HaybondUpdateClosingResponse,
    HaybondUpdateSellOrderResponse,
    PreviewChangeResponse,
    UpdateSellOrderBody,
} from '@/types/bond-enterprise/saving-books';

export const getAgreements = (id: string): Promise<AgreementsResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/bond-enterprise/v1/saving-books/BOND_SAVING-${id}/agreements`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const getPreviewChange = (): Promise<PreviewChangeResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get('/bond-enterprise/v1/saving-books/sell-agreements/preview-change')
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const getPreviewChangeById = (id: string): Promise<PreviewChangeResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/bond-enterprise/v1/saving-books/${id}/sell-agreements/preview-change`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const updateSellOrder = (
    id: string,
    body: UpdateSellOrderBody,
    token: string,
): Promise<HaybondUpdateSellOrderResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .put(`/bond-enterprise/v1/saving-books/${id}/sell-agreements/change`, body, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    skipAutoAuth: true,
                },
                skipRefreshRetry: true,
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchHayBondDynamicFlexibleSummary = (): Promise<HaybondFlexibleSummaryResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get('/bond-enterprise/v1/flexible-saving-books/summary')
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchHayBondOwnershipHistories = (params: {
    page: number;
    status: string;
}): Promise<HaybondOwnershipHistoriesResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get('/bond-enterprise/v1/saving-books/ownership-histories', {
                params: {
                    page: params.page,
                    status: params.status,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchHayBondDynamicOwnershipHistories = (params: {
    page: number;
    status: string;
}): Promise<HaybondDynamicOwnershipHistoriesResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get('/bond-enterprise/v1/flexible-saving-books/ownership-histories', {
                params: {
                    page: params.page,
                    status: params.status,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchHayBondSavingBooksDetail = (
    id: string,
): Promise<HaybondSavingBookDetailResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/bond-enterprise/v1/saving-books/${id}`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchHayBondDynamicSavingBondOwnership = (): Promise<HaybondBondOwnershipResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get('/bond-enterprise/v1/flexible-saving-books/bond-ownership')
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchHayBondDynamicSavingBooksDetail =
    (): Promise<HaybondInvestmentDetailResponse> => {
        return new Promise((resolve, reject) => {
            vnscService
                .get('/bond-enterprise/v1/flexible-saving-books/investment-detail')
                .then((res) => resolve(res.data))
                .catch((err) => reject(err.response?.data || err));
        });
    };

export const fetchHayBondSavingBooksClosing = (id: string): Promise<HaybondClosingResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/bond-enterprise/v1/saving-books/${id}/closing`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchHayBondSavingBooksClosingPreview = (
    id: string,
): Promise<HaybondClosingPreviewResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/bond-enterprise/v1/saving-books/${id}/closing/preview`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const updateHayBondSavingBooksClosing = (
    id: string,
    token: string,
): Promise<HaybondUpdateClosingResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .put(`/bond-enterprise/v1/saving-books/${id}/closing`, undefined, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    skipAutoAuth: true,
                },
                skipRefreshRetry: true,
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const updateHayBondDynamicSavingBooksClosing = (
    inputAmount: number,
    token: string,
): Promise<HaybondUpdateClosingResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .put(
                '/bond-enterprise/v1/flexible-saving-books/closing',
                { inputAmount },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        skipAutoAuth: true,
                    },
                    skipRefreshRetry: true,
                },
            )
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
