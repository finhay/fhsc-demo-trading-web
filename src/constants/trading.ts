import type { StockPrice } from '@/types/datafeed/stock-info';
import type { TwapLoSliceStatus } from '@/types/trade/twap-lo';

export const ORDER_TYPE = {
    BUY: 'Mua',
    SELL: 'Bán',
} as const;

export const ORDER_STATUS = {
    PENDING: 'Chờ khớp',
} as const;

export const ICEBERG_TERMINAL_STATUSES = new Set([
    'CANCELLED',
    'COMPLETED',
    'FAILED',
    'CANCELLING',
]);

export const TWAP_LO_TERMINAL_STATUSES = new Set([
    'COMPLETED',
    'PARTIALLY_MATCHED',
    'EXPIRED',
    'CANCELLED',
    'CANCELLING',
]);

export const TWAP_LO_SLICE_PENDING_STATUSES = new Set<TwapLoSliceStatus>([
    'PENDING',
    'DISPATCHING',
    'CARRIED_OVER',
]);

export const PRICE_COLOR_VARIANT = {
    ORANGE: 'orange',
    RED: 'red',
    GREEN: 'green',
    PURPLE: 'purple',
    BLUE: 'blue',
} as const;

export const PRICE_COLOR_MAP: Record<string, string> = {
    [PRICE_COLOR_VARIANT.ORANGE]: 'text-orange',
    [PRICE_COLOR_VARIANT.RED]: 'text-red',
    [PRICE_COLOR_VARIANT.GREEN]: 'text-green',
    [PRICE_COLOR_VARIANT.PURPLE]: 'text-purple',
    [PRICE_COLOR_VARIANT.BLUE]: 'text-blue',
};

export const INITIAL_STOCK_PRICE_DATA: Omit<StockPrice, 'symbol'> = {
    exchange: '',
    stockType: '',
    name: '',
    price: 0,
    close: 0,
    ceiling: 0,
    floor: 0,
    reference: 0,
    average: 0,
    high: 0,
    low: 0,
    open: 0,
    volume: 0,
    totalVolume: 0,
    totalValue: 0,
    change: 0,
    changePercent: 0,
    buyPrice1: 0,
    buyPrice2: 0,
    buyPrice3: 0,
    sellPrice1: 0,
    sellPrice2: 0,
    sellPrice3: 0,
    buyVol1: 0,
    buyVol2: 0,
    buyVol3: 0,
    sellVol1: 0,
    sellVol2: 0,
    sellVol3: 0,
    foreignBought: 0,
    foreignSold: 0,
    foreignRemain: 0,
    remainBid: 0,
    remainAsk: 0,
    createdAt: 0,
    hasNewestNews: false,
    stockSummary: '',
    companyType: '',
    symbolStatus: null,
    symbolStatusCode: '',
    floorCode: '',
    pe: 0,
    pb: 0,
    roe: 0,
    marketCap: 0,
    influenceScore: 0,
    marketCapCategory: '',
    listedShare: 0,
};

export const TRADING_SLIDER_CONFIG = {
    MIN: 0,
    MAX: 100,
    STEP_SIZE: 1,
} as const;

export const TRADING_SLIDER_TICKS = [0, 25, 50, 75, 100] as const;

export const CHANGE_VARIANT = {
    UP: 'up',
    DOWN: 'down',
    CEILING: 'ceiling',
    FLOOR: 'floor',
    REFERENCE: 'ref',
} as const;

export const LOT_TYPE = {
    EVEN: 'even',
    ODD: 'odd',
} as const;

export const LOT_TABS = [{ key: LOT_TYPE.EVEN }, { key: LOT_TYPE.ODD }] as const;

export const ORDER_MODE_KEY = {
    NORMAL: 'NORMAL',
    TAB_247: '_247',
    ICEBERG: 'ICEBERG',
    TWAP_LO: 'TWAP_LO',
} as const;

export const TWAP_LO_URGENCY = {
    SLOW: 'SLOW',
    NORMAL: 'NORMAL',
    FAST: 'FAST',
} as const;

export const TWAP_LO_URGENCY_OPTIONS = [
    TWAP_LO_URGENCY.SLOW,
    TWAP_LO_URGENCY.NORMAL,
    TWAP_LO_URGENCY.FAST,
] as const;

export const ORDER_TYPE_KEY = {
    LO: 'LO',
    MARKET: 'MARKET',
    LIMIT: 'LIMIT',
    ORDER_247: 'ORDER247',
} as const;

export const ORDER_SIDE = {
    BUY: 'BUY',
    SELL: 'SELL',
} as const;

export const EXCHANGE = {
    HCX: 'HCX',
} as const;

export const QR_CONTEXT = {
    TRADING: 'TRADING',
} as const;

export const QR_STATUS = {
    APPROVED: 'APPROVED',
} as const;

export const TWO_FA_PLACEMENT = {
    GLOBAL: 'global',
    PANEL: 'panel',
} as const;

export type TwoFAPlacement = (typeof TWO_FA_PLACEMENT)[keyof typeof TWO_FA_PLACEMENT];

export const TRADE_SESSION_NEAR_BOUNDARY = ['ATO_IN_1_MIN', 'OPEN_IN_1_MIN', 'PCA_CLOSE'] as const;

export const TRADE_UI_CONFIG = {
    AVAILABLE_TRADE_REFRESH_DELAY_MS: 1000,
    DEFAULT_PRICE_DONG: 1000,
    DEFAULT_QUANTITY: 100,
    MAX_ORDER_QTY_PER_REQUEST: 500000,
    DEFAULT_247_MONTH_OFFSET: 2,
    MAX_247_MONTH_OFFSET: 6,
    FLASH_HIGHLIGHT_MS: 500,
    QR_SIZE: 192,
} as const;

export const TRADE_PAGE_META = {
    DEFAULT_SYMBOL: 'HPG',
} as const;

export const TRADE_PAGE_ARIA = {
    ACCOUNT_PORTFOLIO: 'Thông tin tài khoản và danh mục',
    CHART: 'Biểu đồ',
    PRICE_TRANSACTION: 'Bảng giá và giao dịch',
    ACCOUNT_TRADE: 'Tài khoản và đặt lệnh',
} as const;

export const TRADE_LITERAL = {
    BUY: 'buy',
    SELL: 'sell',
    INCREASE: 'inc',
    DECREASE: 'dec',
    MARKET_SIDE_BUY: 'M',
} as const;

export const TRADE_TOPIC = {
    TRANSLOG_PREFIX: '/translog',
} as const;

export const EXCHANGE_SESSION = {
    CLOSED: 'CLOSED',
} as const;

export const ORDER_MODES: { key: string }[] = [
    { key: ORDER_MODE_KEY.NORMAL },
    { key: ORDER_MODE_KEY.TAB_247 },
    { key: ORDER_MODE_KEY.ICEBERG },
    { key: ORDER_MODE_KEY.TWAP_LO },
];

export const PANEL_ORDER_MODES: { key: string }[] = [...ORDER_MODES];

export const QR_AUTH_CONFIG = {
    POLL_INTERVAL: 3000,
    TIMEOUT: 60000,
} as const;

export const OTP_CONFIG = {
    LENGTH: 6,
    INITIAL_COUNTDOWN: 59,
    TYPE: 'TRADING_OTP',
} as const;

export const SPECIAL_FUND_SYMBOLS: string[] = [
    'FUEFCV50',
    'FUEBFVND',
    'E1VFVN30',
    'FUEDCMID',
    'FUEIP100',
    'FUEKIV30',
    'FUEKIVFS',
    'FUEMAV30',
    'FUEMAVND',
    'FUESSV30',
    'FUESSV50',
    'FUESSVFL',
    'FUEVFVND',
    'FUEVN100',
];

export const STOCK_TYPE = {
    STOCK: 'STOCK',
    FUND_CERTIFICATE: 'FUND_CERTIFICATE',
    BOND: 'BOND',
    WARRANT: 'WARRANT',
    ETF: 'ETF',
} as const;

export const CHART_COLORS = {
    background: 'transparent',
    tooltip: {
        background: '#28292B',
        border: '#3AC45C',
        text: '#F8F8F8',
    },
    grid: 'rgba(242,242,242,0.1)',
    axis: {
        label: '#999999',
        labelLight: '#F8F8F8',
    },
    series: {
        primary: '#3AC45C',
        gradientStart: 'rgba(39,150,70,0.32)',
        gradientEnd: 'rgba(39,150,70,0)',
    },
    pie: {
        border: '#1C1C1E',
    },
} as const;

export const TAB_INFORMATION = [
    { key: 'CHART' },
    { key: 'OVERVIEW' },
    { key: 'FINANCE' },
    { key: 'STATISTICS' },
    { key: 'EVENTS' },
    { key: 'PROFILE' },
] as const;

export const NORMAL_HISTORY_STATUSES = new Set(['MATCHED', 'MATCHED_ALL']);
