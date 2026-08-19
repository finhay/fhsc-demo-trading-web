import { vnscService } from '@/services/interceptor';
import {
    AuthoritySessionStateResponse,
    ConfirmingTermAndConditionResponse,
    IpoPayRemainingBalanceResponse,
    IpoRegistrationBuyAllResponse,
    IpoRegistrationBuyDetailResponse,
    IpoRegistrationBuyInformationResponse,
    IpoRegistrationBuyPayload,
    IpoRegistrationBuyPreviewOrderResponse,
    IpoRegistrationBuyResponse,
    OpportunitiesResponse,
    OtpClaimingPayload,
    OtpClaimingResponse,
    TermAndConditionResponse,
    TermAndConditionViewTemplateResponse,
} from '@/types/ipo-hunt';

export const fetchIpoHuntTermsAndCondition = (): Promise<TermAndConditionResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get('ipo-hunt/v1/contracts/term-and-condition')
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchIpoHuntTermsViewHtml = (): Promise<TermAndConditionViewTemplateResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get('ipo-hunt/v1/contracts/term-and-condition/view-template', {
                params: {
                    wt: 1,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchIpoRegistrationBuyInfo = (
    symbol: string,
): Promise<IpoRegistrationBuyInformationResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`ipo-hunt/v1/ipo/registration-buy/${symbol}/information`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchMyIpoRegistrationBuys = (): Promise<IpoRegistrationBuyAllResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get('ipo-hunt/v1/ipo/registration-buy/all')
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchIpoOpportunities = (): Promise<OpportunitiesResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get('ipo-hunt/v1/opportunities')
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const submitIpoRegistrationBuy = (
    payload: IpoRegistrationBuyPayload,
): Promise<IpoRegistrationBuyResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post('ipo-hunt/v1/ipo/registration-buy', payload)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const previewIpoRegistrationOrder = (
    payload: IpoRegistrationBuyPayload,
    type: string,
): Promise<IpoRegistrationBuyPreviewOrderResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post('ipo-hunt/v1/ipo/registration-buy/preview-order', payload, {
                params: {
                    wt: 1,
                    type,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const confirmIpoHuntTermsAndCondition = (): Promise<ConfirmingTermAndConditionResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post('ipo-hunt/v1/contracts/term-and-condition/confirming')
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const requestIpoRegistrationBuyOtp = (
    payload: OtpClaimingPayload,
): Promise<OtpClaimingResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post('ipo-hunt/v1/ipo/registration-buy/otp-claiming', payload)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchIpoAuthoritySessionState = (
    orderId: number,
): Promise<AuthoritySessionStateResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get('ipo-hunt/v1/authority/session-state', {
                params: {
                    order_id: orderId,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchIpoRegistrationBuyDetail = (
    id: number,
): Promise<IpoRegistrationBuyDetailResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`ipo-hunt/v1/ipo/registration-buy/${id}/detail`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const payIpoRegistrationBuyRemainingBalance = (
    id: number,
): Promise<IpoPayRemainingBalanceResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post(`ipo-hunt/v1/ipo/registration-buy/${id}/pay-remaining-balance`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
