export type EkycImageResponse = {
    error_code: string;
    message: string;
    result: {
        image_url: string;
        status: string;
    };
};

export type OcrData = {
    id_number: string;
    full_name: string;
    dob: string;
    gender: string;
    nationality: string;
    place_of_origin: string;
    place_of_residence: string;
    id_expire_date: string;
    id_issue_date: string;
    id_issue_place: string;
};

export type OcrResponse = {
    error_code: string;
    message: string;
    result: OcrData;
};

export type ValidationOcrPayload = {
    dob: string;
    id_number: string;
    id_expire_date: string;
};

export type ValidationOcrResponse = {
    error_code: string;
    message: string;
    result: { is_valid: boolean };
};

export type CompleteEkycPayload = {
    full_name: string;
    dob: string;
    gender: string;
    id_number: string;
    id_expire_date: string;
    id_issue_date: string;
    place_of_origin: string;
    place_of_residence: string;
    nationality: string;
};

export type CompleteEkycResponse = {
    error_code: string;
    message: string;
    result: { status: string };
};

export type EkycNfcUpdatableResponse = {
    error_code: string;
    message: string;
    data: {
        allow_additional_nfc_info: boolean;
    };
};
