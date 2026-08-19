import { create } from 'zustand';

import { RECORD_TYPE } from '@/constants/fund';
import { Investor, encAdd, encLoadAll, encPut, fundDb } from '@/db/fund';
import { useFundDataStore } from '@/stores/fund/useFundDataStore';
import { useFundVaultStore } from '@/stores/fund/useFundVaultStore';
import { registerResettableStore } from '@/stores/reset-registry';
import {
    RawInvestor,
    isValidInvestorCsvTemplate,
    parseInvestorCsv,
    readImportFileAsCsvText,
} from '@/utils/fund/fund';

export type InvestorImportStep = 'upload' | 'preview' | 'done';

export type InvestorDraft = {
    ma_ndt: string;
    ho_ten: string;
    so_dien_thoai: string;
    ngay_uy_thac: string;
    rm_phu_trach: string;
    rm_id: string;
    von_uy_thac_vnd: string;
    trang_thai: 'active' | 'watch';
    thesis: { sector: string; pct: string }[];
};

type InvestorImportState = {
    step: InvestorImportStep;
    fileName: string;
    parsedInvestors: RawInvestor[];
    existingIds: Set<string>;
    error: string | null;
    importedCount: number;
    investorDraft: InvestorDraft | null;
};

type InvestorImportActions = {
    setInvestorDraft: (draft: InvestorDraft | null) => void;
    parseFile: (file: File) => Promise<void>;
    createManualInvestor: (input: {
        ma_ndt: string;
        ho_ten: string;
        so_dien_thoai: string;
        ngay_uy_thac: string;
        rm_phu_trach: string;
        rm_id: string;
        von_uy_thac_vnd: number;
        trang_thai: Investor['trang_thai'];
        thesis: { sector: string; pct: number }[];
    }) => Promise<void>;
    confirmImport: () => Promise<void>;
    resetStore: () => void;
};

const initialState: InvestorImportState = {
    step: 'upload',
    fileName: '',
    parsedInvestors: [],
    existingIds: new Set(),
    error: null,
    importedCount: 0,
    investorDraft: null,
};

export const useFundInvestorStore = create<InvestorImportState & InvestorImportActions>((set) => ({
    ...initialState,

    setInvestorDraft: (draft) => set({ investorDraft: draft }),

    parseFile: async (file) => {
        set({ error: null, fileName: file.name });
        try {
            const text = await readImportFileAsCsvText(file);
            if (!isValidInvestorCsvTemplate(text)) {
                set({ error: 'invalid_template' });
                return;
            }
            const parsedInvestors = parseInvestorCsv(text);

            if (parsedInvestors.length === 0) {
                set({ error: 'empty_file' });
                return;
            }

            const dek = useFundVaultStore.getState().dek;
            if (!dek) {
                set({ error: 'parse_error' });
                return;
            }
            const allExisting = await encLoadAll<Investor>(
                fundDb.investors,
                dek,
                RECORD_TYPE.INVESTOR,
            );
            const existingIds = new Set(allExisting.map((i) => i.ma_ndt));

            set({ parsedInvestors, existingIds, step: 'preview' });
        } catch {
            set({ error: 'parse_error' });
        }
    },

    createManualInvestor: async (input) => {
        set({ error: null, fileName: 'manual-entry' });
        try {
            const dek = useFundVaultStore.getState().dek;
            if (!dek) {
                set({ error: 'import_error' });
                return;
            }
            const maNdt = input.ma_ndt.trim().toUpperCase();
            const all = await encLoadAll<Investor>(fundDb.investors, dek, RECORD_TYPE.INVESTOR);
            const existing = all.find((i) => i.ma_ndt === maNdt);
            const investorData: Omit<Investor, 'id'> = {
                ma_ndt: maNdt,
                ho_ten: input.ho_ten,
                so_dien_thoai: input.so_dien_thoai,
                ngay_uy_thac: input.ngay_uy_thac,
                rm_phu_trach: input.rm_phu_trach,
                rm_id: input.rm_id,
                von_uy_thac_vnd: input.von_uy_thac_vnd,
                trang_thai: input.trang_thai,
                thesis: input.thesis,
            };

            if (existing) {
                await encPut(
                    fundDb.investors,
                    dek,
                    RECORD_TYPE.INVESTOR,
                    existing.id,
                    investorData,
                );
            } else {
                await encAdd(fundDb.investors, dek, RECORD_TYPE.INVESTOR, investorData);
            }

            await useFundDataStore.getState().loadData();
            set({
                importedCount: 1,
                parsedInvestors: [],
                existingIds: new Set(),
                step: 'done',
            });
        } catch {
            set({ error: 'import_error' });
        }
    },

    confirmImport: async () => {
        set({ error: null });
        try {
            const { parsedInvestors } = useFundInvestorStore.getState();
            const validInvestors = parsedInvestors.filter(
                (r) => !r._invalidFields || r._invalidFields.length === 0,
            );

            if (validInvestors.length === 0) {
                set({ error: 'all_rows_invalid' });
                return;
            }

            const investorsToSave: Omit<Investor, 'id'>[] = validInvestors.map((raw) => ({
                ma_ndt: raw.ma_ndt,
                ho_ten: raw.ho_ten,
                so_dien_thoai: raw.so_dien_thoai,
                ngay_uy_thac: raw.ngay_uy_thac,
                rm_phu_trach: raw.rm_phu_trach,
                rm_id: raw.rm_id,
                von_uy_thac_vnd: raw.von_uy_thac_vnd,
                trang_thai: raw.trang_thai,
                thesis: raw.thesis,
            }));

            const dek = useFundVaultStore.getState().dek;
            if (!dek) {
                set({ error: 'import_error' });
                return;
            }
            const existingAll = await encLoadAll<Investor>(
                fundDb.investors,
                dek,
                RECORD_TYPE.INVESTOR,
            );
            const idByMaNdt = new Map(existingAll.map((i) => [i.ma_ndt, i.id]));
            for (const inv of investorsToSave) {
                const id = idByMaNdt.get(inv.ma_ndt);
                if (id != null) {
                    await encPut(fundDb.investors, dek, RECORD_TYPE.INVESTOR, id, inv);
                } else {
                    const newId = await encAdd(fundDb.investors, dek, RECORD_TYPE.INVESTOR, inv);
                    idByMaNdt.set(inv.ma_ndt, newId);
                }
            }

            await useFundDataStore.getState().loadData();
            set({ step: 'done', importedCount: investorsToSave.length });
        } catch {
            set({ error: 'import_error' });
        }
    },

    resetStore: () => set((s) => ({ ...initialState, investorDraft: s.investorDraft })),
}));

registerResettableStore(useFundInvestorStore);
