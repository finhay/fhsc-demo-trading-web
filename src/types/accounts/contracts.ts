export type TermsAndConditionsResponse = {
    error_code: string;
    message: string;
    data: {
        id: number;
        title: string;
        content: string;
        template: string;
    }[];
};

export type PreviewTermAndConditionResponse = {
    error_code: string;
    message: string;
    data: string;
};

export type ContractsEnterpriseResponse = {
    error_code: string;
    message: string;
    data: {
        contract_type: string;
        pathFile: string;
        owner: string;
        title: string;
    }[];
};

export type ContractsHaybondResponse = {
    error_code: string;
    message: string;
    result: string;
};

export type ContractTemplate = {
    id: number;
    title: string;
    content: string;
    template_type: string;
    version: string;
};

export type ContractTemplatesResponse = {
    error_code: string;
    message: string;
    data: ContractTemplate[];
};

export type ContractTemplatesV2Response = {
    error_code: string;
    message: string;
    data: ContractTemplate[];
};

export type PreviewContractResponse = {
    error_code: string;
    message: string;
    data: string;
};

export type ContractDetailResponse = {
    error_code: string;
    message: string;
    data: ContractTemplate;
};
