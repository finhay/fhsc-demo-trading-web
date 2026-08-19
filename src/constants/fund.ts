import type { FundNavLabelKey, FundTab } from '@/types/pages/fund';

export const TRADE_IMPORT_STEPS = ['Nguồn giao dịch', 'Xem trước GD'];
export const TRADE_STEP_KEYS = ['upload', 'preview', 'done'] as const;

export const INVESTOR_IMPORT_STEPS = ['Nguồn giao dịch', 'Xem trước NĐT'];
export const INVESTOR_STEP_KEYS = ['upload', 'preview', 'done'] as const;

export const TRADE_ORDER_TYPE = {
    BUY: 'MUA',
    SELL: 'BAN',
    DEPOSIT: 'NOP_VON',
    WITHDRAW: 'RUT_VON',
    DIVIDEND: 'CO_TUC',
    FEE: 'PHI',
    BONUS_STOCK: 'CO_PHIEU_THUONG',
} as const;

export type TradeOrderType = (typeof TRADE_ORDER_TYPE)[keyof typeof TRADE_ORDER_TYPE];

export const TRADE_ORDER_TYPE_VALUES: TradeOrderType[] = Object.values(TRADE_ORDER_TYPE);

export const TRADE_ORDER_TYPE_OPTIONS_VI: {
    value: TradeOrderType;
    label: string;
}[] = [
    { value: TRADE_ORDER_TYPE.BUY, label: 'Mua' },
    { value: TRADE_ORDER_TYPE.SELL, label: 'Bán' },
    { value: TRADE_ORDER_TYPE.DEPOSIT, label: 'Nộp vốn' },
    { value: TRADE_ORDER_TYPE.WITHDRAW, label: 'Rút vốn' },
    { value: TRADE_ORDER_TYPE.DIVIDEND, label: 'Cổ tức' },
    { value: TRADE_ORDER_TYPE.FEE, label: 'Phí' },
    { value: TRADE_ORDER_TYPE.BONUS_STOCK, label: 'Cổ phiếu thưởng' },
];

export const FUND_TAB = {
    DASHBOARD: 'dashboard',
    CLIENTS: 'clients',
    PORTFOLIO: 'portfolio',
    IMPORT: 'import',
} as const satisfies Record<string, FundTab>;

export const FUND_SUB_NAV_TABS: { key: FundTab; labelKey: FundNavLabelKey }[] = [
    { key: FUND_TAB.DASHBOARD, labelKey: 'tong_quan' },
    { key: FUND_TAB.CLIENTS, labelKey: 'khach_hang' },
    { key: FUND_TAB.PORTFOLIO, labelKey: 'danh_muc' },
    { key: FUND_TAB.IMPORT, labelKey: 'import' },
];

export const INTRADAY_SPARK_COLORS = {
    green: '#3AC45C',
    red: '#EB4337',
    yellow: '#E98E00',
};
export const INTRADAY_SPARK_FILLS = {
    green: 'rgba(58,196,92,0.22)',
    red: 'rgba(235,67,55,0.22)',
    yellow: 'rgba(233,142,0,0.22)',
};

export const FUND_IMPACT_CHART_THROTTLE_MS = 2000;

export const FUND_MARKET_METADATA_CHUNK_SIZE = 50;

export const FUND_EXPORT_STAGGER_DELAY_MS = 250;

export const FUND_TEMPLATE_DOWNLOAD_URL = {
    url: 'https://cdn1.finhay.com.vn/vnsc-prod/1779244514083.7024-Template.zip',
    filename: 'Template.zip',
} as const;

export const FUND_FORM_INPUT_CLS =
    'w-full rounded-xl border border-quaternary bg-secondary px-3 py-2 font-body-3 text-primary outline-none transition-colors focus:border-highlight/40 focus:ring-0';

export const FUND_FORM_DATE_CLS = `${FUND_FORM_INPUT_CLS} [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer`;

export const FUND_STOCK_ORDER_TYPES: TradeOrderType[] = [
    TRADE_ORDER_TYPE.BUY,
    TRADE_ORDER_TYPE.SELL,
    TRADE_ORDER_TYPE.DIVIDEND,
];

export const FUND_VOLUME_ORDER_TYPES: TradeOrderType[] = [
    TRADE_ORDER_TYPE.BUY,
    TRADE_ORDER_TYPE.SELL,
];

export const FUND_THESIS_TOTAL_EPSILON = 0.001;

export const FUND_IMPORT_ACCEPT = '.csv,.xlsx';

export const XLSX_EXTENSIONS = ['.xlsx', '.xls'];

export const TRANSACTION_CSV_HEADERS = [
    'ma_gd',
    'ngay_gd',
    'ngay_khop',
    'ma_ndt',
    'loai_lenh',
    'ma_ck',
    'nganh',
    'khoi_luong',
    'gia_khop',
    'phi_gd',
    'thue',
    'tong_tien',
    'tieu_khoan',
];

export const TRANSACTION_CSV_REQUIRED_COLS = [
    'ma_gd',
    'ngay_gd',
    'ma_ndt',
    'loai_lenh',
    'tong_tien',
] as const;

export const INVESTOR_CSV_BASE_HEADERS = [
    'ma_ndt',
    'ho_ten',
    'so_dien_thoai',
    'ngay_uy_thac',
    'rm_phu_trach',
    'rm_id',
    'von_uy_thac_vnd',
    'trang_thai',
];

export const INVESTOR_CSV_REQUIRED_COLS = [
    'ma_ndt',
    'ho_ten',
    'so_dien_thoai',
    'ngay_uy_thac',
    'von_uy_thac_vnd',
] as const;

export const REVOKE_BLOB_URL_MS = 2000;

export const VAULT_SCHEMA_VERSION = 1;

export const SECRET_KEY_BYTES = 16;
export const ACCOUNT_SALT_BYTES = 16;
export const DEK_BYTES = 32;
export const AES_IV_BYTES = 12;

export const ARGON2ID_OPSLIMIT = 4;
export const ARGON2ID_MEMLIMIT_BYTES = 64 * 1024 * 1024;

export const KEK_HKDF_INFO = 'fund-vault-kek-v1';
export const RECOVERY_HKDF_INFO = 'fund-vault-recovery-v1';

export const SECRET_KEY_PREFIX = 'FV1';

export const AUTO_LOCK_MS = 15 * 60 * 1000;

export const FUND_VAULT_ENABLED =
    typeof process !== 'undefined' && process.env.NEXT_PUBLIC_FUND_VAULT_ENABLED !== 'false';

export const VAULT_BACKUP_MAGIC = 'FVAULT1';

export const VAULT_SELF_GRANTEE = 'self';

export const PASSPHRASE_MIN_LENGTH = 8;

export const RECORD_TYPE = {
    INVESTOR: 'investor',
    TRANSACTION: 'transaction',
    HOLDING: 'holding',
    NAV_SNAPSHOT: 'nav_snapshot',
    IMPORT_BATCH: 'import_batch',
} as const;
