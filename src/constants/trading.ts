import type { StockPrice } from '@/types/datafeed/stock-info';

export const ORDER_TYPE = {
    BUY: 'Mua',
    SELL: 'Bán',
} as const;

export const ORDER_STATUS = {
    PENDING: 'Chờ khớp',
} as const;

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

export const ORDER_TYPE_KEY = {
    LO: 'LO',
} as const;

export const ORDER_SIDE = {
    BUY: 'BUY',
    SELL: 'SELL',
} as const;

export const EXCHANGE = {
    HCX: 'HCX',
} as const;

export const TRADE_UI_CONFIG = {
    AVAILABLE_TRADE_REFRESH_DELAY_MS: 1000,
    DEFAULT_PRICE_DONG: 1000,
    DEFAULT_QUANTITY: 100,
    FLASH_HIGHLIGHT_MS: 500,
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
