import Dexie, { type Table } from 'dexie';
import * as XLSX from 'xlsx';

import {
    INVESTOR_CSV_BASE_HEADERS,
    INVESTOR_CSV_REQUIRED_COLS,
    RECORD_TYPE,
    REVOKE_BLOB_URL_MS,
    TRADE_ORDER_TYPE,
    TRADE_ORDER_TYPE_VALUES,
    TRANSACTION_CSV_HEADERS,
    TRANSACTION_CSV_REQUIRED_COLS,
    XLSX_EXTENSIONS,
} from '@/constants/fund';
import type { EncRecord, Holding, ImportBatch, Investor, Transaction } from '@/db/fund';
import { encLoadAll, fundDb } from '@/db/fund';
import type {
    FundInvestorPreviewCol,
    FundStepState,
    FundTradePreviewCol,
} from '@/types/pages/fund';
import { formatApiDate } from '@/utils/format';
import { encryptRecord } from '@/utils/fund/fund-crypto';

export const isSupportedFundImportFile = (fileName: string): boolean => {
    const lower = fileName.toLowerCase();
    return lower.endsWith('.csv') || XLSX_EXTENSIONS.some((ext) => lower.endsWith(ext));
};

const parseCsv = (text: string): string[][] => {
    const rows: string[][] = [];
    let field = '';
    let row: string[] = [];
    let inQuotes = false;
    const s = text.replace(/^﻿/, '');
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (inQuotes) {
            if (ch === '"') {
                if (s[i + 1] === '"') {
                    field += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                field += ch;
            }
        } else if (ch === '"' && field === '') {
            inQuotes = true;
        } else if (ch === ',') {
            row.push(field);
            field = '';
        } else if (ch === '\n') {
            row.push(field);
            rows.push(row);
            row = [];
            field = '';
        } else if (ch !== '\r') {
            field += ch;
        }
    }
    if (field !== '' || row.length > 0) {
        row.push(field);
        rows.push(row);
    }
    return rows.filter((r) => r.some((c) => c.trim() !== ''));
};

const csvEscapeCell = (v: string): string =>
    /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;

const toCsvRow = (cells: unknown[]): string => cells.map((x) => csvEscapeCell(String(x))).join(',');

const parseNumber = (raw: unknown): number => {
    if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0;
    if (raw == null) return 0;
    let s = String(raw)
        .trim()
        .replace(/[^\d,.-]/g, '');
    if (s === '' || s === '-') return 0;
    const lastComma = s.lastIndexOf(',');
    const lastDot = s.lastIndexOf('.');
    let decimalSep = '';
    if (lastComma !== -1 && lastDot !== -1) {
        decimalSep = lastComma > lastDot ? ',' : '.';
    } else if (lastComma !== -1) {
        const parts = s.split(',');
        decimalSep = parts.length === 2 && parts[1].length !== 3 ? ',' : '';
    } else if (lastDot !== -1) {
        const parts = s.split('.');
        decimalSep = parts.length === 2 && parts[1].length !== 3 ? '.' : '';
    }
    if (decimalSep) {
        const thousandSep = decimalSep === ',' ? '.' : ',';
        s = s.split(thousandSep).join('').replace(decimalSep, '.');
    } else {
        s = s.replace(/[.,]/g, '');
    }
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
};

const VALID_ORDER_TYPES = new Set<string>(TRADE_ORDER_TYPE_VALUES);

const normalizeOrderType = (raw: string): string => raw.trim().toUpperCase().replace(/\s+/g, '_');

const normalizeHeaderCell = (v: string): string => v.trim().toLowerCase().replace(/\*+$/, '');

const parseNormalizedHeaders = (text: string): string[] | null => {
    const rows = parseCsv(text);
    if (rows.length === 0) return null;
    return rows[0].map(normalizeHeaderCell);
};

export const isValidTransactionCsvTemplate = (text: string): boolean => {
    const headers = parseNormalizedHeaders(text);
    if (!headers || headers.length < TRANSACTION_CSV_HEADERS.length) return false;

    return TRANSACTION_CSV_HEADERS.every((expected, idx) => headers[idx] === expected);
};

export const isValidInvestorCsvTemplate = (text: string): boolean => {
    const headers = parseNormalizedHeaders(text);
    if (!headers || headers.length < INVESTOR_CSV_BASE_HEADERS.length + 2) return false;

    const isBaseValid = INVESTOR_CSV_BASE_HEADERS.every(
        (expected, idx) => headers[idx] === expected,
    );
    if (!isBaseValid) return false;

    const dynamicHeaders = headers.slice(INVESTOR_CSV_BASE_HEADERS.length);
    if (dynamicHeaders.length % 2 !== 0) return false;

    for (let i = 0; i < dynamicHeaders.length; i += 2) {
        const pairIdx = i / 2 + 1;
        if (dynamicHeaders[i] !== `sector${pairIdx}` || dynamicHeaders[i + 1] !== `pct${pairIdx}`) {
            return false;
        }
    }
    return true;
};

type TransactionRequiredCol = (typeof TRANSACTION_CSV_REQUIRED_COLS)[number];
type InvestorRequiredCol = (typeof INVESTOR_CSV_REQUIRED_COLS)[number];

export type RawTransaction = {
    ma_gd: string;
    ngay_gd: string;
    ngay_khop: string;
    ma_ndt: string;
    loai_lenh: string;
    ma_ck: string;
    nganh: string;
    khoi_luong: number;
    gia_khop: number;
    phi_gd: number;
    thue: number;
    tong_tien: number;
    tieu_khoan: string;
    _invalidFields?: TransactionRequiredCol[];
};

export type RawInvestor = {
    ma_ndt: string;
    ho_ten: string;
    so_dien_thoai: string;
    ngay_uy_thac: string;
    rm_phu_trach: string;
    rm_id: string;
    von_uy_thac_vnd: number;
    trang_thai: 'active' | 'watch';
    thesis: { sector: string; pct: number }[];
    _invalidFields?: InvestorRequiredCol[];
};

export const buildSectorSuggestions = (investors: Investor[], holdings: Holding[]): string[] => {
    const sectors = new Set<string>();
    investors.forEach((inv) => {
        inv.thesis.forEach((th) => {
            const sector = th.sector.trim();
            if (sector) sectors.add(sector);
        });
    });
    holdings.forEach((h) => {
        const sector = h.nganh.trim();
        if (sector) sectors.add(sector);
    });
    return Array.from(sectors).sort((a, b) => a.localeCompare(b));
};

const computeMissingRequired = <C extends string>(
    cols: string[],
    requiredCols: readonly C[],
    colIndex: Record<C, number>,
): C[] => requiredCols.filter((col) => (cols[colIndex[col]] ?? '').trim() === '');

const TRANSACTION_COL_INDEX: Record<TransactionRequiredCol, number> = {
    ma_gd: 0,
    ngay_gd: 1,
    ma_ndt: 3,
    loai_lenh: 4,
    tong_tien: 11,
};

const INVESTOR_COL_INDEX: Record<InvestorRequiredCol, number> = {
    ma_ndt: 0,
    ho_ten: 1,
    so_dien_thoai: 2,
    ngay_uy_thac: 3,
    von_uy_thac_vnd: 6,
};

export const parseTransactionCsv = (text: string): RawTransaction[] => {
    const rows = parseCsv(text);
    if (rows.length < 2) return [];

    return rows.slice(1).map((cols) => {
        const _invalidFields = computeMissingRequired(
            cols,
            TRANSACTION_CSV_REQUIRED_COLS,
            TRANSACTION_COL_INDEX,
        );
        const loai_lenh = normalizeOrderType(cols[4] ?? '');
        if (
            loai_lenh !== '' &&
            !VALID_ORDER_TYPES.has(loai_lenh) &&
            !_invalidFields.includes('loai_lenh')
        ) {
            _invalidFields.push('loai_lenh');
        }
        return {
            ma_gd: cols[0]?.trim() ?? '',
            ngay_gd: cols[1]?.trim() ?? '',
            ngay_khop: cols[2]?.trim() ?? '',
            ma_ndt: (cols[3]?.trim() ?? '').toUpperCase(),
            loai_lenh,
            ma_ck: (cols[5]?.trim() ?? '').toUpperCase(),
            nganh: cols[6]?.trim() ?? '',
            khoi_luong: parseNumber(cols[7]),
            gia_khop: parseNumber(cols[8]),
            phi_gd: parseNumber(cols[9]),
            thue: parseNumber(cols[10]),
            tong_tien: parseNumber(cols[11]),
            tieu_khoan: cols[12]?.trim() ?? '',
            ...(_invalidFields.length > 0 ? { _invalidFields } : {}),
        };
    });
};

export const parseInvestorCsv = (text: string): RawInvestor[] => {
    const rows = parseCsv(text);
    if (rows.length < 2) return [];

    return rows.slice(1).map((cols) => {
        const thesis: { sector: string; pct: number }[] = [];
        for (let idx = 8; idx + 1 < cols.length; idx += 2) {
            const sector = cols[idx]?.trim();
            const pct = parseNumber(cols[idx + 1]);
            if (sector && pct > 0) thesis.push({ sector, pct });
        }
        const _invalidFields = computeMissingRequired(
            cols,
            INVESTOR_CSV_REQUIRED_COLS,
            INVESTOR_COL_INDEX,
        );
        return {
            ma_ndt: (cols[0]?.trim() ?? '').toUpperCase(),
            ho_ten: cols[1]?.trim() ?? '',
            so_dien_thoai: cols[2]?.trim() ?? '',
            ngay_uy_thac: cols[3]?.trim() ?? '',
            rm_phu_trach: cols[4]?.trim() ?? '',
            rm_id: cols[5]?.trim() ?? '',
            von_uy_thac_vnd: parseNumber(cols[6]),
            trang_thai: (cols[7]?.trim() ?? 'active') as 'active' | 'watch',
            thesis,
            ...(_invalidFields.length > 0 ? { _invalidFields } : {}),
        };
    });
};

const TRANSACTION_REQUIRED_SET = new Set<string>(TRANSACTION_CSV_REQUIRED_COLS);
const INVESTOR_REQUIRED_SET = new Set<string>(INVESTOR_CSV_REQUIRED_COLS);

const decorateHeader = (h: string, requiredSet: Set<string>): string =>
    requiredSet.has(h) ? `${h}*` : h;

export const serializeTransactionsToCsv = (transactions: Transaction[]): string => {
    const header = TRANSACTION_CSV_HEADERS.map((h) =>
        decorateHeader(h, TRANSACTION_REQUIRED_SET),
    ).join(',');
    const rows = transactions.map((t) =>
        toCsvRow([
            t.ma_gd,
            t.ngay_gd,
            t.ngay_khop,
            t.ma_ndt,
            t.loai_lenh,
            t.ma_ck,
            t.nganh,
            t.khoi_luong,
            t.gia_khop,
            t.phi_gd,
            t.thue,
            t.tong_tien,
            t.tieu_khoan,
        ]),
    );
    return [header, ...rows].join('\n');
};

export const serializeInvestorsToCsv = (investors: Investor[]): string => {
    const baseHeader = INVESTOR_CSV_BASE_HEADERS.map((h) =>
        decorateHeader(h, INVESTOR_REQUIRED_SET),
    ).join(',');
    const thesisHeader = Array.from({ length: 5 }, (_, i) => `sector${i + 1},pct${i + 1}`).join(
        ',',
    );
    const header = `${baseHeader},${thesisHeader}`;
    const rows = investors.map((inv) => {
        const thesisCols: string[] = [];
        for (let i = 0; i < 5; i++) {
            thesisCols.push(inv.thesis[i]?.sector ?? '', String(inv.thesis[i]?.pct ?? ''));
        }
        return toCsvRow([
            inv.ma_ndt,
            inv.ho_ten,
            inv.so_dien_thoai,
            inv.ngay_uy_thac,
            inv.rm_phu_trach,
            inv.rm_id,
            inv.von_uy_thac_vnd,
            inv.trang_thai,
            ...thesisCols,
        ]);
    });
    return [header, ...rows].join('\n');
};

export const yieldToPaint = (): Promise<void> =>
    new Promise((resolve) => requestAnimationFrame(() => window.setTimeout(resolve, 0)));

export const downloadBlob = (filename: string, blob: Blob): void => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_BLOB_URL_MS);
};

export const downloadCsv = (filename: string, content: string): void => {
    downloadBlob(filename, new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8;' }));
};

const readFileAsText = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file, 'utf-8');
    });

const xlsxCellToString = (v: unknown): string => {
    if (v == null) return '';
    if (v instanceof Date) return formatApiDate(v);
    return String(v);
};

const readXlsxAsCsvText = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) return '';
    const sheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
        header: 1,
        raw: true,
        defval: '',
        blankrows: false,
    });
    return rows
        .map((row) => row.map((v) => csvEscapeCell(xlsxCellToString(v))).join(','))
        .join('\n');
};

export const readImportFileAsCsvText = async (file: File): Promise<string> => {
    const lower = file.name.toLowerCase();
    if (XLSX_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
        return readXlsxAsCsvText(file);
    }
    return readFileAsText(file);
};

export const calcInvestorCash = (investor: Investor, transactions: Transaction[]): number => {
    const myTx = transactions.filter((t) => t.ma_ndt === investor.ma_ndt);
    const cashFlow = myTx.reduce((sum, t) => sum + t.tong_tien, 0);
    return investor.von_uy_thac_vnd + cashFlow;
};

export const calcInvestorNav = (
    investor: Investor,
    holdings: Holding[],
    transactions: Transaction[],
    prices: Record<string, number>,
): number => {
    const myHoldings = holdings.filter((h) => h.ma_ndt === investor.ma_ndt);
    const stockValue = myHoldings.reduce((sum, h) => {
        const price = prices[h.ma_ck] ?? h.avg_cost;
        return sum + h.khoi_luong * price;
    }, 0);
    const cash = calcInvestorCash(investor, transactions);
    return cash + stockValue;
};

const calcNewAvgCost = (
    oldQty: number,
    oldAvg: number,
    newQty: number,
    newPrice: number,
    fee: number = 0,
): number => {
    if (oldQty + newQty === 0) return 0;
    const costAddition = newQty * newPrice + fee;
    return (oldQty * oldAvg + costAddition) / (oldQty + newQty);
};

export type StockSummary = {
    ma_ck: string;
    nganh: string;
    total_kl: number;
    weighted_avg_cost: number;
    current_price: number;
    current_value: number;
    pnl: number;
    pnl_pct: number;
    weight_pct: number;
};

export const calcPortfolioSummary = (
    holdings: Holding[],
    prices: Record<string, number>,
): StockSummary[] => {
    const grouped: Record<string, { total_kl: number; total_cost: number; nganh: string }> = {};

    for (const h of holdings) {
        if (!grouped[h.ma_ck]) {
            grouped[h.ma_ck] = { total_kl: 0, total_cost: 0, nganh: h.nganh };
        }
        grouped[h.ma_ck].total_kl += h.khoi_luong;
        grouped[h.ma_ck].total_cost += h.khoi_luong * h.avg_cost;
    }

    const totalStockValue = Object.entries(grouped).reduce((sum, [sym, g]) => {
        const avg = g.total_kl > 0 ? g.total_cost / g.total_kl : 0;
        return sum + g.total_kl * (prices[sym] ?? avg);
    }, 0);

    return Object.entries(grouped).map(([ma_ck, g]) => {
        const avg_cost = g.total_kl > 0 ? g.total_cost / g.total_kl : 0;
        const current_price = prices[ma_ck] ?? avg_cost;
        const current_value = g.total_kl * current_price;
        const cost_basis = g.total_kl * avg_cost;
        const pnl = current_value - cost_basis;
        const pnl_pct = cost_basis > 0 ? (pnl / cost_basis) * 100 : 0;
        const weight_pct = totalStockValue > 0 ? (current_value / totalStockValue) * 100 : 0;

        return {
            ma_ck,
            nganh: g.nganh,
            total_kl: g.total_kl,
            weighted_avg_cost: avg_cost,
            current_price,
            current_value,
            pnl,
            pnl_pct,
            weight_pct,
        };
    });
};

export type SectorPerformance = {
    sector: string;
    investor_count: number;
    nav: number;
    return_pct: number;
};

export const calcSectorPerformance = (
    _investors: Investor[],
    holdings: Holding[],
    prices: Record<string, number>,
): SectorPerformance[] => {
    const sectorMap: Record<string, { investorIds: Set<string>; value: number; cost: number }> = {};

    for (const h of holdings) {
        if (!sectorMap[h.nganh]) {
            sectorMap[h.nganh] = { investorIds: new Set(), value: 0, cost: 0 };
        }
        const price = prices[h.ma_ck] ?? h.avg_cost;
        sectorMap[h.nganh].value += h.khoi_luong * price;
        sectorMap[h.nganh].cost += h.khoi_luong * h.avg_cost;
        sectorMap[h.nganh].investorIds.add(h.ma_ndt);
    }

    return Object.entries(sectorMap).map(([sector, data]) => ({
        sector,
        investor_count: data.investorIds.size,
        nav: data.value,
        return_pct: data.cost > 0 ? ((data.value - data.cost) / data.cost) * 100 : 0,
    }));
};

export const calcTopStockImpact = (
    portfolioSummary: StockSummary[],
    topN = 5,
): { symbol: string; pnl: number }[] => {
    const sorted = [...portfolioSummary].sort((a, b) => b.pnl - a.pnl);
    const MIN_PNL = 1_000;
    const positive = sorted.filter((s) => s.pnl >= MIN_PNL).slice(0, topN);
    const negative = sorted.filter((s) => s.pnl <= -MIN_PNL).slice(0, topN);
    return [...positive, ...negative].map((s) => ({ symbol: s.ma_ck, pnl: s.pnl }));
};

type TradeCalcField = 'khoi_luong' | 'gia_khop' | 'phi_gd' | 'thue';

type TradeFieldConfig = {
    name:
        | 'ma_gd'
        | 'ngay_gd'
        | 'ngay_khop'
        | 'ma_ndt'
        | 'ma_ck'
        | 'nganh'
        | 'khoi_luong'
        | 'gia_khop'
        | 'phi_gd'
        | 'thue'
        | 'tong_tien';
    label: string;
    required?: boolean;
    type?: 'text' | 'date' | 'number';
    min?: number;
    placeholder?: string;
    validate?: (v: string) => string | undefined;
    onChangeSideEffect?: (v: string) => void;
};

const requiredText =
    (errRequired: string) =>
    (v: string): string | undefined =>
        !v.trim() ? errRequired : undefined;

const requiredValue =
    (errRequired: string) =>
    (v: string): string | undefined =>
        !v ? errRequired : undefined;

export const createTradeFieldConfigs = (
    labels: {
        ma_gd: string;
        ngay_gd: string;
        ngay_khop: string;
        ma_ndt: string;
        ma_ck: string;
        nganh: string;
        khoi_luong: string;
        gia_khop: string;
        phi_gd: string;
        thue: string;
        tong_tien: string;
    },
    errors: {
        required: string;
        sector_not_in_data: string;
        no_sectors_in_data: string;
        investor_not_found: string;
    },
    opts: {
        isStockOrder: boolean;
        isVolumeOrder: boolean;
        onCalcChange: (field: TradeCalcField, v: string) => void;
        investorCodeSet?: Set<string>;
        allowedSectors?: string[];
    },
): TradeFieldConfig[] => {
    const { isStockOrder, isVolumeOrder, onCalcChange, investorCodeSet, allowedSectors } = opts;
    return [
        {
            name: 'ma_gd',
            label: labels.ma_gd,
            required: true,
            placeholder: 'VD: GD-0001',
            validate: requiredText(errors.required),
        },
        {
            name: 'ngay_gd',
            label: labels.ngay_gd,
            required: true,
            type: 'date',
            validate: requiredValue(errors.required),
        },
        {
            name: 'ma_ndt',
            label: labels.ma_ndt,
            required: true,
            placeholder: 'VD: NDT-001',
            validate: (v) => {
                if (!v.trim()) return errors.required;
                const u = v.trim().toUpperCase();
                if (investorCodeSet && !investorCodeSet.has(u)) return errors.investor_not_found;
                return undefined;
            },
        },
        {
            name: 'ngay_khop',
            label: labels.ngay_khop,
            required: isStockOrder,
            type: 'date',
            validate: (v) => (isStockOrder && !v ? errors.required : undefined),
        },
        {
            name: 'ma_ck',
            label: labels.ma_ck,
            required: isStockOrder,
            placeholder: 'VD: HPG',
            validate: (v) => (isStockOrder && !v.trim() ? errors.required : undefined),
        },
        {
            name: 'nganh',
            label: labels.nganh,
            required: isStockOrder,
            placeholder: 'VD: Vật liệu',
            validate: (v) => {
                if (!isStockOrder) return undefined;
                if (allowedSectors !== undefined) {
                    if (allowedSectors.length === 0) return errors.no_sectors_in_data;
                    if (!v.trim()) return errors.required;
                    const ok = allowedSectors.some((s) => s === v.trim());
                    return ok ? undefined : errors.sector_not_in_data;
                }
                return !v.trim() ? errors.required : undefined;
            },
        },
        {
            name: 'khoi_luong',
            label: labels.khoi_luong,
            required: isVolumeOrder,
            type: 'number',
            min: 1,
            placeholder: 'VD: 10000',
            validate: (v) =>
                isVolumeOrder && (!v || Number(v) <= 0) ? errors.required : undefined,
            onChangeSideEffect: (v) => onCalcChange('khoi_luong', v),
        },
        {
            name: 'gia_khop',
            label: labels.gia_khop,
            required: isVolumeOrder,
            type: 'number',
            min: 1,
            placeholder: 'VD: 28500',
            validate: (v) =>
                isVolumeOrder && (!v || Number(v) <= 0) ? errors.required : undefined,
            onChangeSideEffect: (v) => onCalcChange('gia_khop', v),
        },
        {
            name: 'phi_gd',
            label: labels.phi_gd,
            type: 'number',
            min: 0,
            placeholder: 'VD: 50000 (mặc định 0)',
            onChangeSideEffect: (v) => onCalcChange('phi_gd', v),
        },
        {
            name: 'thue',
            label: labels.thue,
            type: 'number',
            min: 0,
            placeholder: 'VD: 0',
            onChangeSideEffect: (v) => onCalcChange('thue', v),
        },
        {
            name: 'tong_tien',
            label: isVolumeOrder ? `${labels.tong_tien} — tự tính` : labels.tong_tien,
            required: true,
            type: 'number',
            placeholder: 'VD: -6329480000 (âm = chi tiền)',
            validate: (v) => (v === '' || v === undefined ? errors.required : undefined),
        },
    ];
};

export type InvestorFieldConfig = {
    name:
        | 'ma_ndt'
        | 'ho_ten'
        | 'so_dien_thoai'
        | 'ngay_uy_thac'
        | 'rm_phu_trach'
        | 'rm_id'
        | 'von_uy_thac_vnd';
    label: string;
    required?: boolean;
    type?: 'text' | 'date' | 'number';
    min?: number;
    placeholder?: string;
    validate?: (v: string) => string | undefined;
};

export const createInvestorFieldConfigs = (
    labels: {
        ma_ndt: string;
        ho_ten: string;
        so_dien_thoai: string;
        ngay_uy_thac: string;
        rm_phu_trach: string;
        rm_id: string;
        von_uy_thac_vnd: string;
    },
    errors: { required: string; phone_invalid: string },
): InvestorFieldConfig[] => [
    {
        name: 'ma_ndt',
        label: labels.ma_ndt,
        required: true,
        placeholder: 'NĐT-001',
        validate: requiredText(errors.required),
    },
    {
        name: 'ho_ten',
        label: labels.ho_ten,
        required: true,
        placeholder: 'Nguyễn Văn A',
        validate: requiredText(errors.required),
    },
    {
        name: 'so_dien_thoai',
        label: labels.so_dien_thoai,
        required: true,
        placeholder: '0901234567',
        validate: (v) =>
            !v.trim()
                ? errors.required
                : !/^0\d{9}$/.test(v.trim())
                  ? errors.phone_invalid
                  : undefined,
    },
    {
        name: 'ngay_uy_thac',
        label: labels.ngay_uy_thac,
        required: true,
        type: 'date',
        validate: requiredValue(errors.required),
    },
    { name: 'rm_phu_trach', label: labels.rm_phu_trach, placeholder: 'Linh Trang' },
    { name: 'rm_id', label: labels.rm_id, placeholder: 'rm1' },
    {
        name: 'von_uy_thac_vnd',
        label: labels.von_uy_thac_vnd,
        required: true,
        type: 'number',
        min: 0,
        placeholder: '100000000',
        validate: (v) => (!v || Number(v) <= 0 ? errors.required : undefined),
    },
];

type EncWriteOp =
    | { kind: 'add'; row: { iv: Uint8Array; ct: Uint8Array } }
    | { kind: 'put'; row: EncRecord }
    | { kind: 'delete'; id: number };

const runEncWriteOps = async (
    table: Table<EncRecord, number>,
    ops: EncWriteOp[],
): Promise<void> => {
    for (const op of ops) {
        if (op.kind === 'delete') await table.delete(op.id);
        else if (op.kind === 'put') await table.put(op.row);
        else await table.add(op.row);
    }
};

const isStockOrderType = (t: Pick<Transaction, 'loai_lenh'>): boolean =>
    t.loai_lenh === TRADE_ORDER_TYPE.BUY ||
    t.loai_lenh === TRADE_ORDER_TYPE.SELL ||
    t.loai_lenh === TRADE_ORDER_TYPE.BONUS_STOCK;

export async function planHoldingMutations(
    txList: Omit<Transaction, 'id'>[],
    dek: CryptoKey,
): Promise<EncWriteOp[]> {
    const stockTx = txList.filter(isStockOrderType).sort((a, b) => {
        const ka = a.ngay_khop || a.ngay_gd;
        const kb = b.ngay_khop || b.ngay_gd;
        return ka < kb ? -1 : ka > kb ? 1 : 0;
    });
    if (stockTx.length === 0) return [];

    const existing = await encLoadAll<Holding>(fundDb.holdings, dek, RECORD_TYPE.HOLDING);
    type Entry = { id?: number; data: Omit<Holding, 'id'>; dirty: boolean; deleted: boolean };
    const byKey = new Map<string, Entry>();
    for (const h of existing) {
        const { id, ...data } = h;
        byKey.set(`${h.ma_ndt}|${h.ma_ck}`, { id, data, dirty: false, deleted: false });
    }

    for (const tx of stockTx) {
        const key = `${tx.ma_ndt}|${tx.ma_ck}`;
        const isBuy =
            tx.loai_lenh === TRADE_ORDER_TYPE.BUY || tx.loai_lenh === TRADE_ORDER_TYPE.BONUS_STOCK;
        const isSell = tx.loai_lenh === TRADE_ORDER_TYPE.SELL;
        const entry = byKey.get(key);

        if (isBuy) {
            if (entry && !entry.deleted) {
                entry.data.avg_cost = calcNewAvgCost(
                    entry.data.khoi_luong,
                    entry.data.avg_cost,
                    tx.khoi_luong,
                    tx.gia_khop,
                    tx.phi_gd,
                );
                entry.data.khoi_luong += tx.khoi_luong;
                entry.dirty = true;
            } else {
                const firstAvg =
                    tx.khoi_luong > 0
                        ? (tx.khoi_luong * tx.gia_khop + tx.phi_gd) / tx.khoi_luong
                        : tx.gia_khop;
                byKey.set(key, {
                    id: entry?.id,
                    data: {
                        ma_ndt: tx.ma_ndt,
                        ma_ck: tx.ma_ck,
                        nganh: tx.nganh,
                        khoi_luong: tx.khoi_luong,
                        avg_cost: firstAvg,
                        tieu_khoan: tx.tieu_khoan,
                    },
                    dirty: true,
                    deleted: false,
                });
            }
        } else if (isSell && entry && !entry.deleted) {
            entry.data.khoi_luong -= tx.khoi_luong;
            if (entry.data.khoi_luong > 0) {
                entry.dirty = true;
            } else {
                entry.deleted = true;
            }
        }
    }

    const ops: EncWriteOp[] = [];
    for (const entry of Array.from(byKey.values())) {
        if (entry.deleted) {
            if (entry.id != null) ops.push({ kind: 'delete', id: entry.id });
        } else if (entry.dirty) {
            const { iv, ct } = await encryptRecord(dek, RECORD_TYPE.HOLDING, entry.data);
            ops.push(
                entry.id != null
                    ? { kind: 'put', row: { id: entry.id, iv, ct } }
                    : { kind: 'add', row: { iv, ct } },
            );
        }
    }
    return ops;
}

export async function commitTransactionImport(
    dek: CryptoKey,
    rows: Omit<Transaction, 'id' | 'import_batch_id'>[],
    batchMeta: Omit<ImportBatch, 'id'>,
): Promise<void> {
    const holdingOps = await planHoldingMutations(rows as Omit<Transaction, 'id'>[], dek);
    const encBatch = await encryptRecord(dek, RECORD_TYPE.IMPORT_BATCH, batchMeta);

    await fundDb.transaction(
        'rw',
        fundDb.import_batches,
        fundDb.transactions,
        fundDb.holdings,
        async () => {
            const batchId = await fundDb.import_batches.add({
                iv: encBatch.iv,
                ct: encBatch.ct,
            });
            const txToInsert: Omit<Transaction, 'id'>[] = rows.map((r) => ({
                ...r,
                import_batch_id: batchId,
            }));
            const encTx = await Dexie.waitFor(
                Promise.all(txToInsert.map((t) => encryptRecord(dek, RECORD_TYPE.TRANSACTION, t))),
            );
            await fundDb.transactions.bulkAdd(encTx.map(({ iv, ct }) => ({ iv, ct })));
            await runEncWriteOps(fundDb.holdings, holdingOps);
        },
    );
}

export const computeManualTongTien = (input: {
    loai_lenh: Transaction['loai_lenh'];
    khoi_luong: number;
    gia_khop: number;
    phi_gd: number;
    thue: number;
    tong_tien: number;
}): number => {
    const fee = Math.max(0, Math.round(input.phi_gd || 0));
    const tax = Math.max(0, Math.round(input.thue || 0));
    const gross = (input.khoi_luong || 0) * (input.gia_khop || 0);
    const raw = Math.round(input.tong_tien || 0);
    switch (input.loai_lenh) {
        case TRADE_ORDER_TYPE.BUY:
            return -Math.round(gross + fee);
        case TRADE_ORDER_TYPE.SELL:
            return Math.round(gross - fee - tax);
        case TRADE_ORDER_TYPE.DIVIDEND:
        case TRADE_ORDER_TYPE.DEPOSIT:
            return Math.abs(raw);
        case TRADE_ORDER_TYPE.WITHDRAW:
        case TRADE_ORDER_TYPE.FEE:
            return -Math.abs(raw);
        case TRADE_ORDER_TYPE.BONUS_STOCK:
            return 0;
        default:
            return raw;
    }
};

export const getStepStates = (
    stepKeys: readonly string[],
    displaySteps: readonly unknown[],
    step: string,
): FundStepState[] => {
    const idx = stepKeys.indexOf(step);
    return displaySteps.map((_, i) => (i < idx ? 'done' : i === idx ? 'active' : 'idle'));
};

type FundTradePreviewColumnsLabels = {
    ma_gd: string;
    ma_ndt: string;
    loai_lenh: string;
    ma_ck: string;
    khoi_luong: string;
    gia_khop: string;
    tong_tien: string;
};

export const createFundTradePreviewColumns = (
    labels: FundTradePreviewColumnsLabels,
): FundTradePreviewCol[] => [
    { key: 'ma_gd', label: labels.ma_gd, align: 'left' },
    { key: 'ma_ndt', label: labels.ma_ndt, align: 'left' },
    { key: 'loai_lenh', label: labels.loai_lenh, align: 'left' },
    { key: 'ma_ck', label: labels.ma_ck, align: 'left' },
    { key: 'khoi_luong', label: labels.khoi_luong, align: 'right' },
    { key: 'gia_khop', label: labels.gia_khop, align: 'right' },
    { key: 'tong_tien', label: labels.tong_tien, align: 'right' },
];

type FundInvestorPreviewColumnsLabels = {
    ma_ndt: string;
    ho_ten: string;
    so_dien_thoai: string;
    rm_phu_trach: string;
    von_uy_thac_vnd: string;
    trang_thai: string;
    thesis: string;
};

export const createFundInvestorPreviewColumns = (
    labels: FundInvestorPreviewColumnsLabels,
): FundInvestorPreviewCol[] => [
    { key: 'ma_ndt', label: labels.ma_ndt, align: 'left' },
    { key: 'ho_ten', label: labels.ho_ten, align: 'left' },
    { key: 'so_dien_thoai', label: labels.so_dien_thoai, align: 'left' },
    { key: 'rm_phu_trach', label: labels.rm_phu_trach, align: 'left' },
    { key: 'von_uy_thac_vnd', label: labels.von_uy_thac_vnd, align: 'right' },
    { key: 'trang_thai', label: labels.trang_thai, align: 'left' },
    { key: 'thesis', label: labels.thesis, align: 'left' },
    { key: '_action', label: '', align: 'center' },
];
