export type StockPrice = {
    symbol: string;
    price: number;
    close: number;
    ceiling: number;
    volume: number;
    change: number | null;
    floor: number;
    reference: number;
    average: number;
    high: number;
    low: number;
    open: number;
    totalVolume: number;
    totalValue: number;
    foreignBought: number;
    foreignSold: number;
    foreignRemain: number;
    remainBid: number | null;
    remainAsk: number | null;
    buyPrice1: number;
    buyPrice2: number;
    buyPrice3: number;
    sellPrice1: number;
    sellPrice2: number;
    sellPrice3: number;
    buyVol1: number;
    buyVol2: number;
    buyVol3: number;
    sellVol1: number;
    sellVol2: number;
    sellVol3: number;
    changePercent: number | null;
    stockType: string;
    exchange: string;
    name: string;
    createdAt: number;
    hasNewestNews: boolean;
    stockSummary: string;
    companyType: string;
    symbolStatus: string | null;
    symbolStatusCode: string;
    floorCode: string;
    listedShare: number;
    pe: number;
    pb: number;
    roe: number;
    influenceScore: number;
    marketCap: number;
    marketCapCategory: string;
};

export type StocksInfoV2AdditionalInfo = {
    symbol: string;
    url: string;
    isinCode: string;
    stockName: string;
    stockType: string;
    stockExchange: string;
    address: string;
    status: string;
    securityName: string;
    securityCode: string;
    securityType: string;
    faceValue: string;
    certificateOfRegistrationWithVSDC: string;
    totalRegisteredSecurities: string;
    locationManagedAtVSDC: string;
};

export type StocksInfoV2Item = {
    symbol: string;
    name: string;
    exchange: string;
    stockType: string;
    floor: number;
    ceiling: number;
    reference: number;
    price: number;
    priceChange: number | null;
    priceChangePercent: number | null;
    changePercent: number | null;
    volume: number;
    total_volume: number;
    additionalInfo: StocksInfoV2AdditionalInfo;
    createdAt: number;
};

export type StocksInfoV2Response = {
    error_code: string;
    message: string;
    result: StocksInfoV2Item[];
};

export type StockInfoV4Response = {
    error_code: string;
    message: string;
    result: StocksInfoItem[];
};

export type StocksInfoItem = {
    symbol: string;
    name: string;
    exchange: string;
    stock_type: string;
    floor: number;
    floorCode: string;
    ceiling: number;
    reference: number;
    price: number;
    price_change: number;
    price_change_percent: number;
    volume: number;
    total_volume: number;
    buyPrice1: number;
    buyPrice2: number;
    buyPrice3: number;
    buyVol1: number;
    buyVol2: number;
    buyVol3: number;
    sellPrice1: number;
    sellPrice2: number;
    sellPrice3: number;
    sellVol1: number;
    sellVol2: number;
    sellVol3: number;
    highPrice: number;
    lowPrice: number;
    mediumPrice: number;
    totalValue: number;
    foreignBought: number;
    foreignSold: number;
    foreignRemain: number;
    remainAsk: number;
    remainBid: number;
    pe: number;
    pb: number;
    roe: number;
    companyType: string;
    stockSummary: string;
};

export type StocksInfoResponse = {
    error_code: string;
    message: string;
    result: StocksInfoItem[];
};

export type StocksInfoV3Item = {
    symbol: string;
    name: string;
    exchange: string;
    stockType: string;
    price: number;
    price_change: number;
    price_change_percent: number;
    floor: number;
    ceiling: number;
    reference: number;
};

export type StocksInfoV3Response = {
    error_code: string;
    message: string;
    result: StocksInfoV3Item[];
};

export type StockRealtimeResponse = {
    error_code: string;
    message: string;
    result: StockPrice;
};

export type StockChartLinePoint = {
    time: number;
    price: number;
};

export type StockChartLineResponse = {
    error_code: string;
    message: string;
    data: {
        chartLineVolatility: StockChartLinePoint[];
    };
};

export type PriceHistoriesChartData = {
    time: number[];
    open: number[];
    close: number[];
    high: number[];
    low: number[];
    volume: number[];
    symbol: string;
    resolution: string;
};

export type PriceHistoriesChartResponse = {
    error_code: string;
    message: string;
    data: PriceHistoriesChartData;
    traceId: string;
};

export type TransactionLogItem = {
    type: string;
    symbol: string;
    trading_date: string;
    time: string;
    match_price: number;
    match_volume: number;
    accumulated_volume: number;
    accumulated_value: number;
    change_value: number;
    sequence: number;
    total_buy_volume: number;
    total_sell_volume: number;
    side: string;
};

export type TradingHistoryStat = {
    volume: number;
    value: number;
};

export type TradingHistoryBreakdown = {
    total: TradingHistoryStat;
    matched: TradingHistoryStat | null;
    put_through: TradingHistoryStat | null;
};

export type TradingHistoryItem = {
    date: string;
    buy: TradingHistoryBreakdown;
    sell: TradingHistoryBreakdown;
    net: TradingHistoryBreakdown;
};

export type TradingHistoryData = {
    symbol: string;
    resolution: string;
    data: TradingHistoryItem[];
};

export type TradingHistoryResponse = {
    error_code: string;
    message: string;
    data: TradingHistoryData;
    traceId: string;
};

export type TransactionLogResponse = {
    error_code: string;
    message: string;
    data: {
        content: TransactionLogItem[];
        has_next: boolean;
        total_element: number;
        size: number;
    };
};

export type StockProfileSector = {
    slug: string;
    name: string;
    level: number;
};

export type StockProfileData = {
    symbol: string;
    name_vn: string;
    name_en: string;
    sector: StockProfileSector[];
    about: string;
};

export type StockProfileResponse = {
    error_code: string;
    message: string;
    data: StockProfileData;
    traceId: string;
};

export type StockListingData = {
    symbol: string;
    exchange: string;
    listing_date: string;
    listing_reference_price: number;
    listed_shares: number;
    outstanding_shares: number;
    treasury_shares: number;
    free_float: number;
    free_float_pct: number;
};

export type StockListingResponse = {
    error_code: string;
    message: string;
    data: StockListingData;
    traceId: string;
};

export type StockOwnershipShareholderType =
    | 'foreign'
    | 'insider'
    | 'individual'
    | 'local_institution';

export type StockOwnershipStructureItem = {
    volume: number;
    pct: number;
};

export type StockOwnershipStructure = {
    state: StockOwnershipStructureItem;
    foreign: StockOwnershipStructureItem;
    other: StockOwnershipStructureItem;
};

export type StockMajorShareholder = {
    name: string;
    type: StockOwnershipShareholderType;
    volume: number;
    pct: number;
    updated_at: string;
};

export type StockForeignRoom = {
    max_pct: number;
    max_volume: number;
    available: number;
};

export type StockOwnershipData = {
    symbol: string;
    structure: StockOwnershipStructure;
    major_shareholders: StockMajorShareholder[];
    foreign_room: StockForeignRoom;
};

export type StockOwnershipResponse = {
    error_code: string;
    message: string;
    data: StockOwnershipData;
    traceId: string;
};

export type StockScreenerParams = {
    exchange?: string;
    index?: string;
    sector?: string;
    sort?: string;
    window?: string;
    field?: string;
    page?: number;
    page_size?: number;
    foreign_net_value_gt?: number;
    foreign_net_value_lt?: number;
    proprietary_net_value_gt?: number;
    proprietary_net_value_lt?: number;
};

export type StockScreenerItem = {
    symbol: string;
    exchange: string;
    name: string;
    price: number;
    change_percent: number | null;
    market_cap: number;
    foreign_net_value?: number;
    proprietary_net_value?: number;
};

export type StockScreenerData = {
    window: string;
    date: string | null;
    sort: string;
    updated_at: string;
    page: number;
    page_size: number;
    total: number;
    items: StockScreenerItem[];
};

export type StockScreenerResponse = {
    error_code: string;
    message: string;
    data: StockScreenerData;
    traceId: string;
};
