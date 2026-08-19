import { create } from 'zustand';

import { RECORD_TYPE, TRADE_ORDER_TYPE, TRADE_ORDER_TYPE_VALUES } from '@/constants/fund';
import { Investor, Transaction, encLoadAll, fundDb } from '@/db/fund';
import { useFundDataStore } from '@/stores/fund/useFundDataStore';
import { useFundVaultStore } from '@/stores/fund/useFundVaultStore';
import { registerResettableStore } from '@/stores/reset-registry';
import {
    RawTransaction,
    commitTransactionImport,
    computeManualTongTien,
    isValidTransactionCsvTemplate,
    parseTransactionCsv,
    readImportFileAsCsvText,
} from '@/utils/fund/fund';

export type ImportStep = 'upload' | 'preview' | 'done';

export type TradeDraft = {
    loai_lenh: Transaction['loai_lenh'];
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
};

type FundImportState = {
    step: ImportStep;
    fileName: string;
    parsedRows: RawTransaction[];
    error: string | null;
    missingInvestorCodes: string[];
    tradeDraft: TradeDraft | null;
};

type FundImportActions = {
    setTradeDraft: (draft: TradeDraft | null) => void;
    parseFile: (file: File) => Promise<void>;
    createManualOrder: (input: {
        ma_gd: string;
        ma_ndt: string;
        ngay_khop: string;
        ma_ck: string;
        loai_lenh: Transaction['loai_lenh'];
        khoi_luong: number;
        gia_khop: number;
        phi_gd: number;
        thue: number;
        tong_tien: number;
        ngay_gd: string;
        nganh?: string;
    }) => Promise<void>;
    confirmImport: () => Promise<void>;
    resetStore: () => void;
};

const initialState: FundImportState = {
    step: 'upload',
    fileName: '',
    parsedRows: [],
    error: null,
    missingInvestorCodes: [],
    tradeDraft: null,
};

export const useFundTradeStore = create<FundImportState & FundImportActions>((set, get) => ({
    ...initialState,

    setTradeDraft: (draft) => set({ tradeDraft: draft }),

    parseFile: async (file) => {
        set({ error: null, missingInvestorCodes: [], fileName: file.name });
        try {
            const text = await readImportFileAsCsvText(file);
            if (!isValidTransactionCsvTemplate(text)) {
                set({ error: 'invalid_template' });
                return;
            }
            const parsedRows = parseTransactionCsv(text);
            if (parsedRows.length === 0) {
                set({ error: 'invalid_file' });
                return;
            }

            const dek = useFundVaultStore.getState().dek;
            if (!dek) {
                set({ error: 'parse_error' });
                return;
            }
            const investors = await encLoadAll<Investor>(
                fundDb.investors,
                dek,
                RECORD_TYPE.INVESTOR,
            );
            if (investors.length === 0) {
                set({ error: 'no_investors' });
                return;
            }

            const investorIds = new Set(investors.map((i) => i.ma_ndt.trim().toUpperCase()));
            const unknownCodes = new Set<string>();

            for (const r of parsedRows) {
                const raw = (r.ma_ndt ?? '').trim();
                if (!raw) continue;
                if (!investorIds.has(raw.toUpperCase())) unknownCodes.add(raw.toUpperCase());
            }

            if (unknownCodes.size > 0) {
                const missingInvestorCodes = Array.from(unknownCodes).sort((a, b) =>
                    a.localeCompare(b),
                );
                set({
                    error: 'unknown_investors',
                    missingInvestorCodes,
                });
                return;
            }

            set({ parsedRows, step: 'preview' });
        } catch {
            set({ error: 'parse_error' });
        }
    },

    createManualOrder: async (input) => {
        set({
            error: null,
            missingInvestorCodes: [],
            fileName: 'manual-entry',
        });
        try {
            const dek = useFundVaultStore.getState().dek;
            if (!dek) {
                set({ error: 'import_error' });
                return;
            }
            const investors = await encLoadAll<Investor>(
                fundDb.investors,
                dek,
                RECORD_TYPE.INVESTOR,
            );
            if (investors.length === 0) {
                set({ error: 'no_investors' });
                return;
            }
            const investorIds = new Set(investors.map((i) => i.ma_ndt.trim().toUpperCase()));

            const orderId = input.ma_gd.trim() || `MANUAL_${Date.now()}`;
            const normalizedLoaiLenh: Transaction['loai_lenh'] = TRADE_ORDER_TYPE_VALUES.includes(
                input.loai_lenh,
            )
                ? input.loai_lenh
                : TRADE_ORDER_TYPE.BUY;
            const maNdt = input.ma_ndt.trim().toUpperCase();
            const fee = Math.max(0, Math.round(input.phi_gd || 0));
            const tax = Math.max(0, Math.round(input.thue || 0));
            const tong_tien = computeManualTongTien({
                loai_lenh: normalizedLoaiLenh,
                khoi_luong: input.khoi_luong,
                gia_khop: input.gia_khop,
                phi_gd: fee,
                thue: tax,
                tong_tien: input.tong_tien,
            });

            const raw: RawTransaction = {
                ma_gd: orderId,
                ngay_gd: input.ngay_gd,
                ngay_khop: input.ngay_khop,
                ma_ndt: maNdt,
                loai_lenh: normalizedLoaiLenh,
                ma_ck: input.ma_ck.toUpperCase(),
                nganh: input.nganh ?? '',
                khoi_luong: input.khoi_luong,
                gia_khop: input.gia_khop,
                phi_gd: fee,
                thue: tax,
                tong_tien,
                tieu_khoan: '',
            };

            if (!investorIds.has(maNdt)) {
                set({
                    error: 'unknown_investors',
                    missingInvestorCodes: [maNdt],
                });
                return;
            }

            set({
                parsedRows: [raw],
                step: 'preview',
            });
        } catch {
            set({ error: 'import_error' });
        }
    },

    confirmImport: async () => {
        set({ error: null });
        try {
            const { parsedRows, fileName } = get();
            const validRows = parsedRows.filter(
                (r) => !r._invalidFields || r._invalidFields.length === 0,
            );

            if (validRows.length === 0) {
                set({ error: 'all_rows_invalid' });
                return;
            }

            const dek = useFundVaultStore.getState().dek;
            if (!dek) {
                set({ error: 'import_error' });
                return;
            }

            const existingTx = await encLoadAll<Transaction>(
                fundDb.transactions,
                dek,
                RECORD_TYPE.TRANSACTION,
            );
            const existingGd = new Set(existingTx.map((t) => t.ma_gd.trim().toUpperCase()));
            const seenGd = new Set<string>();
            const rowsToImport = validRows.filter((r) => {
                const key = r.ma_gd.trim().toUpperCase();
                if (!key || existingGd.has(key) || seenGd.has(key)) return false;
                seenGd.add(key);
                return true;
            });

            if (rowsToImport.length === 0) {
                set({ error: 'all_duplicates' });
                return;
            }

            const ngay_gd = rowsToImport[0]?.ngay_gd ?? new Date().toISOString().slice(0, 10);

            await commitTransactionImport(
                dek,
                rowsToImport.map((row) => ({
                    ma_gd: row.ma_gd,
                    ma_ndt: row.ma_ndt,
                    ngay_gd: row.ngay_gd,
                    ngay_khop: row.ngay_khop,
                    loai_lenh: row.loai_lenh as Transaction['loai_lenh'],
                    ma_ck: row.ma_ck,
                    nganh: row.nganh,
                    khoi_luong: row.khoi_luong,
                    gia_khop: row.gia_khop,
                    phi_gd: row.phi_gd,
                    thue: row.thue,
                    tong_tien: row.tong_tien,
                    tieu_khoan: row.tieu_khoan,
                })),
                {
                    imported_at: new Date().toISOString(),
                    file_name: fileName,
                    ngay_gd,
                    transaction_count: rowsToImport.length,
                    status: 'confirmed',
                },
            );

            await useFundDataStore.getState().loadData();
            set({ step: 'done' });
        } catch {
            set({ error: 'import_error' });
        }
    },

    resetStore: () => set({ ...initialState, tradeDraft: get().tradeDraft }),
}));

registerResettableStore(useFundTradeStore);
