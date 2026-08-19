import { vnscService } from '@/services/interceptor';
import type {
    BondInfoResponse,
    HaybondContractResponse,
    HaybondContractsActorsResponse,
} from '@/types/bond-enterprise/bonds';

export const getBondInfoBySymbol = (symbol: string): Promise<BondInfoResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get('/bond-enterprise/v1/bonds', {
                params: { symbol },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchHayBondContractsActors = (): Promise<HaybondContractsActorsResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get('/bond-enterprise/v1/contracts/actors')
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchHayBondContract = (): Promise<HaybondContractResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get('/bond-enterprise/v1/contracts/tc')
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
