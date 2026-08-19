export type Province = {
    id: string;
    name: string;
    code: string;
};

export type District = {
    id: string;
    name: string;
    code: string;
    province_id: string;
};

export type Ward = {
    id: string;
    name: string;
    code: string;
    district_id: string;
};

export type ProvincesResponse = {
    error_code: string;
    message: string;
    data: Province[];
};

export type DistrictsResponse = {
    error_code: string;
    message: string;
    data: District[];
};

export type WardsResponse = {
    error_code: string;
    message: string;
    data: Ward[];
};
