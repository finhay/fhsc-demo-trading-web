import { AUTH_MODE } from '@/constants/auth';

export enum NextAction {
    EKYC = 'EKYC',
    WAIT_CHECKING_EKYC = 'WAIT_CHECKING_EKYC',
    SIGNATURE = 'SIGNATURE',
    WAIT_OPEN_ACCOUNT = 'WAIT_OPEN_ACCOUNT',
    UPDATE_EMAIL = 'UPDATE_EMAIL',
    CLOSE = 'CLOSE',
    NONE = 'NONE',
}

export const MQTT = {
    PERCENTAGE_CONVERSION: 100,
    PROGRESS_BAR_DEFAULT_HEIGHT: 8,
    PROGRESS_MIN_VALUE: 0,
    PROGRESS_MAX_VALUE: 100,
};

export const UI_CONSTANTS = {
    TOOLTIP_OFFSET: 8,
};

export const DEFAULT_AVATAR_URL =
    'https://cdn1.finhay.com.vn/vnsc-prod/1779967089857.8774-icon-avatar.png';

export const LANGUAGES = [
    {
        code: 'vi',
        label: 'Tiếng Việt',
        flagSrc: 'https://cdn1.finhay.com.vn/vnsc-prod/1722397135817-flag_vi.svg',
        flagAlt: { vi: 'Cờ Việt Nam', en: 'Vietnamese flag' },
    },
    {
        code: 'en',
        label: 'English',
        flagSrc: 'https://cdn1.finhay.com.vn/vnsc-prod/1722397161815-flag_en.svg',
        flagAlt: { vi: 'Cờ Anh', en: 'English flag' },
    },
] as const;

export const AUTH_ROUTES = [
    {
        mode: AUTH_MODE.LOGIN,
        translationKey: 'login',
        isPrimary: true,
    },
    {
        mode: AUTH_MODE.REGISTER,
        translationKey: 'register',
        isPrimary: false,
    },
] as const;

export const HEADER_ROUTES = [
    {
        path: '/',
        translationKey: 'market',
        activeRoutes: ['/'],
    },
    {
        path: '/bang-gia',
        translationKey: 'board',
        activeRoutes: ['/bang-gia'],
    },
    {
        path: '/giao-dich',
        translationKey: 'trade',
        activeRoutes: ['/giao-dich'],
    },
    {
        path: '/tai-san',
        translationKey: 'assets',
        activeRoutes: ['/tai-san'],
        requireAuth: true,
    },
];

export type OtherProductNavItem = {
    path: string;
    translationKey: string;
    descriptionKey: string;
    icon: string;
    activeRoutes: string[];
    partialMatch?: boolean;
    requireAuth?: boolean;
    requireEnterprise?: boolean;
    requireIndividual?: boolean;
};

export type OtherProductNavSection = {
    sectionKey: string;
    children: OtherProductNavItem[];
};

export const OTHER_PRODUCTS_NAV: {
    translationKey: string;
    sections: OtherProductNavSection[];
} = {
    translationKey: 'other_products',
    sections: [
        {
            sectionKey: 'investment',
            children: [
                {
                    path: '/haybond',
                    translationKey: 'haybond',
                    descriptionKey: 'haybond_desc',
                    icon: 'https://cdn1.finhay.com.vn/vnsc-prod/1784775543319.8784-haybond.png',
                    activeRoutes: ['haybond'],
                    partialMatch: true,
                    requireAuth: true,
                    requireEnterprise: true,
                },
                {
                    path: '/haypoint',
                    translationKey: 'haypoint',
                    descriptionKey: 'haypoint_desc',
                    icon: 'https://cdn1.finhay.com.vn/vnsc-prod/1784775543321.0354-haypoint.png',
                    activeRoutes: ['haypoint'],
                    partialMatch: true,
                    requireAuth: true,
                    requireIndividual: true,
                },
                {
                    path: '/ipo',
                    translationKey: 'ipo',
                    descriptionKey: 'ipo_desc',
                    icon: 'https://cdn1.finhay.com.vn/vnsc-prod/1784775543322.0774-ipo.png',
                    activeRoutes: ['ipo'],
                    partialMatch: true,
                    requireAuth: true,
                    requireIndividual: true,
                },
            ],
        },
        {
            sectionKey: 'support_tools',
            children: [
                {
                    path: '/quan-ly-quy',
                    translationKey: 'quan_ly_quy',
                    descriptionKey: 'quan_ly_quy_desc',
                    icon: 'https://cdn1.finhay.com.vn/vnsc-prod/1784778192795.1655-fund.png',
                    activeRoutes: ['/quan-ly-quy'],
                    partialMatch: true,
                    requireAuth: true,
                    requireEnterprise: true,
                },
            ],
        },
    ],
};

export const PROFILE_TABS = [
    {
        id: 1,
        label: 'Thông tin cơ bản',
        panelId: 'tab-panel-1',
        translationKey: 'basic_info',
    },
    {
        id: 2,
        label: 'Ngân hàng',
        panelId: 'tab-panel-2',
        translationKey: 'bank',
    },
    {
        id: 3,
        label: 'Hồ sơ',
        panelId: 'tab-panel-3',
        translationKey: 'docs',
        requireHayBond: true,
    },
];

export const ACCOUNT_TYPE = {
    INDIVIDUAL: 'INDIVIDUAL',
    ENTERPRISE: 'ENTERPRISE',
};

export const STATUS_CODES = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
};

export const ERROR_CODES = {
    SUCCESS: '0',
    FAILED_2FA_TOKEN_EXPIRED: '2FATokenExpiredException',
};

export const SUB_ACCOUNT_TYPE = {
    NORMAL: 'Normal',
    MARGIN: 'Margin',
} as const;

export const SUB_ACCOUNT_PERMISSION = {
    ALL: 'ALL',
    TRANSFER_CASH: 'TRANSFER_CASH',
    TRANSFER_STOCK: 'TRANSFER_STOCK',
    DEPOSIT_CASH: 'DEPOSIT_CASH',
    WITHDRAW_CASH: 'WITHDRAW_CASH',
    TRADE: 'TRADE',
    CASH_ADVANCE: 'CASH_ADVANCE',
    SCHEME_FEES: 'SCHEME_FEES',
    STOCK_HISTORY: 'STOCK_HISTORY',
} as const;

export const INDEX_LIST = ['VNINDEX', 'VN30', 'HNXINDEX', 'HNX30', 'UPCOMINDEX'];

export const MARKET_TITLE_DISPLAY_NAME_MAP: Record<string, string> = {
    HOSE: 'VNINDEX',
    VN30: 'VN30',
    HNX: 'HNXINDEX',
    HNX30: 'HNX30',
    UPCOM: 'UPCOMINDEX',
    'LO-LE-HOSE': 'VNINDEX',
    'LO-LE-HNX': 'HNXINDEX',
    'LO-LE-UPCOM': 'UPCOMINDEX',
};

export const QR_INTERVAL = {
    REGENERATE: 110000,
    POLL: 2000,
    RETRY_DELAY: 2000,
};

export const NETWORK_HEALTH = {
    MQTT_WATCHDOG_INTERVAL_MS: 5_000,
    MQTT_SAMPLE_THROTTLE_MS: 1_000,
    RESYNC_AFTER_HIDDEN_MS: 60_000,
    SAMPLE_WINDOW: 10,
    EWMA_ALPHA: 0.3,
    STABLE_MAX_LATENCY_MS: 800,
    STABLE_MIN_SUCCESS_RATE: 0.8,
    CONSECUTIVE_FAIL_OFFLINE: 2,
} as const;

export const DEFAULT_EXCHANGE = 'VN30';
export const EXCHANGES = ['HOSE', 'HNX', 'UPCOM'] as const;

export const EXCHANGE_TO_INDEX: Record<string, string> = {
    HOSE: 'VNINDEX',
    HNX: 'HNX',
    UPCOM: 'UPCOM',
};
