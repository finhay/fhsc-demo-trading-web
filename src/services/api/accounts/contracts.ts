import { vnscService } from '@/services/interceptor';
import type {
    ContractsHaybondResponse,
    PreviewTermAndConditionResponse,
    TermsAndConditionsResponse,
} from '@/types/accounts/contracts';

export const fetchPublicTermsAndConditionTemplates = (): Promise<TermsAndConditionsResponse> => {
    return new Promise<TermsAndConditionsResponse>((resolve, reject) => {
        vnscService
            .get('/accounts/public/v1/contracts/templates/term-condition')
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchTermsAndConditionPreviewById = (
    id: number,
): Promise<PreviewTermAndConditionResponse> => {
    return new Promise<PreviewTermAndConditionResponse>((resolve, reject) => {
        vnscService
            .get(`/accounts/public/v1/contracts/templates/term-condition/${id}/preview`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchContractTermsByType = (type: string): Promise<ContractsHaybondResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/accounts/v1/contracts/types/${type}`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
