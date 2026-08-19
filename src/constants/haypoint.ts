export const TAB_VOUCHER = [
    {
        id: 'unused',
        name: 'Chưa sử dụng',
        value: 'UNUSED',
        transKey: 'chua_su_dung',
    },
    {
        id: 'used',
        name: 'Đã sử dụng',
        value: 'USED',
        transKey: 'da_su_dung',
    },
];

export const VOUCHER_EXCHANGE_STEPS = {
    SELECTION: 'selection',
    CONFIRM: 'confirm',
    QR_CODE: 'qr_code',
    SUCCESS: 'success',
};

export const DEFAULT_PARAMS = {
    PARTNER_ID: 1,
    PAGE: 1,
    PAGE_SIZE: 50,
};

export const TRANSFER_TYPE = {
    IN: 'IN',
    OUT: 'OUT',
};

export const HAYPOINT_ASSETS = {
    POINT_ICON: 'https://cdn1.finhay.com.vn/vnsc-prod/1769951327831.4001-haypoint-line.png',
    URBOX_LOGO: 'https://cdn1.finhay.com.vn/vnsc-prod/1770609144257.303-urbox.png',
    TERMS_PDF:
        'https://cdn1.finhay.com.vn/vnsc-prod/1768792430107.059-[16_01_2026]HayPoint-T&C.docx.pdf',
};

export const VOUCHER_GRADIENT = {
    SOLID: 'linear-gradient(135deg, #49D82F, #277219)',
    SUBTLE: 'linear-gradient(135deg, rgba(48, 209, 88, 0.3) 0%, rgba(48, 209, 88, 0.1) 100%)',
};
