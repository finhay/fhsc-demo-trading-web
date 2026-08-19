import { vnscService } from '@/services/interceptor';
import type {
    HaybondBuyPriceResponse,
    HaybondDynamicOrdersPreviewResponse,
    HaybondInvestmentHistoriesResponse,
    HaybondPackageDetailResponse,
    HaybondPackagesResponse,
    HaybondPreviewPayload,
    HaybondTermBuyPriceResponse,
} from '@/types/bond-enterprise/packages';

export const fetchHayBondPackages = (): Promise<HaybondPackagesResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get('/bond-enterprise/v1/packages')
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchHayBondPackagesDynamic = (): Promise<HaybondPackagesResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get('/bond-enterprise/v1/flexible-packages')
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchHayBondPackageDynamicPreview = (
    data: HaybondPreviewPayload,
): Promise<HaybondDynamicOrdersPreviewResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post('/bond-enterprise/v1/flexible-orders/preview', data)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchHayBondPackageDynamicBuyPrice = (
    flexiblePackageId: number,
): Promise<HaybondBuyPriceResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/bond-enterprise/v1/flexible-packages/${flexiblePackageId}/buy-price`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchHayBondDynamicInvestmentHistories =
    (): Promise<HaybondInvestmentHistoriesResponse> => {
        return new Promise((resolve, reject) => {
            vnscService
                .get('/bond-enterprise/v1/flexible-orders/investment-histories')
                .then((res) => resolve(res.data))
                .catch((err) => reject(err.response?.data || err));
        });
    };

export const fetchHayBondPackagesDetail = (id: string): Promise<HaybondPackageDetailResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/bond-enterprise/v1/packages/${id}`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchHayBondDynamicPackagesDetail = (
    id: string,
): Promise<HaybondPackageDetailResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/bond-enterprise/v1/flexible-packages/${id}`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchHayBondPackagesBuyPrice = (id: number): Promise<HaybondTermBuyPriceResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/bond-enterprise/v1/packages/${id}/buy-price`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
