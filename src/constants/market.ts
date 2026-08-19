import type { FundMarketSummary } from '@/types/pages/fund';
import type {
    MacroLiquidityRawState,
    MacroLiquidityState,
    MacroUsRawState,
    MacroVnRawState,
} from '@/types/pages/market';

export const BAR_CHART_AXIS_TOOLTIP = {
    trigger: 'axis' as const,
    axisPointer: {
        type: 'shadow' as const,
        shadowStyle: {
            color: '#28292b',
        },
        z: 0,
    },
};

export const CHART_X_TICK_COUNT = 4;

export const TRADING_FLOW_BLOCK_TABS = ['foreign', 'proprietary'] as const;

export const TRADING_FLOW_EXCHANGES = [
    { label: 'HOSE', value: 'HOSE' },
    { label: 'HNX', value: 'HNX' },
    { label: 'UPCOM', value: 'UPCOM' },
] as const;

export const TRADING_FLOW_HISTORY_PERIODS = [
    { value: 'YTD', labelKey: 'period_ytd' },
    { value: '1Y', labelKey: 'period_1y' },
    { value: '3Y', labelKey: 'period_3y' },
    { value: '5Y', labelKey: 'period_5y' },
] as const;

export const MARKET_INDEX_LIST = ['VNINDEX', 'HNXINDEX', 'UPCOMINDEX', 'VN30', 'HNX30'] as const;

export const INDEX_TO_EXCHANGE: Record<string, string> = {
    VNINDEX: 'HOSE',
    HNXINDEX: 'HNX',
    UPCOMINDEX: 'UPCOM',
    VN30: 'VN30',
    HNX30: 'HNX30',
};

export const GLOBAL_INDEX_TAB = { US: 'us', ASIA: 'asia' } as const;
export const US_INDICES = ['SP_500', 'DOW_JONES', 'NASDAQ'] as const;
export const ASIA_INDICES = ['NIKKEI_225', 'KOSPI', 'HANGSENG'] as const;

export const MACRO_INDICATOR_ROW_CONFIGS = [
    { key: 'IIP', isPercent: true },
    { key: 'PMI', isPercent: false },
    { key: 'SERVICE_RETAIL', isPercent: true },
    { key: 'GOODS_RETAIL', isPercent: true },
    { key: 'CPI', isPercent: true },
    { key: 'EXPORT_TOTAL', isPercent: true },
    { key: 'EXPORT_DOMESTIC', isPercent: true },
    { key: 'EXPORT_FDI', isPercent: true },
] as const;

export const MACRO_CELL_RANK_COLORS = ['#174E2547', '#23763747', '#2E9D4A47', '#3AC45C47'] as const;

export const MACRO_CELL_RANK_THRESHOLDS = [0.25, 0.5, 0.75] as const;

export const MACRO_SERIES_COLORS = {
    blue: '#2994ff',
    orange: '#e98e00',
    gray: '#999999',
} as const;

export const MACRO_COUNTRY_TABS = [
    {
        value: 'vn',
        flag: 'https://cdn1.finhay.com.vn/vnsc-prod/1785117571206.4128-vn.png',
    },
    {
        value: 'us',
        flag: 'https://cdn1.finhay.com.vn/vnsc-prod/1785117571204.7087-us.png',
    },
] as const;

export const EMPTY_MACRO_VN_RAW: MacroVnRawState = {
    iip: [],
    pmi: [],
    serviceRetail: [],
    goodsRetail: [],
    cpi: [],
    exportData: [],
};

export const EMPTY_MACRO_US_RAW: MacroUsRawState = {
    pce: [],
    corePce: [],
    nfp: [],
    unemployment: [],
};

export const EXCHANGE_RATE_CURRENCIES = ['USD', 'CNY', 'EUR', 'JPY'] as const;
export const MACRO_LIQUIDITY_DEFAULT_CURRENCY: (typeof EXCHANGE_RATE_CURRENCIES)[number] = 'USD';
export const EXCHANGE_RATE_PERIODS = ['YTD', '1M', '1Y'] as const;
export const EXCHANGE_RATE_DEFAULT_PERIOD = 'YTD' as const;
export const EXCHANGE_RATE_DEFAULT_VALUE_TYPE = 'NUMBER' as const;
export const EXCHANGE_RATE_VALUE_TYPES = ['NUMBER', 'PERCENT'] as const;

export const EMPTY_MACRO_LIQUIDITY_RAW: MacroLiquidityRawState = {
    exchangeChart: null,
    interbank: [],
    omo: [],
    deposit: null,
    loan: [],
};

export const EMPTY_MACRO_LIQUIDITY_STATE: MacroLiquidityState = {
    exchangeRate: null,
    interbank: null,
    omo: null,
    deposit: null,
    loan: null,
};
export const LOAN_RATE_PREFERRED_BANK = 'Vietcombank';
export const MACRO_LIQUIDITY_TREND_COLOR = {
    up: 'text-green',
    down: 'text-red',
    flat: 'text-orange',
} as const;

export const DEPOSIT_RATE_BANKS = [
    { apiName: 'VPBANK', label: 'VPB' },
    { apiName: 'MB', label: 'MB' },
    { apiName: 'Techcombank', label: 'TCB' },
    { apiName: 'ACB', label: 'ACB' },
] as const;

export const DEPOSIT_RATE_DURATION_KEYWORD = '12';
export const LOAN_RATE_FIXED_TYPE = 'Cố định';
export const LOAN_RATE_FLOAT_TYPE = 'Thả nổi';

export const FUND_TYPE_STOCK_FUND = 'STOCK_FUND';
const FUND_TYPE_BOND_FUND = 'BOND_FUND';
const FUND_TYPE_BALANCE_FUND = 'BALANCE_FUND';
export const PROFIT_PERIOD_ONE_YEAR = 'ONE_YEAR';
export const PROFIT_PERIOD_THREE_YEARS = 'THREE_YEARS';
export const PROFIT_PERIOD_FIVE_YEARS = 'FIVE_YEARS';
export const PROFIT_PERIOD_YEAR_TO_DATE = 'YEAR_TO_DATE';

export const FUND_UNIVERSE_BG_URL =
    'https://cdn1.finhay.com.vn/vnsc-prod/1785125396803.307-bg-fund.png';

export const FUND_UNIVERSE_TAB = {
    SHORT_TERM: 'short_term',
    LONG_TERM: 'long_term',
    INVESTOR: 'investor',
    FUND_FLOW: 'fund_flow',
    AUM: 'aum',
} as const;

export const FUND_UNIVERSE_TABS = [
    FUND_UNIVERSE_TAB.SHORT_TERM,
    FUND_UNIVERSE_TAB.LONG_TERM,
    FUND_UNIVERSE_TAB.INVESTOR,
    FUND_UNIVERSE_TAB.FUND_FLOW,
    FUND_UNIVERSE_TAB.AUM,
] as const;

export const FUND_LIST_TABS = [
    FUND_TYPE_STOCK_FUND,
    FUND_TYPE_BOND_FUND,
    FUND_TYPE_BALANCE_FUND,
] as const;

export const EMPTY_FUND_MARKET_SUMMARY: FundMarketSummary = {
    month: null,
    fundsBeatingVnIndex: null,
    netFundFlow: null,
    aumChangePercent: null,
};

export const FUND_NAV_CHART_PERIODS = [
    'ONE_MONTH',
    'THREE_MONTHS',
    'SIX_MONTHS',
    'ONE_YEAR',
    'FIVE_YEARS',
] as const;

export const FUND_NAV_CHART_DEFAULT_PERIOD = FUND_NAV_CHART_PERIODS[0];

export const FUND_DETAIL_TABS = ['info', 'fee'] as const;

export const FUND_FEE_TYPES = { buy: 'BUY', sell: 'SELL' } as const;

export const FUND_PLANET_SLOTS = [
    { left: '18.2%', top: '28.6%' },
    { left: '34.1%', top: '4.2%' },
    { left: '50%', top: '36.4%' },
    { left: '64.7%', top: '10.9%' },
    { left: '76.6%', top: '48.7%' },
] as const;

export const FUND_PLANET_IMAGES = [
    'https://cdn1.finhay.com.vn/vnsc-prod/1785142219606.7974-planet1.png',
    'https://cdn1.finhay.com.vn/vnsc-prod/1785142219607.7197-planet2.png',
    'https://cdn1.finhay.com.vn/vnsc-prod/1785142219608.2063-planet3.png',
    'https://cdn1.finhay.com.vn/vnsc-prod/1785142219609.287-planet4.png',
    'https://cdn1.finhay.com.vn/vnsc-prod/1785142219610.8958-planet5.png',
] as const;

export const TOP_PRICE_CHANGE_PERIODS = [
    { value: 'session' as const },
    { value: '15m' as const },
    { value: '1h' as const },
    { value: '2h' as const },
];

export const MARKET_BREADTH_SERIES = [
    { key: 'floors', color: '#2994ff' },
    { key: 'declines', color: '#eb4337' },
    { key: 'nochanges', color: '#e98e00' },
    { key: 'advances', color: '#3ac45c' },
    { key: 'ceilings', color: '#b354e3' },
] as const;

export const INVESTMENT_CHANNEL_PERIODS = ['YTD', '1Y', '5Y', '10Y'] as const;

export const GLOBAL_GOLD_INDEX = 'GLOBAL_GOLD';
export const GLOBAL_SILVER_INDEX = 'GLOBAL_SILVER';

export const METAL_CHART_PERIODS = [
    { value: 30 as const, labelKey: 'period_1m' as const },
    { value: 60 as const, labelKey: 'period_3m' as const },
    { value: 180 as const, labelKey: 'period_6m' as const },
    { value: 365 as const, labelKey: 'period_1y' as const },
] as const;

export const METAL_CHART_DEFAULT_DAYS = 30;

export const PORTFOLIO_CHART = {
    size: 300,
    center: 150,
    radiusInactive: 100,
    widthInactive: 26,
    radiusActive: 100,
    widthActive: 30,
    gapDeg: 3,
    minSpanDeg: 2,
    arcStartDeg: 270,
    arcSpanDeg: 180,
    displayWidth: 300,
    displayHeight: 155,
} as const;

const portfolioActiveOuterRadius = PORTFOLIO_CHART.radiusActive + PORTFOLIO_CHART.widthActive / 2;
const portfolioActiveInnerRadius = PORTFOLIO_CHART.radiusActive - PORTFOLIO_CHART.widthActive / 2;
const portfolioActiveInnerStop = portfolioActiveInnerRadius / portfolioActiveOuterRadius;

const portfolioBandStop = (t: number) =>
    portfolioActiveInnerStop + (1 - portfolioActiveInnerStop) * t;

export const PORTFOLIO_ACTIVE_RING = {
    rOuter: portfolioActiveOuterRadius,
    rInner: portfolioActiveInnerRadius,
    depthPx: 14,
    bandStops: [
        portfolioBandStop(0),
        portfolioBandStop(0.25),
        portfolioBandStop(0.6),
        portfolioBandStop(0.85),
        1,
    ],
    wallRampFromTop: [0, 0.35, 0.7, 1],
    lightOffsetDeg: 22,
    lightRadiusScale: 1.05,
    specularSpreadScale: 0.55,
    shadeSpreadScale: 0.95,
} as const;

export const PORTFOLIO_CHART_PALETTE = {
    green: {
        bandInner: '#2BB81A',
        bandMid: '#3FD722',
        bandPeak: '#6BFF52',
        bandOuter: '#45EE2A',
        bandEdge: '#35E01E',
        specular: '#A8FF95',
        specularOpacity: 0.6,
        angularShade: '#0C3A08',
        angularShadeOpacity: 0.45,
        wallTop: '#35E01E',
        wallUpper: '#63EC4F',
        wallMid: '#9CF78C',
        wallBottom: '#D5FFCC',
        glow: '#3FEC28',
        glowOpacity: 0.32,
        inactiveEdge: '#1E3A1A',
        inactiveBody: '#142814',
        inactiveCore: '#0C1810',
    },
    red: {
        bandInner: '#C0231A',
        bandMid: '#DC2C1E',
        bandPeak: '#FF5548',
        bandOuter: '#EE3223',
        bandEdge: '#E62E20',
        specular: '#FF9A8E',
        specularOpacity: 0.5,
        angularShade: '#3A0705',
        angularShadeOpacity: 0.55,
        wallTop: '#E62E20',
        wallUpper: '#F05B4E',
        wallMid: '#FF9184',
        wallBottom: '#FFD2CA',
        glow: '#E7392B',
        glowOpacity: 0.42,
        inactiveEdge: '#4A1F1A',
        inactiveBody: '#2E1410',
        inactiveCore: '#1A0A08',
    },
} as const;

export const PORTFOLIO_INACTIVE_EDGE_CAP_DEG = 8;

export const PORTFOLIO_CHART_SHIFT_MS = 500;
export const PORTFOLIO_CHART_3D_MS = 500;

export const PORTFOLIO_STROKE_TRANSITION = { transition: 'stroke 400ms ease' } as const;
export const PORTFOLIO_FILL_TRANSITION = { transition: 'fill 400ms ease' } as const;
export const PORTFOLIO_FILL_3D_TRANSITION = {
    transition: `fill 400ms ease, opacity ${PORTFOLIO_CHART_3D_MS}ms ease`,
} as const;

export const PORTFOLIO_THEME_STYLES = {
    green: {
        border: 'rgba(58, 196, 92, 0.5)',
        glows: [
            { color: '#143B1D', left: '82.6%', top: '43%', width: '29%', height: '50%' },
            { color: '#064306', left: '75.8%', top: '92%', width: '32%', height: '41%' },
            { color: '#1D500C', left: '60.6%', top: '47%', width: '26%', height: '42%' },
        ],
    },
    red: {
        border: '#EB4337',
        glows: [
            { color: '#740000', left: '82.6%', top: '43%', width: '29%', height: '50%' },
            { color: '#740000', left: '75.8%', top: '92%', width: '32%', height: '41%' },
            { color: '#740000', left: '60.6%', top: '47%', width: '26%', height: '42%' },
        ],
    },
} as const;

export const FUND_MODAL_LIST_TABS: Record<string, string> = {
    STOCK_FUND: 'Quỹ cổ phiếu',
    BOND_FUND: 'Quỹ trái phiếu',
    BALANCE_FUND: 'Quỹ cân bằng',
};

export const INVESTMENT_PERFORMANCE_PERIOD: Record<string, string> = {
    YTD: 'Từ đầu năm',
    '1Y': '1 năm',
    '5Y': '5 năm',
    '10Y': '10 năm',
};

export const MARKET_MACRO: Record<string, string> = {
    tab_vn: 'Việt Nam',
    tab_us: 'Mỹ',
    section_production: 'Sản xuất & xuất khẩu',
    section_retail: 'Bán lẻ & tiêu dùng',
    section_us_inflation: 'Tiêu dùng & việc làm',
    iip: 'IIP (YoY)',
    pmi: 'PMI',
    export_title: 'Xuất khẩu (YoY)',
    export_domestic: 'Nội địa',
    export_fdi: 'FDI',
    export_total: 'Cả nước',
    service_retail: 'Dịch vụ (YoY)',
    goods_retail: 'Hàng hoá (YoY)',
    cpi: 'Lạm phát (YoY)',
    consumption: 'Lạm phát (YoY)',
    pce: 'PCE',
    core_pce: 'PCE lõi',
    nfp: 'Việc làm (NFP)',
    nfp_suffix: 'nghìn',
    unemployment: 'Tỷ lệ thất nghiệp',
};
