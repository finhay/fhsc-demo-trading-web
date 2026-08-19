import { stockInfo as viStockInfo } from '@/language/vi/stock-info';
import type {
    AnalysisRow,
    CompanyType,
    FinancialStatementData,
    ProfitRow,
    ReportTab,
    SecuritiesGrowthRow,
    TradeReportDividerVariant,
    TradeReportMetricStyle,
    TradeReportSchemaRow,
} from '@/types/pages/stock-info';

export const BILLION = 1000000000;

export const CHART_LINE_COLORS = {
    blue: '#2994ff',
    orange: '#e98e00',
    gray: '#999999',
    grayLight: '#9ca3af',
    green: '#3ac45c',
    red: '#ef4444',
    redSoft: '#f0616d',
} as const;

export const STOCK_INFO_SECTION_ARIA = {
    CHART: 'Biểu đồ',
} as const;

export const TRADING_BAR_CHART = {
    DATES_COUNT: 5,
    MIN_MAX: 400,
} as const;

export const STATUS_COLORS = {
    positive: '#3ac45c',
    negative: '#eb4337',
} as const;

export const CHART_GRADIENTS = {
    positive: 'linear-gradient(90deg, #18311f 0%, #171719 100%)',
    negative: 'linear-gradient(90deg, #461c19 0%, #171719 100%)',
    neutral: 'linear-gradient(to right, #28292b 0%, #171719 100%)',
} as const;

export const PLAN = {
    threshold: 80,
    itemDefs: [
        { labelKey: 'revenue', key: 'tyle_hoanthanh_dt' },
        { labelKey: 'lnst', key: 'tyle_hoanthanh_lnst' },
    ] as { labelKey: string; key: string }[],
} as const;

export const VALUATION_ITEMS: {
    labelKey: string;
    subLabelKey?: string;
    subValueField?: string;
    field: string;
    valueColor: string;
    alwaysShow: boolean;
}[] = [
    {
        labelKey: 'pe',
        subLabelKey: 'valuation_badge_eps',
        subValueField: 'eps',
        field: 'pe',
        valueColor: 'text-orange',
        alwaysShow: true,
    },
    {
        labelKey: 'pb',
        subLabelKey: 'valuation_badge_bvps',
        subValueField: 'bvps',
        field: 'pb',
        valueColor: 'text-orange',
        alwaysShow: true,
    },
    {
        labelKey: 'ev_ebitda',
        field: 'ev_ebitda',
        valueColor: 'text-red',
        alwaysShow: false,
    },
];

export const PROFITABILITY = {
    threshold: 1,
    items: [
        { labelKey: 'roe', key: 'roe' },
        { labelKey: 'roic', key: 'roic' },
        { labelKey: 'roa', key: 'roa' },
    ] as { labelKey: string; key: string }[],
} as const;

export const PROFITABILITY_SERIES_COLORS: { dotColor: string; lineColor: string }[] = [
    { dotColor: 'bg-blue', lineColor: CHART_LINE_COLORS.blue },
    { dotColor: 'bg-orange', lineColor: CHART_LINE_COLORS.orange },
    { dotColor: 'bg-gray', lineColor: CHART_LINE_COLORS.gray },
];

export const BANK_EFFICIENCY_PANELS: AnalysisRow[] = [
    { id: 'nim', labelKey: 'nim', field: 'nim' },
    { id: 'cir', labelKey: 'cir', field: 'cir' },
];

export const BANK_GROWTH_ROWS: AnalysisRow[] = [
    { id: 'tin_dung', labelKey: 'credit', field: 'tt_tindung_yoy' },
    { id: 'huy_dong', labelKey: 'mobilization', field: 'tt_huydong_yoy' },
    { id: 'thu_nhap_lai_thuan', labelKey: 'net_interest_income', field: 'tt_thunhaplaithuan_yoy' },
    {
        id: 'tong_thu_nhap_hd',
        labelKey: 'total_operating_income',
        field: 'tt_tongthunhaphoatdong_yoy',
    },
    {
        id: 'ln_truoc_du_phong',
        labelKey: 'profit_before_provision',
        field: 'tt_lntruocduphong_yoy',
    },
    { id: 'chi_phi_du_phong', labelKey: 'provision_expense', field: 'tt_chiphiduphong_yoy' },
    { id: 'lnst', labelKey: 'lnst', field: 'lnst_yoy' },
];

export const BANK_LIQUIDITY_METRICS: { labelKey: string; field: string }[] = [
    { labelKey: 'car', field: 'tm_hesocar' },
    { labelKey: 'ldr', field: 'ldr' },
    { labelKey: 'reserve_ratio', field: 'tile_dutru' },
];

export const BANK_QUALITY_SPARK_ROWS: AnalysisRow[] = [
    { id: 'npl', labelKey: 'npl_pct', field: 'tyle_noxau' },
    { id: 'llr', labelKey: 'llr_pct', field: 'tyle_baonoxau' },
    { id: 'no_nhom2', labelKey: 'group2_debt', field: 'tile_nonhom2' },
];

export const INSURANCE_EFFECTIVENESS = {
    rows: [
        {
            id: 'tong_chi_boi_thuong',
            labelKey: 'total_compensation_expense',
            field: 'tt_tongchiboithuongvatratienbaohiem_yoy',
        },
        {
            id: 'chi_boi_thuong_bh_goc',
            labelKey: 'primary_compensation_expense',
            field: 'tt_chiboithuongbaohiemgoc_yoy',
        },
        {
            id: 'chi_truc_tiep_hd_bh',
            labelKey: 'direct_insurance_expense',
            field: 'tt_tongchitructiephdkdbaohiem_yoy',
        },
    ] as AnalysisRow[],
    breakdownFields: {
        nhanTho: 'tlbt_bhnt',
        phiNhanTho: 'tlbt_bhpnt',
        xeCoGioi: 'tlbt_bhxecogioi',
        sucKhoe: 'tlbt_bhsk',
    },
} as const;

export const INSURANCE_GROWTH_ITEMS: {
    labelKey: string;
    key: string;
    dotColor: string;
    lineColor: string;
}[] = [
    {
        labelKey: 'net_insurance_revenue',
        key: 'tt_doanhthuphibaohiemthuan_yoy',
        dotColor: 'bg-blue',
        lineColor: CHART_LINE_COLORS.blue,
    },
    {
        labelKey: 'primary_insurance_premium',
        key: 'tt_phibaohiemgoc_yoy',
        dotColor: 'bg-orange',
        lineColor: CHART_LINE_COLORS.orange,
    },
    {
        labelKey: 'lnst',
        key: 'lnst_yoy',
        dotColor: 'bg-gray',
        lineColor: CHART_LINE_COLORS.gray,
    },
];

export const INSURANCE_HEALTH_ITEMS: {
    labelKey: string;
    key: string;
    textColor: string;
    bgColor: string;
}[] = [
    {
        labelKey: 'short_term',
        key: 'tile_cackhoandaututaichinhnganhan',
        textColor: 'text-blue',
        bgColor: 'bg-blue',
    },
    {
        labelKey: 'long_term',
        key: 'tile_cackhoandaututaichinhdaihan',
        textColor: 'text-orange',
        bgColor: 'bg-orange',
    },
];

export const INSURANCE_PROFIT_ROWS: ProfitRow[] = [
    {
        id: 'pct_ln_hd_tc',
        labelKey: 'pct_financial_activity_profit',
        field: 'ttln_lnhdtaichinh',
        kind: 'percent',
    },
    {
        id: 'pct_ln_hdk',
        labelKey: 'pct_main_business_profit',
        field: 'ttln_lngop',
        kind: 'percent',
    },
    { id: 'ln_gop_hdbh', labelKey: 'gross_insurance_profit', field: 'tt_lngop_yoy', kind: 'yoy' },
    {
        id: 'dt_phi_nhan_tho',
        labelKey: 'non_life_insurance_revenue',
        field: 'tt_tm_baohiemphinhantho_bh_yoy',
        kind: 'yoy',
    },
    {
        id: 'dt_nhan_tho',
        labelKey: 'life_insurance_revenue',
        field: 'tt_tm_baohiemnhantho_bh_yoy',
        kind: 'yoy',
    },
    {
        id: 'ln_hdtc',
        labelKey: 'financial_activity_profit',
        field: 'tt_lnhdtaichinh_yoy',
        kind: 'yoy',
    },
];

export const NON_FINANCIAL_CASHFLOW = {
    fields: {
        ocf: 'luuchuyentienthuantuhoatdongkinhdoanh',
        capex: 'capex',
        netCash: 'netcash',
    },
    labelKeys: {
        ocf: 'ocf',
        capex: 'capex',
        fcf: 'fcf',
        netCash: 'net_cash',
    },
} as const;

export const NON_FINANCIAL_DEBT = {
    ratioBars: [
        {
            labelKey: 'equity_short',
            field: 'vonchusohuu_tong',
            bgClass: 'bg-blue',
            textStyle: { color: '#0b2a48' },
        },
        {
            labelKey: 'short_term_debt',
            field: 'nonganhan',
            bgClass: 'bg-orange',
            textStyle: { color: '#432805' },
        },
        {
            labelKey: 'long_term_debt',
            field: 'nodaihan',
            bgStyle: { backgroundColor: CHART_LINE_COLORS.gray },
            textStyle: { color: '#171719' },
        },
    ] as {
        labelKey: string;
        field: string;
        bgClass?: string;
        bgStyle?: { backgroundColor: string };
        textStyle: { color: string };
    }[],
    stats: [
        {
            labelKey: 'net_debt_to_equity',
            field: 'novayrong_vonchu',
            suffix: '',
            textColor: 'text-primary',
        },
        {
            labelKey: 'debt_to_ebitda',
            field: 'novay_ebitda',
            suffix: 'x',
            textColor: 'text-primary',
        },
        {
            labelKey: 'ebit_to_interest',
            field: 'ebit_laivay',
            suffix: 'x',
            textColor: 'text-green',
        },
    ] as { labelKey: string; field: string; suffix: string; textColor: string }[],
    rates: [
        { labelKey: 'debt_interest_rate', field: 'ls_novay', suffix: '%' },
        { labelKey: 'cashflow_debt_coverage', field: 'dongtien_hdkd_novay', suffix: 'x' },
    ] as { labelKey: string; field: string; suffix: string }[],
} as const;

export const NON_FINANCIAL_EFFICIENCY = {
    liquidityItems: [
        {
            labelKey: 'current_ratio',
            field: 'thanhtoan_hienhanh',
            valueColor: 'text-green',
            badge: '>1',
        },
        {
            labelKey: 'quick_ratio',
            field: 'thanhtoan_nhanh',
            valueColor: 'text-orange',
            badge: '<1',
        },
    ] as { labelKey: string; field: string; valueColor: string; badge: string }[],
    turnoverItems: [
        { labelKey: 'turnover_inventory', field: 'vongquaytonkho' },
        { labelKey: 'turnover_receivables', field: 'vongquayphaithu' },
        { labelKey: 'turnover_cash', field: 'ccc' },
        { labelKey: 'turnover_assets', field: 'vongquaytaisan' },
    ] as { labelKey: string; field: string }[],
} as const;

export const NON_FINANCIAL_GROWTH = {
    tabs: ['QoQ', 'YoY'] as string[],
    tabLabelKeys: { QoQ: 'qoq', YoY: 'yoy' } as Record<string, string>,
    tabConfig: {
        QoQ: {
            keys: { dtt: 'dtt_qoq', ebit: 'ebit_qoq', lnst: 'lnst_qoq' },
            getLabel: (d: any) => `Q${d?.quarter}/${d?.year}`,
        },
        YoY: {
            keys: { dtt: 'tt_dtt_yoy', ebit: 'tt_ebit_yoy', lnst: 'lnst_yoy' },
            getLabel: (d: any) => `${d?.year}`,
        },
    } as Record<
        string,
        {
            keys: { dtt: string; ebit: string; lnst: string };
            getLabel: (d: any) => string;
        }
    >,
    itemsBase: [
        { labelKey: 'net_revenue_short', dotColor: 'bg-blue', lineColor: CHART_LINE_COLORS.blue },
        { labelKey: 'ebit', dotColor: 'bg-orange', lineColor: CHART_LINE_COLORS.orange },
        { labelKey: 'lnst', dotColor: 'bg-gray', lineColor: CHART_LINE_COLORS.gray },
    ] as { labelKey: string; dotColor: string; lineColor: string }[],
} as const;

export const NET_REVENUE_FIELD = 'doanhthuthuanvebanhangvacungcapdichvu';

export const NON_FINANCIAL_MARGIN_ITEMS: {
    labelKey: string;
    field: string;
    color: string;
    textColor: string;
}[] = [
    {
        labelKey: 'gross_margin_short',
        field: 'bienlaigop',
        color: 'bg-orange',
        textColor: 'text-orange',
    },
    { labelKey: 'ebit_margin', field: 'bienlaiebit', color: 'bg-orange', textColor: 'text-orange' },
    {
        labelKey: 'net_margin',
        field: 'bienlaisauthue',
        color: 'bg-gray',
        textColor: 'text-secondary',
    },
];

export const SECURITIES_GROWTH = {
    tabs: ['% YoY', 'Số'] as string[],
    tabLabelKeys: { '% YoY': 'yoy_pct', Số: 'absolute_short' } as Record<string, string>,
    tongQuanRows: [
        {
            id: 'doanh_thu',
            labelKeyYoY: 'revenue',
            labelKeySo: 'revenue',
            yoyField: 'doanhthu_yoy',
            soField: 'doanhthu',
        },
        {
            id: 'ln_hoat_dong',
            labelKeyYoY: 'operating_profit',
            labelKeySo: 'operating_profit',
            yoyField: 'loinhuanhoatdong_yoy',
            soField: 'loinhuanhoatdong',
        },
        {
            id: 'chi_phi_hoat_dong',
            labelKeyYoY: 'operating_expense',
            labelKeySo: 'operating_expense',
            yoyField: 'chiphihoatdong_yoy',
            soField: 'chiphihoatdong',
        },
    ] as SecuritiesGrowthRow[],
    coCauRows: [
        {
            id: 'ln_moi_gioi',
            labelKeyYoY: 'brokerage_profit',
            labelKeySo: 'brokerage_profit',
            yoyField: 'laimoigioi_yoy',
            soField: 'laimoigioi',
        },
        {
            id: 'ln_td_kd',
            labelKeyYoY: 'self_trading_capital_profit',
            labelKeySo: 'self_trading_capital_margin_profit',
            yoyField: 'laitudoanhnguonvonchovaykyquy_yoy',
            soField: 'laitudoanhnguonvonchovaykyquy',
        },
        {
            id: 'ln_cho_vay',
            labelKeyYoY: 'margin_lending_profit',
            labelKeySo: 'self_trading_capital_revenue',
            yoyField: 'tm_chovaynghiepvukyquymargin_yoy',
            soField: 'tile_tudoanhnguonvon',
            soUnit: 'tỷ',
        },
        {
            id: 'ln_ngan_hang_dt',
            labelKeyYoY: 'investment_banking_profit',
            labelKeySo: 'investment_banking_revenue',
            yoyField: 'lainganhangdt_yoy',
            soField: 'lainganhangdt',
        },
    ] as SecuritiesGrowthRow[],
} as const;
export const MIN_CHART_PIE_PERCENTAGE = 0.5;

export const FINANCE_OVERVIEW_BAR_GRADIENT_CLASS = 'bg-gradient-to-r from-red via-yellow to-green';
export const FINANCE_OVERVIEW_EMPTY_VALUE = '—';

export const COMPANY_TYPE = {
    BANK: 'BANK',
    INSURANCE: 'INSURANCE',
    SECURITIES: 'SECURITIES',
    NON_FINANCIAL: 'NON_FINANCIAL',
} as const;

export const FINANCE_TAB = {
    ANALYSIS: 'ANALYSIS',
    REPORT: 'REPORT',
} as const;

export const STATISTICS_TAB = {
    PRICE_HISTORY: 'price-history',
    FOREIGN: 'foreign',
    PROPRIETARY: 'proprietary',
} as const;

export const STATISTICS_TABS: {
    key: (typeof STATISTICS_TAB)[keyof typeof STATISTICS_TAB];
    labelKey: 'tab_price_history' | 'tab_foreign' | 'tab_proprietary';
}[] = [
    { key: STATISTICS_TAB.PRICE_HISTORY, labelKey: 'tab_price_history' },
    { key: STATISTICS_TAB.FOREIGN, labelKey: 'tab_foreign' },
    { key: STATISTICS_TAB.PROPRIETARY, labelKey: 'tab_proprietary' },
];

export const FINANCIAL_STATEMENT_TYPE = {
    INCOME_STATEMENT: 'income-statement',
    BALANCE_SHEET: 'balance-sheet',
    CASH_FLOW: 'cash-flow',
} as const;

export const FINANCIAL_REPORT_TABS: {
    key: (typeof FINANCIAL_STATEMENT_TYPE)[keyof typeof FINANCIAL_STATEMENT_TYPE];
    labelKey: 'tab_income' | 'tab_balance' | 'tab_cashflow';
}[] = [
    { key: FINANCIAL_STATEMENT_TYPE.INCOME_STATEMENT, labelKey: 'tab_income' },
    { key: FINANCIAL_STATEMENT_TYPE.BALANCE_SHEET, labelKey: 'tab_balance' },
    { key: FINANCIAL_STATEMENT_TYPE.CASH_FLOW, labelKey: 'tab_cashflow' },
];

export const EMPTY_FINANCIAL_STATEMENT_DATA: FinancialStatementData = {
    [FINANCIAL_STATEMENT_TYPE.INCOME_STATEMENT]: [],
    [FINANCIAL_STATEMENT_TYPE.BALANCE_SHEET]: [],
    [FINANCIAL_STATEMENT_TYPE.CASH_FLOW]: [],
};

export const ANALYSIS_CONTENT_CARD =
    'flex min-h-0 flex-1 flex-col gap-3 rounded-xl border border-quaternary p-3';

export const ANALYSIS_CHART_BOX = 'relative h-44 w-full shrink-0';

export const ANALYSIS_CHART_FILL = 'relative h-44 w-full min-h-44 flex-1';

export const ANALYSIS_CHART_CANVAS = 'absolute inset-0 min-w-0';

export const TRADE_REPORT_DIVIDER_CLASS_MAP: Record<TradeReportDividerVariant, string> = {
    base: 'bg-tertiary h-px p-0',
    textTertiary: 'bg-tertiary h-px p-0 opacity-50',
    green: 'bg-green h-px p-0',
};

export const TRADE_REPORT_METRIC_STYLE_CLASS_MAP: Record<TradeReportMetricStyle, string> = {
    sectionTitle: 'font-body-3-highlight text-secondary',
    header: 'font-caption-highlight text-primary',
    sub: 'pl-4 font-caption text-secondary',
    negativeDesc1: 'pl-4 font-caption text-secondary',
    negativeDesc2: 'pl-8 font-caption text-secondary',
};
const section = (label: string): TradeReportSchemaRow => ({ kind: 'section', label });
const dividerSoft = (): TradeReportSchemaRow => ({ kind: 'divider', variant: 'textTertiary' });
const dividerGreen = (): TradeReportSchemaRow => ({ kind: 'divider', variant: 'green' });
const data = (metricKey: string, style: TradeReportMetricStyle): TradeReportSchemaRow => ({
    kind: 'data',
    metricKey,
    style,
});

type UiLabelOverrideMap = Partial<
    Record<CompanyType, Partial<Record<ReportTab, Record<string, string>>>>
>;

export const UI_LABEL_OVERRIDES: UiLabelOverrideMap = {
    [COMPANY_TYPE.NON_FINANCIAL]: {
        [FINANCIAL_STATEMENT_TYPE.INCOME_STATEMENT]: {
            doanhthubanhangvacungcapdichvu: 'Tổng doanh thu',
            cackhoangiamtrudoanhthu: 'Khoản giảm trừ',
            doanhthuthuanvebanhangvacungcapdichvu: 'Doanh thu thuần',
            loinhuangopvebanhangvacungcapdichvu: 'Lợi nhuận gộp',
            doanhthuhoatdongtaichinh: 'DT hoạt động tài chính',
            chiphitaichinh: 'CP tài chính',
            trongdochiphilaivay: 'Trong đó: CP lãi vay',
            phanlailohoaclotrongcongtyliendoanhlienket: 'Lãi/lỗ công ty LD, LK',
            chiphibanhang: 'CP bán hàng',
            chiphiquanlydoanhnghiep: 'CP quản lý DN',
            loinhuanthuantuhoatdongkinhdoanh: 'Lợi nhuận thuần từ HĐKD',
            tongloinhuanketoantruocthue: 'Tổng LN KT trước thuế',
            chiphithuetndnhienhanh: 'CP thuế TNDN HH',
            chiphithuetndnhoanlai: 'CP thuế TNDN HL',
            loinhuansauthuethunhapdoanhnghiep: 'Lợi nhuận sau thuế',
            loiichcuacodongthieuso_bctn: 'LNST cổ đông thiểu số',
            loinhuansauthuecuacongtyme: 'LNST công ty mẹ',
            laicobantrencophieu: 'Lãi cơ bản trên CP',
            laisuygiamtrencophieu: 'Lãi suy giảm trên CP',
        },
        [FINANCIAL_STATEMENT_TYPE.BALANCE_SHEET]: {
            tienvacackhoantuongduongtien: 'Tiền & TĐT tiền',
            cackhoandaututaichinhnganhan: 'Đầu tư TC ngắn hạn',
            cackhoanphaithunganhan: 'Phải thu ngắn hạn',
            hangtonkho_tong: 'Hàng tồn kho',
            taisannganhankhac_tong: 'TS ngắn hạn khác',
            cackhoanphaithudaihan: 'Phải thu dài hạn',
            taisancodinh: 'TS cố định',
            batdongsandautu: 'BĐS đầu tư',
            taisandodangdaihan: 'TS dở dang dài hạn',
            daututaichinhdaihan: 'Đầu tư TC dài hạn',
            taisandaihankhac_tong: 'TS dài hạn khác',
            tongcongtaisan: 'Tổng tài sản',
            nguonkinhphivacacquykhac: 'Kinh phí & quỹ khác',
            tongcongnguonvon: 'Tổng nguồn vốn',
        },
        [FINANCIAL_STATEMENT_TYPE.CASH_FLOW]: {
            lailochenhlechtygiahoidoaichuathuchien: 'Lãi/lỗ CL tỷ giá hối đoái',
            lailotuhoatdongdaututhanhlytaisancodinh: 'Lãi/lỗ thanh lý/xoá sổ TSCĐ',
            cackhoangiamtrukhac: 'Khoản điều chỉnh khác',
            thunhaptulaitiengui: 'Thu nhập từ lãi CT',
            phanboloithethuongmai: 'Phân bổ lợi thế TM',
            loinhuanlotuhoatdongkinhdoanhtruocthaydoivonluudong: 'Lợi nhuận HĐKD trước TĐ VLĐ',
            tanggiamcackhoanphaithu: 'Tăng giảm phải thu',
            tanggiamchungkhoantudoanh: 'Tăng giảm CK tự doanh',
            tanggiamhangtonkho: 'Tăng giảm hàng tồn kho',
            tanggiamcackhoanphaitrakhonggomlaivaythuetndnphaitra: 'Tăng giảm phải trả',
            tienthukhactuhoatdongkinhdoanh: 'Tiền thu khác từ HĐKD',
            tienchikhacchohoatdongkinhdoanh: 'Tiền chi khác cho HĐKD',
            luuchuyentienthuantuhoatdongkinhdoanh: 'LC thuần từ HĐKD',
            tienchidemuasamxaydungtaisancodinh: 'Mua sắm TSCĐ',
            tienthudothanhlynhuongbantscdvacactaisandaihankhac: 'Thu thanh lý TSCĐ',
            tienchichovaymuacaccongcunocuadonvikhac: 'Cho vay, mua các công cụ nợ',
            tienthuhoichovaybanlaicongcunocuadonvikhac: 'Thu hồi cho vay, bán lại CK nợ',
            tienchidautugopvonvaodonvikhac: 'Tiền ĐT góp vốn',
            tienthudobancackhoandautugopvonvaodonvikhac: 'Tiền thu hồi ĐT góp vốn',
            tienthulaichovaycotucvaloinhuanduocchia: 'Lãi cho vay, CTC và LN được chia',
            tienthu_chikhactuhddt: 'Tiền thu chi khác từ hoạt động đầu tư',
            luuchuyentienthuantuhoatdongdautu: 'LC thuần từ HĐĐT',
            luuchuyentienthuantusudungvaohoatdongtaichinh: 'LC thuần từ HĐTC',
            luuchuyentienthuantrongnam: 'LC thuần trong kỳ',
            tienvatuongduongtiendaunam: 'Tiền & TĐT đầu kỳ',
            tienvatuongduongtiencuoinam: 'Tiền & TĐT cuối kỳ',
        },
    },
    [COMPANY_TYPE.BANK]: {
        [FINANCIAL_STATEMENT_TYPE.INCOME_STATEMENT]: {
            chiphilaivacacchiphituongtu: 'CP lãi & các CP tương tự',
            thunhaptuhoatdongdichvu: 'Thu nhập từ HĐ dịch vụ',
            chiphihoatdongdichvu: 'CP HĐ dịch vụ',
            laithuantuhoatdongdichvu: 'Lãi thuần từ HĐ dịch vụ',
            thunhaptuhoatdongkhac: 'Thu nhập từ HĐ khác',
            chiphihoatdongkhac: 'CP HĐ khác',
            lailothuantuhoatdongkhac: 'Lãi/lỗ thuần từ HĐ khác',
            tongthunhaphoatdong: 'Tổng thu nhập hoạt động',
            chiphihoatdong: 'CP hoạt động',
            loinhuanthuantuhdkdtruocchiphiduphongruirotindung:
                'LN thuần từ HĐKD trước chi phí DPRRTD',
            chiphiduphongruirotindung: 'CP dự phòng rủi ro TD',
            chiphithuetndnhienhanh: 'CP thuế TNDN HH',
            chiphithuetndnhoanlai: 'CP thuế TNDN HL',
            loinhuansauthue: 'Lợi nhuận sau thuế',
            codongcuacongtyme: 'LNST Ngân hàng mẹ',
        },
    },
    [COMPANY_TYPE.SECURITIES]: {
        [FINANCIAL_STATEMENT_TYPE.INCOME_STATEMENT]: {
            doanhthuhoatdongmoigioick: 'Doanh thu hoạt động môi giới CK',
            doanhthubaolanhdailyphathanhck: 'Doanh thu bảo lãnh, đại lý phát hành CK',
            doanhthutuvandautuck: 'Doanh thu tư vấn ĐT CK',
            doanhthuhoatdongkhac: 'Doanh thu HĐ khác',
            doanhthuhoatdong: 'Tổng doanh thu HĐ',
            cphoatdongmoigioick: 'CP hoạt động môi giới chứng khoán',
            cphoatdongtudoanh: 'CP hoạt động tự doanh',
            cphoatdongbaolanhdailyphathanhck: 'CP hoạt động bảo lãnh, đại lý phát hành CK',
            cphoatdongtuvandautuck: 'CP hoạt động tư vấn đầu tư chứng khoán',
            cphoatdongdaugiauythac: 'CP hoạt động đấu giá, ủy thác',
            cpnghiepvuluukyck: 'CP nghiệp vụ lưu ký CK',
            cphoatdongtuvantc: 'CP hoạt động tư vấn TC',
            cphoatdongkhac: 'CP hoạt động khác',
            cphoatdong: 'Tổng chi phí HĐ',
            doanhthuhoatdongtc: 'Tổng doanh thu HĐ TC',
            cplaivay_pl: 'CP lãi vay',
            cpdpcackhoandaututcdaihan: 'CP dự phòng các khoản ĐT TC dài hạn',
            cptckhac: 'CP tài chính khác',
            cptc: 'Tổng chi phí TC',
            cpbanhang: 'Chi phí bán hàng',
            cpql: 'Chi phí quản lý',
            ketquahoatdongkd: 'Kết quả hoạt động KD',
            lndathuchien_pl: 'LN đã thực hiện',
            lnchuathuchien_pl: 'LN chưa thực hiện',
            cpthuetndn: 'Chi phí thuế TNDN',
            cpthuetndnhienhanh: 'CP thuế TNDN HH',
            cpthuetndnhoanlai: 'CP thuế TNDN HL',
            lnsauthuecuachusohuu: 'LNST của chủ sở hữu',
            lnsauthuephanbokhac: 'LNST phân bổ khác',
            tongthunhaptoandienphanbochocodongthieuso:
                'Tổng TN toàn diện phân bổ cho cổ đông thiểu số',
            tongthunhaptoandienphanbochovonchusohuu: 'Tổng TN toàn diện phân bổ cho VCSH',
            thunhapphaloangtrencophieu: 'TN pha loãng trên CP',
        },
    },
    [COMPANY_TYPE.INSURANCE]: {
        [FINANCIAL_STATEMENT_TYPE.INCOME_STATEMENT]: {
            doanhthuphibaohiem: 'Doanh thu phí BH',
            phinhantaibaohiem: 'Phí nhận tái bảo hiểm',
            tgduphongphibaohiemgoc: 'Tăng/giảm dự phòng phí BH gốc và nhận tái BH',
            phinhuongtaibaohiem: 'Phí nhượng tái BH',
            tongphinhuongtaibaohiem: 'Tổng phí nhượng tái BH',
            tgduphongphinhuongtaibaohiem: 'Tăng/giảm dự phòng phí nhượng tái BH',
            doanhthuphibaohiemthuan: 'Doanh thu phí BH thuần',
            hoahongnhuongtaibaohiem: 'Hoa hồng nhượng tái BH & doanh thu khác từ KDCH',
            thukhachdkdbaohiem: 'Thu khác hoạt động kinh doanh bảo hiểm',
            cackhoangiamtru: 'Các khoản giảm trừ CP',
            tgduphongboithuongbaohiemgoc: 'Tăng/giảm dự phòng bồi thường BH gốc và nhận tái BH',
            tgduphongboithuongnhuongtaibaohiem: 'Tăng/giảm dự phòng bồi thường nhượng tái BH',
            lntuhdkdkhac: 'Lợi nhuận từ HĐKD khác',
            doanhthuhdkdkhac: 'Doanh thu HĐKD khác',
            cphdkdkhac: 'Chi phí HĐKD khác',
            lnhdtaichinh: 'Lợi nhuận HĐTC',
            doanhthuhdtaichinh: 'Doanh thu HĐTC',
            chiphiquanlydn: 'CP quản lý doanh nghiệp',
            lnthuantuhdkd: 'Lợi nhuận thuần từ HĐKD',
            tonglnketoantruocthue_bs: 'LN kế toán trước thuế',
            chiphithuetndnhienhanh: 'CP thuế TNDN HH',
            chiphithuetndnhoanlai: 'CP thuế TNDN HL',
            loiichcuacodongthieuso: 'Lợi ích cổ đông thiểu số',
            lnstcuacongtyme: 'LNST công ty mẹ',
            laicobantrencophieu: 'Lãi cơ bản trên CP',
        },
    },
};

export const BASE_UI_LABELS = viStockInfo.finance_report.metric_labels as Record<string, string>;

export const REPORT_SCHEMAS: Record<CompanyType, Record<ReportTab, TradeReportSchemaRow[]>> = {
    [COMPANY_TYPE.NON_FINANCIAL]: {
        [FINANCIAL_STATEMENT_TYPE.INCOME_STATEMENT]: [
            data('doanhthubanhangvacungcapdichvu', 'header'),
            data('cackhoangiamtrudoanhthu', 'negativeDesc1'),
            data('doanhthuthuanvebanhangvacungcapdichvu', 'header'),
            data('giavonhangban', 'negativeDesc1'),
            dividerSoft(),
            data('loinhuangopvebanhangvacungcapdichvu', 'header'),
            data('doanhthuhoatdongtaichinh', 'negativeDesc1'),
            data('chiphitaichinh', 'negativeDesc1'),
            data('trongdochiphilaivay', 'negativeDesc2'),
            data('phanlailohoaclotrongcongtyliendoanhlienket', 'negativeDesc1'),
            data('chiphibanhang', 'negativeDesc1'),
            data('chiphiquanlydoanhnghiep', 'negativeDesc1'),
            dividerSoft(),
            data('loinhuanthuantuhoatdongkinhdoanh', 'header'),
            data('thunhapkhac', 'negativeDesc1'),
            data('chiphikhac', 'negativeDesc1'),
            dividerSoft(),
            data('loinhuankhac', 'header'),
            dividerSoft(),
            data('tongloinhuanketoantruocthue', 'header'),
            data('chiphithuetndnhienhanh', 'negativeDesc1'),
            data('chiphithuetndnhoanlai', 'negativeDesc1'),
            dividerGreen(),
            data('loinhuansauthuethunhapdoanhnghiep', 'header'),
            data('loiichcuacodongthieuso_bctn', 'sub'),
            data('loinhuansauthuecuacongtyme', 'sub'),
            data('laicobantrencophieu', 'sub'),
            data('laisuygiamtrencophieu', 'sub'),
        ],
        [FINANCIAL_STATEMENT_TYPE.BALANCE_SHEET]: [
            section('Tài sản'),
            data('taisannganhan', 'header'),
            data('tienvacackhoantuongduongtien', 'sub'),
            data('cackhoandaututaichinhnganhan', 'sub'),
            data('cackhoanphaithunganhan', 'sub'),
            data('hangtonkho_tong', 'sub'),
            data('taisannganhankhac_tong', 'sub'),
            data('taisandaihan', 'header'),
            data('cackhoanphaithudaihan', 'sub'),
            data('taisancodinh', 'sub'),
            data('batdongsandautu', 'sub'),
            data('taisandodangdaihan', 'sub'),
            data('daututaichinhdaihan', 'sub'),
            data('taisandaihankhac_tong', 'sub'),
            dividerGreen(),
            data('tongcongtaisan', 'header'),
            section('Nguồn vốn'),
            data('nophaitra', 'header'),
            data('nonganhan', 'sub'),
            data('nodaihan', 'sub'),
            data('vonchusohuu_tong', 'header'),
            data('vonchusohuu', 'sub'),
            data('nguonkinhphivacacquykhac', 'sub'),
            dividerGreen(),
            data('tongcongnguonvon', 'header'),
        ],
        [FINANCIAL_STATEMENT_TYPE.CASH_FLOW]: [
            section('Hoạt động kinh doanh'),
            data('loinhuanlotruocthue', 'header'),
            data('khauhaotaisancodinh', 'sub'),
            data('cackhoanduphong', 'negativeDesc1'),
            data('lailotudautuvaocongtylienket', 'negativeDesc1'),
            data('lailochenhlechtygiahoidoaichuathuchien', 'sub'),
            data('lailotuhoatdongdaututhanhlytaisancodinh', 'sub'),
            data('chiphilaivay', 'sub'),
            data('cackhoangiamtrukhac', 'sub'),
            data('thunhaptulaitiengui', 'sub'),
            data('phanboloithethuongmai', 'sub'),
            data('lailothanhlytaisancodinh', 'sub'),
            data('loinhuanlotuhoatdongkinhdoanhtruocthaydoivonluudong', 'header'),
            data('tanggiamcackhoanphaithu', 'sub'),
            data('tanggiamchungkhoantudoanh', 'sub'),
            data('tanggiamhangtonkho', 'sub'),
            data('tanggiamcackhoanphaitrakhonggomlaivaythuetndnphaitra', 'sub'),
            data('tanggiamchiphitratruoc', 'sub'),
            data('tienlaivaydatra', 'sub'),
            data('thuethunhapdoanhnghiepdanop', 'sub'),
            data('tienthukhactuhoatdongkinhdoanh', 'sub'),
            data('tienchikhacchohoatdongkinhdoanh', 'sub'),
            dividerSoft(),
            data('luuchuyentienthuantuhoatdongkinhdoanh', 'header'),
            section('Hoạt động đầu tư'),
            data('tienchidemuasamxaydungtaisancodinh', 'negativeDesc1'),
            data('tienthudothanhlynhuongbantscdvacactaisandaihankhac', 'sub'),
            data('tienchichovaymuacaccongcunocuadonvikhac', 'negativeDesc1'),
            data('tienthuhoichovaybanlaicongcunocuadonvikhac', 'negativeDesc1'),
            data('tienchidautugopvonvaodonvikhac', 'negativeDesc1'),
            data('tienthudobancackhoandautugopvonvaodonvikhac', 'negativeDesc1'),
            data('tienthulaichovaycotucvaloinhuanduocchia', 'negativeDesc1'),
            data('tienthu_chikhactuhddt', 'negativeDesc1'),
            dividerSoft(),
            data('luuchuyentienthuantuhoatdongdautu', 'header'),
            section('Hoạt động tài chính'),
            data('tienthutuphathanhcophieunhangopvoncuachusohuu', 'sub'),
            data('tienchitravongopchocshmualaicp', 'sub'),
            data('tienvaynganhandaihannhanduoc', 'negativeDesc1'),
            data('tienchitranogocvay', 'negativeDesc1'),
            data('tienchitranothuetaichinh', 'negativeDesc1'),
            data('cotucloinhuandatrachochusohuu', 'negativeDesc1'),
            data('tienthu_chikhactuhdtc', 'negativeDesc1'),
            dividerSoft(),
            data('luuchuyentienthuantusudungvaohoatdongtaichinh', 'header'),
            data('luuchuyentienthuantrongnam', 'header'),
            data('anhhuongcuathaydoitygiahoidoaiquydoingoaite', 'negativeDesc1'),
            data('tienvatuongduongtiendaunam', 'header'),
            dividerGreen(),
            data('tienvatuongduongtiencuoinam', 'header'),
        ],
    },
    [COMPANY_TYPE.BANK]: {
        [FINANCIAL_STATEMENT_TYPE.INCOME_STATEMENT]: [
            data('thunhaplaivacackhoanthunhaptuongtu', 'header'),
            data('chiphilaivacacchiphituongtu', 'negativeDesc1'),
            dividerSoft(),
            data('thunhaplaithuan', 'header'),
            data('thunhaptuhoatdongdichvu', 'header'),
            data('chiphihoatdongdichvu', 'negativeDesc1'),
            data('laithuantuhoatdongdichvu', 'header'),
            data('lailothuantuhoatdongkinhdoanhngoaihoivavang', 'header'),
            data('lailothuantumuabanchungkhoankinhdoanh', 'header'),
            data('lailothuantumuabanchungkhoandautu', 'header'),
            data('thunhaptuhoatdongkhac', 'header'),
            data('chiphihoatdongkhac', 'negativeDesc1'),
            dividerSoft(),
            data('lailothuantuhoatdongkhac', 'header'),
            data('thunhaptugopvonmuacophan', 'header'),
            dividerSoft(),
            data('tongthunhaphoatdong', 'header'),
            data('chiphihoatdong', 'negativeDesc1'),
            dividerSoft(),
            data('loinhuanthuantuhdkdtruocchiphiduphongruirotindung', 'header'),
            data('chiphiduphongruirotindung', 'negativeDesc1'),
            dividerSoft(),
            data('tongloinhuantruocthue', 'header'),
            data('chiphithuetndnhienhanh', 'negativeDesc2'),
            data('chiphithuetndnhoanlai', 'negativeDesc2'),
            data('chiphithuethunhapdoanhnghiep', 'header'),
            dividerGreen(),
            data('loinhuansauthue', 'header'),
            data('loiichcuacodongthieuso_pl', 'sub'),
            data('codongcuacongtyme', 'sub'),
        ],
        [FINANCIAL_STATEMENT_TYPE.BALANCE_SHEET]: [
            section('Tài sản'),
            data('tienmatvangbacdaquy', 'header'),
            data('tienguitainganhangnhanuoc', 'header'),
            data('tienguivachovaycactctdkhac', 'header'),
            data('tienvangguitaitctdkhac', 'sub'),
            data('chovaycactctdkhac', 'sub'),
            data('duphongruirochovaycactctdkhac', 'sub'),
            data('chungkhoankinhdoanhrong', 'header'),
            data('chungkhoankinhdoanh', 'sub'),
            data('duphonggiamgiachungkhoankinhdoanh', 'sub'),
            data('caccongcutaichinhphaisinhvacactaisantaichinhkhac', 'header'),
            data('chovaykhachhangrong', 'header'),
            data('chovaykhachhang', 'sub'),
            data('duphongruirochovaykhachhang', 'sub'),
            data('chungkhoandautu', 'header'),
            data('chungkhoandautusansangdeban', 'sub'),
            data('chungkhoandautugiudenngaydaohan', 'sub'),
            data('duphonggiamgiachungkhoandautu', 'sub'),
            data('gopvondautudaihan', 'header'),
            data('dautuvaocongtycon', 'sub'),
            data('dautuvaocongtyliendoanhlienket', 'sub'),
            data('dautudaihankhac', 'sub'),
            data('duphonggiamgiadautudaihan', 'sub'),
            data('taisancodinh', 'header'),
            data('taisancodinhhuuhinh', 'sub'),
            data('taisancodinhthuetaichinh', 'sub'),
            data('taisancodinhvohinh', 'sub'),
            data('batdongsandautu', 'header'),
            data('taisancokhac', 'header'),
            data('cackhoanphaithu', 'sub'),
            data('cackhoanlaiphiphaithu', 'sub'),
            data('taisanthuetndnhoanlai', 'sub'),
            data('taisankhac', 'sub'),
            data('cackhoanduphongruirochocactaisanconoibangkhac', 'sub'),
            dividerGreen(),
            data('tongtaisan', 'header'),
            section('Nguồn vốn'),
            data('tongnophaitra', 'header'),
            data('cackhoannochinhphuvanhnn', 'sub'),
            data('tienguivavaycactochuctindungkhac', 'sub'),
            data('tienguicuakhachhang', 'sub'),
            data('caccongcutaichinhphaisinhvacackhoannotaichinhkhac', 'sub'),
            data('vontaitrouythacdautucuachinhphuvacactochuctindungkhac', 'sub'),
            data('phathanhgiaytocogia', 'sub'),
            data('cackhoannokhac', 'sub'),
            data('vonchusohuu', 'header'),
            data('voncuatochuctindung', 'sub'),
            data('quycuatochuctindung', 'sub'),
            data('chenhlechtygiahoidoai', 'sub'),
            data('chenhlechdanhgialaitaisan', 'sub'),
            data('loinhuanchuaphanphoi', 'sub'),
            data('loiichcuacodongthieuso_bs', 'sub'),
            dividerGreen(),
            data('nophaitravavonchusohuu', 'header'),
        ],
        [FINANCIAL_STATEMENT_TYPE.CASH_FLOW]: [
            section('Hoạt động kinh doanh'),
            data('thunhaplaivacackhoantuongduong', 'sub'),
            data('chiphilaivacackhoantuongduong', 'sub'),
            data('thunhaptuhoatdongdichvunhanduoc', 'sub'),
            data('thunhaptuhoatdongkinhdoanhngoaitevang', 'sub'),
            data('thunhaptuhoatdongkinhdoanhchungkhoan', 'sub'),
            data('thunhapkhac', 'sub'),
            data('tienthucackhoannodaduocxulyxoabudap', 'sub'),
            data('tientrachonhanvienvanhacungcap', 'sub'),
            data('tienchinopthuethunhapdoanhnghiep', 'sub'),
            section('Tài sản'),
            data('tanggiamcakkhoantienguivachovaycactctdkhac', 'sub'),
            data('tanggiamcackhoanvekinhdoanhchungkhoan', 'sub'),
            data('tanggiamcaccongcutaichinhphaisinhvacactstckhac', 'sub'),
            data('tanggiamcackhoanchovaykhachhang', 'sub'),
            data('tanggiamlaiphiphaithu', 'sub'),
            data('tanggiamnguonduphongdebudaptonthatcackhoan', 'sub'),
            data('tanggiamkhacvetaisanhoatdong', 'sub'),
            data('tanggiamcakkhoannochinhphuvanhnn', 'sub'),
            data('tanggiamcakkhoantienguivavaycactctdkhac', 'sub'),
            data('tanggiamtienguicuakhachhang', 'sub'),
            data('tanggiamcaccongcutaichinhphaisinhvacackhoannotckhac', 'sub'),
            data('tanggiamphathanhgiaytocogia', 'sub'),
            data('tanggiamvontaitrouythacdautucuachinhphuvacactctdkhac', 'sub'),
            data('tanggiamlaiphiphaitra', 'sub'),
            data('tanggiamkhacvecongnohoatdong', 'sub'),
            data('tanggiamchitucacquycuatctd', 'sub'),
            dividerSoft(),
            data('luuchuyentienthuantucachoatdongsxkd', 'header'),
            section('Hoạt động đầu tư'),
            data('tienmuataisancodinhvacactaisandaihankhac', 'sub'),
            data('tienthuduoctuthanhlytaisancodinh', 'sub'),
            data('tienchituthanhlynhuongbantscd', 'sub'),
            data('muasambatdongsandautu', 'sub'),
            data('tienthutubanthanhlybatdongsandautu', 'sub'),
            data('tienchiradobanthanhlybatdongsandautu', 'sub'),
            data('dautuvaocacdoanhnghiepkhac', 'sub'),
            data('tienthutuviecbancackhoandautuvaodoanhnghiepkhac', 'sub'),
            data('cotucvatienlainhanduoc', 'sub'),
            dividerSoft(),
            data('luuchuyentienthuantuhoatdongdautu', 'header'),
            section('Hoạt động tài chính'),
            data('tienthutuphathanhcophieuvavongop', 'sub'),
            data('tienthutuphathanhgiaytocogiadaihan', 'sub'),
            data('tienchithanhtoangiaytocogiadaihan', 'sub'),
            data('cotucdatra', 'sub'),
            data('tienchiramuacophieuquy', 'sub'),
            data('tienthuduocdobancophieuquy', 'sub'),
            dividerSoft(),
            data('luuchuyentientuhoatdongtaichinh', 'header'),
            data('luuchuyentienthuantrongky', 'header'),
            data('tienvatuongduongtiendauky', 'header'),
            data('anhhuongcuachenhlechtygia', 'sub'),
            dividerGreen(),
            data('tienvatuongduongtiencuoiky', 'header'),
        ],
    },
    [COMPANY_TYPE.SECURITIES]: {
        [FINANCIAL_STATEMENT_TYPE.INCOME_STATEMENT]: [
            section('Doanh thu hoạt động'),
            data('laitucactaisantcfvtpl', 'sub'),
            data('laitucackhoandautunamgiudenngaydaohanhtm', 'sub'),
            data('laitucackhoanchovayvaphaithu', 'sub'),
            data('laitutaisantcsansangdebanafs', 'sub'),
            data('laitucaccongcuphatsinhphongnguaruiro', 'sub'),
            data('doanhthuhoatdongmoigioick', 'sub'),
            data('doanhthubaolanhdailyphathanhck', 'sub'),
            data('doanhthutuvandautuck', 'sub'),
            data('doanhthuhoatdonguythacdaugia', 'sub'),
            data('doanhthuhoatdongluukyck', 'sub'),
            data('doanhthuhoatdongtuvantc', 'sub'),
            data('doanhthuhoatdongkhac', 'sub'),
            data('cackhoangiamtrudoanhthu', 'sub'),
            dividerSoft(),
            data('doanhthuhoatdong', 'header'),
            section('Chi phí hoạt động'),
            data('lotucactaisantcfvtpl', 'sub'),
            data('locackhoandautunamgiudenngaydaohanhtm', 'sub'),
            data('cplaivaylotucackhoanchovayvaphaithu', 'sub'),
            data('lovachenhlechdgltaisanafskhiphanloailai', 'sub'),
            data('cpdphoannhaptstc', 'sub'),
            data('lotucactaisantcphaisinhphongnguaruiro', 'sub'),
            data('cphoatdongmoigioick', 'sub'),
            data('cphoatdongtudoanh', 'sub'),
            data('cphoatdongbaolanhdailyphathanhck', 'sub'),
            data('cphoatdongtuvandautuck', 'sub'),
            data('cphoatdongdaugiauythac', 'sub'),
            data('cpnghiepvuluukyck', 'sub'),
            data('cphoatdongtuvantc', 'sub'),
            data('cphoatdongkhac', 'sub'),
            dividerSoft(),
            data('cphoatdong', 'header'),
            dividerGreen(),
            data('lngop', 'header'),
            section('Doanh thu hoạt động tài chính'),
            data('chenhlechlaitygiahoidoaidavachuathuchien', 'sub'),
            data('doanhthuduthucotuclaitienguikhongcodinh', 'sub'),
            data('laibanthanhlycackhoandautulkld', 'sub'),
            data('doanhthukhacvedautu', 'sub'),
            dividerSoft(),
            data('doanhthuhoatdongtc', 'header'),
            section('Chi phí tài chính'),
            data('chenhlechlotygiahoidoaidavachuathuchien', 'negativeDesc1'),
            data('cplaivay_pl', 'negativeDesc1'),
            data('cpdpcackhoandaututcdaihan', 'negativeDesc1'),
            data('cptckhac', 'negativeDesc1'),
            dividerSoft(),
            data('cptc', 'header'),
            data('lailotucongtyliendoanhlienket', 'header'),
            data('cpbanhang', 'header'),
            data('cpql', 'header'),
            dividerSoft(),
            data('ketquahoatdongkd', 'header'),
            data('lnkhac', 'header'),
            data('thunhapkhac', 'sub'),
            data('cpkhac', 'sub'),
            data('tonglnketoantruocthue', 'header'),
            data('lndathuchien_pl', 'sub'),
            data('lnchuathuchien_pl', 'sub'),
            data('cpthuetndn', 'header'),
            data('cpthuetndnhienhanh', 'sub'),
            data('cpthuetndnhoanlai', 'sub'),
            dividerGreen(),
            data('lnsauthue', 'header'),
            data('lnsauthuecuachusohuu', 'sub'),
            data('loiichcuacodongthieuso', 'sub'),
            data('lnsauthuephanbokhac', 'sub'),
            data('thunhaptoandienkhacsauthuetndn', 'header'),
            data('tongthunhaptoandien', 'header'),
            data('tongthunhaptoandienphanbochocodongthieuso', 'sub'),
            data('tongthunhaptoandienphanbochovonchusohuu', 'sub'),
            data('laicobantrencophieu', 'header'),
            data('thunhapphaloangtrencophieu', 'header'),
        ],
        [FINANCIAL_STATEMENT_TYPE.BALANCE_SHEET]: [
            section('Tài sản'),
            data('taisannganhan', 'header'),
            data('taisantcnganhan', 'sub'),
            data('taisannganhankhac_tong', 'sub'),
            data('taisandaihan', 'header'),
            data('taisantcdaihan', 'sub'),
            data('taisancodinh', 'sub'),
            data('batdongsandautu', 'sub'),
            data('taisandodangdaihan', 'sub'),
            data('taisandaihankhac_tong', 'sub'),
            dividerGreen(),
            data('tongcongtaisan', 'header'),
            section('Nguồn vốn'),
            data('nophaitra', 'header'),
            data('nonganhan', 'sub'),
            data('nodaihan', 'sub'),
            data('vonchusohuu_tong', 'header'),
            data('vondautucuachusohuu', 'sub'),
            data('chenhlechdgltaisantheogiahoply', 'sub'),
            data('chenhlechtygiahoidoai', 'sub'),
            data('quydutrubosungvondieule', 'sub'),
            data('quydautuphattrien', 'sub'),
            data('quydptcvaruironghiepvu', 'sub'),
            data('quykhacthuocvonchusohuu', 'sub'),
            data('lnsauthuechuaphanphoi', 'sub'),
            data('nguonvondautuxdcb', 'sub'),
            data('quyhotrosapxepdoanhnghiep', 'sub'),
            data('loiichcodongkhongkiemsoat', 'sub'),
            dividerGreen(),
            data('tongnguonvon', 'header'),
        ],
        [FINANCIAL_STATEMENT_TYPE.CASH_FLOW]: [
            section('Hoạt động kinh doanh'),
            data('lntruocthue', 'sub'),
            data('dieuchinhchocackhoan', 'sub'),
            data('tangcaccptiente', 'sub'),
            data('giamcacdoanhthuphitiente', 'sub'),
            data('thaydoitaisanvanophaitrahoatdong', 'sub'),
            data('lntuhoatdongkdtruocthaydoivonluudong', 'sub'),
            dividerSoft(),
            data('luuchuyenthuantuhoatdongkd', 'header'),
            section('Hoạt động đầu tư'),
            data('tienchimuasamxaydungtscdtaisandaihankhac', 'negativeDesc1'),
            data('tienthututhanhlytscdtsdaihankhac', 'sub'),
            data('tienchichovaymuacaccongcuno', 'negativeDesc1'),
            data('tienthuhoichovaybanlaicaccongcuno', 'negativeDesc1'),
            data('tienchidautugopvonvaodonvikhac', 'negativeDesc1'),
            data('tienthudobancackhoandautugopvonvaodonvikhac', 'negativeDesc1'),
            data('tienthulaichovaycotucvalnduocchia', 'negativeDesc1'),
            data('tienthuchikhactuhoatdongdautu', 'negativeDesc1'),
            dividerSoft(),
            data('luuchuyentuhoatdongdautu', 'header'),
            section('Hoạt động tài chính'),
            data('tienthutuphathanhcophieunhanvongop', 'sub'),
            data('tienchitravongopchocacchusohuu', 'sub'),
            data('tienvaynhanduoc', 'negativeDesc1'),
            data('tienchitranogocvay', 'negativeDesc1'),
            data('tienchitranothuetc', 'negativeDesc1'),
            data('cotuclndatrachochusohuu', 'negativeDesc1'),
            data('tienthuchikhactuhoatdongtc', 'negativeDesc1'),
            dividerSoft(),
            data('luuchuyenthuantuhoatdongtc', 'header'),
            data('luuchuyentienthuantrongky', 'header'),
            data('tienvacackhoantuongduongtiendauky', 'header'),
            dividerGreen(),
            data('tienvacackhoantuongduongtiencuoiky', 'header'),
        ],
    },
    [COMPANY_TYPE.INSURANCE]: {
        [FINANCIAL_STATEMENT_TYPE.INCOME_STATEMENT]: [
            data('doanhthuphibaohiem', 'header'),
            data('phibaohiemgoc', 'negativeDesc1'),
            data('phinhantaibaohiem', 'negativeDesc1'),
            data('tgduphongphibaohiemgoc', 'negativeDesc1'),
            data('phinhuongtaibaohiem', 'header'),
            data('tongphinhuongtaibaohiem', 'negativeDesc1'),
            data('tgduphongphinhuongtaibaohiem', 'negativeDesc1'),
            data('cackhoangiamtrukhac', 'negativeDesc1'),
            dividerSoft(),
            data('doanhthuphibaohiemthuan', 'header'),
            data('hoahongnhuongtaibaohiem', 'header'),
            data('thuhoahongnhuongtaibaohiem', 'negativeDesc1'),
            data('thukhachdkdbaohiem', 'negativeDesc1'),
            dividerSoft(),
            data('doanhthuthuan', 'header'),
            data('chiboithuong', 'header'),
            data('tongchiboithuong', 'negativeDesc1'),
            data('cackhoangiamtru', 'negativeDesc1'),
            data('thuboithuongnhuongtaibaohiem', 'header'),
            data('tangduphongnghiepvubaohiemgoc', 'header'),
            data('tgduphongtoanhoc', 'negativeDesc1'),
            data('tanggiamduphongcamketdaututoithieu', 'negativeDesc1'),
            data('tanggiamduphongchialai', 'negativeDesc1'),
            data('tanggiamduphongdambaocandoi', 'negativeDesc1'),
            data('tanggiamduphongnghiepvubaohiemgockhac', 'negativeDesc1'),
            data('tgduphongboithuongbaohiemgoc', 'header'),
            data('tgduphongboithuongnhuongtaibaohiem', 'header'),
            data('tongchiboithuongvatratienbaohiem', 'header'),
            data('trichduphongdaodonglon', 'header'),
            data('chikhachdkdbaohiemgoc', 'header'),
            data('tongchitructiephdkdbaohiem', 'header'),
            dividerSoft(),
            data('lngop', 'header'),
            data('lntuhdkdkhac', 'header'),
            data('doanhthuhdkdkhac', 'negativeDesc1'),
            data('cphdkdkhac', 'negativeDesc1'),
            data('lnhdtaichinh', 'header'),
            data('doanhthuhdtaichinh', 'negativeDesc1'),
            data('chiphitaichinh', 'negativeDesc1'),
            data('lailotucongtyliendoanhlienket', 'header'),
            data('chiphiquanlydn', 'header'),
            dividerSoft(),
            data('lnthuantuhdkd', 'header'),
            data('lnkhac', 'header'),
            data('thunhapkhac', 'negativeDesc1'),
            data('chiphikhac', 'negativeDesc1'),
            dividerSoft(),
            data('tonglnketoantruocthue_bs', 'header'),
            data('chiphithuetndnhienhanh', 'negativeDesc1'),
            data('chiphithuetndnhoanlai', 'negativeDesc1'),
            dividerGreen(),
            data('lnstthunhapdn', 'header'),
            data('loiichcuacodongthieuso', 'sub'),
            data('lnstcuacongtyme', 'sub'),
            data('laicobantrencophieu', 'header'),
        ],
        [FINANCIAL_STATEMENT_TYPE.BALANCE_SHEET]: [
            section('Tài sản'),
            data('taisannganhan', 'header'),
            data('tienvacackhoantuongduongtien', 'sub'),
            data('cackhoandaututaichinhnganhan', 'sub'),
            data('cackhoanphaithunganhan', 'sub'),
            data('hangtonkhorong', 'sub'),
            data('taisannganhankhac', 'sub'),
            data('taisantaibaohiem', 'sub'),
            data('taisandaihan', 'header'),
            data('cackhoanphaithudaihan', 'sub'),
            data('taisancodinh', 'sub'),
            data('batdongsandautu', 'sub'),
            data('taisandodangdaihan', 'sub'),
            data('cackhoandaututaichinhdaihan', 'sub'),
            data('taisandaihankhac', 'sub'),
            dividerGreen(),
            data('tongtaisan', 'header'),
            section('Nguồn vốn'),
            data('nophaitra', 'header'),
            data('nonganhan', 'sub'),
            data('nodaihan', 'sub'),
            data('vonchusohuu_tong', 'header'),
            data('vonchusohuu', 'sub'),
            data('nguonkinhphivaquykhac', 'sub'),
            dividerGreen(),
            data('tongnguonvon', 'header'),
        ],
        [FINANCIAL_STATEMENT_TYPE.CASH_FLOW]: [
            section('Hoạt động kinh doanh'),
            data('tonglnketoantruocthue_cf', 'sub'),
            data('dieuchinhchocackhoan', 'sub'),
            data('lntuhdkdtruocthaydoivld', 'sub'),
            dividerSoft(),
            data('luuchuyentienthuantuhdkd', 'header'),
            section('Hoạt động đầu tư'),
            data('tienmuataisancodinh', 'negativeDesc1'),
            data('tienthudobantaisancodinh', 'sub'),
            data('tienchichovaymuacaccongcuno', 'negativeDesc1'),
            data('tienthuhoichovaybanlaicongcuno', 'negativeDesc1'),
            data('tiendautuvaocacdonvikhac', 'negativeDesc1'),
            data('tienthuhoivongopvaodonvikhac', 'negativeDesc1'),
            data('tienthulaichovayvalnduocchia', 'negativeDesc1'),
            data('tienthuchikhactuhoatdongdautu', 'negativeDesc1'),
            dividerSoft(),
            data('luuchuyentienthuantuhddautu', 'header'),
            section('Hoạt động tài chính'),
            data('tienthutuphathanhcophieunhanvongop', 'sub'),
            data('tienchiramualaicophieu', 'sub'),
            data('tienthutudivay', 'negativeDesc1'),
            data('tiendatranovay', 'negativeDesc1'),
            data('tienchitranothuetaichinh', 'negativeDesc1'),
            data('tientracotuclndatrachochusohuu', 'negativeDesc1'),
            data('tienthuchikhactuhoatdongtaichinh', 'negativeDesc1'),
            dividerSoft(),
            data('luuchuyentienthuantuhdtaichinh', 'header'),
            data('luuchuyentienthuantrongky', 'header'),
            data('tienvatuongduongtiendauky', 'header'),
            data('anhhuongcuathaydoitygiahoidoai', 'header'),
            dividerGreen(),
            data('tienvatuongduongtiencuoiky', 'header'),
        ],
    },
};
