export type FundType = 'STOCK_FUND' | 'BOND_FUND' | 'BALANCE_FUND';

export type FundUniverseTab = 'short_term' | 'long_term' | 'investor' | 'fund_flow' | 'aum';

export type FundListTab = FundType;

export type FundPlanetValueKind = 'percent' | 'money';

export type FundPlanetItem = {
    fundName: string;
    imageUrl: string;
    value: number | null;
    valueKind: FundPlanetValueKind;
};

export type FundMarketSummary = {
    month: number | null;
    fundsBeatingVnIndex: number | null;
    netFundFlow: number | null;
    aumChangePercent: number | null;
};

export type FundMarketSummaryData = {
    funds_beating_vn_index?: number | null;
    net_fund_flow?: number | null;
    aum_change_percent?: number | null;
    month?: number | null;
};

export type FundMarketSummaryResponse = {
    error_code: string;
    message: string;
    data: FundMarketSummaryData;
};

export type FundTableColMeta = {
    align?: 'left' | 'right';
    thClass?: string;
    tdClass?: string;
    widthClass?: string;
};

export type FundTopGrowthSortBy = 'INVESTOR' | 'AUM';

export type FundDetailTab = 'info' | 'fee';

export type FundNavChartPeriod =
    | 'ONE_MONTH'
    | 'THREE_MONTHS'
    | 'SIX_MONTHS'
    | 'ONE_YEAR'
    | 'FIVE_YEARS';

export type FundCompareWinner = 'left' | 'right' | 'none';

export type FundCompareRow = {
    key: string;
    label: string;
    leftValue: string;
    rightValue: string;
    leftColorClass: string;
    rightColorClass: string;
    winner: FundCompareWinner;
    showTrendIcon?: boolean;
    valueSuffix?: string;
};

export type FundFeeType = 'BUY' | 'SELL';

export type FundFeeUnit = 'DAY' | 'MONTH' | 'YEAR';

export type FundFeeItem = {
    key: string | number;
    label: string;
    value: string;
};

export type FundAverageProfit = {
    period: string;
    fund_name?: string;
    average_percent_profit: number | null;
};

export type FundNavHistoryItem = {
    date: string;
    navpf: number;
};

export type FundMonthlyStats = {
    aum_change_percent?: number | null;
    investor_change_percent?: number | null;
    net_inflow?: number | null;
    year?: number | null;
    month?: number | null;
};

export type FundFee = {
    id?: number | null;
    type: FundFeeType;
    start_value?: number | null;
    end_value?: number | null;
    percent?: number | null;
    unit?: FundFeeUnit | null;
};

export type FundTransferFeeDetail = {
    title?: string | null;
    data?: Array<{ key?: string | null; value?: string | null }> | null;
};

export type FundCertificateItem = {
    id: number;
    name: string;
    fund_company_management_short_name: string;
    image_url: string;
    type: string;
    aum: number;
    nav_histories: FundNavHistoryItem[];
    average_profits: FundAverageProfit[];
};

export type FundCertificateDetail = FundCertificateItem & {
    brief_description?: string | null;
    en_brief_description?: string | null;
    fund_company_management_name?: string | null;
    monthly_stats?: FundMonthlyStats | null;
    trading_schedule?: string | null;
    matching_session?: string | null;
    active_session?: string | null;
    min_buy_value?: number | null;
    min_sell_value?: number | null;
    min_hold_value?: number | null;
    time_received_cash_day?: number | null;
    fees?: FundFee[] | null;
    tax?: number | null;
    transfer_fee_detail?: FundTransferFeeDetail | null;
};

export type FundNavHistories = {
    nav_histories: FundNavHistoryItem[];
};

export type FundTopGrowthItem = {
    fund_name: string;
    growth_percent: number | null;
};

export type FundTopFundFlowItem = {
    fund_name: string;
    fund_flow: number | null;
};

export type FundSuggestionItem = {
    fund_name: string;
};

export type FundListingDocument = {
    document_url?: string | null;
    last_updated_at?: string | null;
    name?: string | null;
};

export type FundListing = {
    target?: string | null;
    strategy?: string | null;
    method_invest?: string | null;
    allocate?: string | null;
    risk?: string | null;
    division_plan?: string | null;
    document_url?: string | null;
    documents?: FundListingDocument[] | null;
};

export type FundCertificatesResponse = {
    error_code: string;
    message: string;
    data: FundCertificateItem[];
};

export type FundCertificateDetailResponse = {
    error_code: string;
    message: string;
    result: FundCertificateDetail;
};

export type FundNavHistoriesResponse = {
    error_code: string;
    message: string;
    result: FundNavHistories;
};

export type FundTopGrowthResponse = {
    error_code: string;
    message: string;
    data: FundTopGrowthItem[];
};

export type FundTopFundFlowResponse = {
    error_code: string;
    message: string;
    data: FundTopFundFlowItem[];
};

export type FundSuggestionsResponse = {
    error_code: string;
    message: string;
    data: FundSuggestionItem[];
};

export type FundListingResponse = {
    error_code: string;
    message: string;
    data: FundListing;
};

export type ImportSource = 'file' | 'manual';

export type FundNavLabelKey = 'tong_quan' | 'khach_hang' | 'danh_muc' | 'import';
export type FundTab = 'dashboard' | 'clients' | 'portfolio' | 'import';

export type FundStepState = 'idle' | 'active' | 'done';

export type FundSelectOption = { value: string; label: string };

export type FundOwnerRow = {
    ma_ndt: string;
    ho_ten: string;
    sector: string;
    pct: number;
    khoi_luong: number;
};

export type FundStockDetailMetricProps = {
    label: string;
    value: string;
    valueClassName?: string;
};

export type FundInvestorSortKey = 'nav' | 'cap' | 'pnl' | 'ret';
export type FundTopInvestorsSortKey = 'nav' | 'cap' | 'pnl' | 'ret';

export type FundInvestorThesisRow = { sector: string; pct: string };

export type FundInvestorUploadFormValues = {
    ma_ndt: string;
    ho_ten: string;
    so_dien_thoai: string;
    ngay_uy_thac: string;
    rm_phu_trach: string;
    rm_id: string;
    von_uy_thac_vnd: string;
    trang_thai: 'active' | 'watch';
};

export type FundImportTab = 'trade' | 'investor';

export type FundTradePreviewColKey =
    | 'ma_gd'
    | 'ma_ndt'
    | 'loai_lenh'
    | 'ma_ck'
    | 'khoi_luong'
    | 'gia_khop'
    | 'tong_tien';

export type FundTradePreviewCol = {
    key: FundTradePreviewColKey;
    label: string;
    align: 'left' | 'right';
};

export type FundInvestorPreviewColKey =
    | 'ma_ndt'
    | 'ho_ten'
    | 'so_dien_thoai'
    | 'rm_phu_trach'
    | 'von_uy_thac_vnd'
    | 'trang_thai'
    | 'thesis'
    | '_action';

export type FundInvestorPreviewCol = {
    key: FundInvestorPreviewColKey;
    label: string;
    align: 'left' | 'right' | 'center';
};

export type VaultStatus = 'loading' | 'uninitialized' | 'locked' | 'unlocked';

export type VaultErrorCode =
    | 'wrong_passphrase'
    | 'missing_secret_key'
    | 'invalid_secret_key'
    | 'weak_passphrase'
    | 'recovery_failed'
    | 'not_initialized'
    | 'unknown';
