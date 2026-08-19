export type BondInfoResponse = {
    error_code: string;
    message: string;
    title?: string;
    data: unknown;
};

export type HaybondContractData = {
    pathFile: string;
    signed: boolean;
};

export type HaybondContractResponse = {
    error_code: string;
    message: string;
    title?: string;
    data: HaybondContractData;
};

export type HaybondContractsActorsResponse = {
    error_code: string;
    message: string;
    title?: string;
    data: unknown;
};
