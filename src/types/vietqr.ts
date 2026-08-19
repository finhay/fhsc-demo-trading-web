export type VietQRGenerateResponse = {
    code: string;
    desc: string;
    data: {
        qrCode: string;
        qrDataURL: string;
    };
};
