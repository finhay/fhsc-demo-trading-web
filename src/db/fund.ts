import Dexie, { type Table } from 'dexie';

import { VAULT_SELF_GRANTEE } from '@/constants/fund';
import { decryptRecord, encryptRecord } from '@/utils/fund/fund-crypto';

export type InvestorThesis = {
    sector: string;
    pct: number;
};

export type Investor = {
    id?: number;
    ma_ndt: string;
    ho_ten: string;
    so_dien_thoai: string;
    ngay_uy_thac: string;
    rm_phu_trach: string;
    rm_id: string;
    von_uy_thac_vnd: number;
    trang_thai: 'active' | 'watch';
    thesis: InvestorThesis[];
};

export type Transaction = {
    id?: number;
    ma_gd: string;
    ma_ndt: string;
    ngay_gd: string;
    ngay_khop: string;
    loai_lenh: 'MUA' | 'BAN' | 'NOP_VON' | 'RUT_VON' | 'CO_TUC' | 'PHI' | 'CO_PHIEU_THUONG';
    ma_ck: string;
    nganh: string;
    khoi_luong: number;
    gia_khop: number;
    phi_gd: number;
    thue: number;
    tong_tien: number;
    tieu_khoan: string;
    import_batch_id: number;
};

export type Holding = {
    id?: number;
    ma_ndt: string;
    ma_ck: string;
    nganh: string;
    khoi_luong: number;
    avg_cost: number;
    tieu_khoan: string;
};

export type NavSnapshot = {
    id?: number;
    ma_ndt: string;
    snapshot_date: string;
    nav: number;
    cash_balance: number;
    stock_value: number;
};

export type ImportBatch = {
    id?: number;
    imported_at: string;
    file_name: string;
    ngay_gd: string;
    transaction_count: number;
    status: 'confirmed' | 'pending';
};

export type WrappedBlob = { iv: Uint8Array; ct: Uint8Array };

export type EncRecord = {
    id?: number;
    iv: Uint8Array;
    ct: Uint8Array;
};

export type VaultMetaRow = {
    id?: number;
    v: number;
    accountSalt: Uint8Array;
    publicKey: Uint8Array;
    wrappedPrivateKey: WrappedBlob;
    wrappedPrivateKeyRecovery: WrappedBlob;
    createdAt: string;
};

export type DekGrantRow = {
    id?: number;
    granteeId: string;
    sealedDEK: Uint8Array;
};

export type DeviceCacheRow = {
    id?: number;
    deviceKey: CryptoKey;
    wrappedSecretKey: WrappedBlob;
};

type FundDb = Dexie & {
    investors: Table<EncRecord>;
    transactions: Table<EncRecord>;
    holdings: Table<EncRecord>;
    nav_snapshots: Table<EncRecord>;
    import_batches: Table<EncRecord>;
    vault_meta: Table<VaultMetaRow>;
    dek_grants: Table<DekGrantRow>;
    vault_device: Table<DeviceCacheRow>;
};

const createFundDb = (): FundDb => {
    const db = new Dexie('fundDb') as FundDb;

    db.version(1).stores({
        investors: '++id, &ma_ndt, rm_id, trang_thai',
        transactions: '++id, ma_ndt, ngay_gd, ma_ck, import_batch_id',
        holdings: '++id, [ma_ndt+ma_ck], ma_ndt, ma_ck, nganh',
        nav_snapshots: '++id, ma_ndt, snapshot_date, [ma_ndt+snapshot_date]',
        import_batches: '++id, ngay_gd, status',
    });

    db.version(2).stores({
        vault_meta: '++id',
        dek_grants: '++id, granteeId',
        vault_device: '++id',
    });

    db.version(3)
        .stores({
            investors: '++id',
            transactions: '++id',
            holdings: '++id',
            nav_snapshots: '++id',
            import_batches: '++id',
        })
        .upgrade(async (tx) => {
            await Promise.all([
                tx.table('investors').clear(),
                tx.table('transactions').clear(),
                tx.table('holdings').clear(),
                tx.table('nav_snapshots').clear(),
                tx.table('import_batches').clear(),
            ]);
        });

    return db;
};

export const fundDb = createFundDb();

export const getVaultMeta = (): Promise<VaultMetaRow | undefined> =>
    fundDb.vault_meta.toCollection().first();

export const putVaultMeta = (meta: VaultMetaRow): Promise<void> =>
    fundDb.transaction('rw', fundDb.vault_meta, async () => {
        await fundDb.vault_meta.clear();
        await fundDb.vault_meta.add(meta);
    });

export const getSelfGrant = (): Promise<DekGrantRow | undefined> =>
    fundDb.dek_grants.where('granteeId').equals(VAULT_SELF_GRANTEE).first();

export const putSelfGrant = (sealedDEK: Uint8Array): Promise<void> =>
    fundDb.transaction('rw', fundDb.dek_grants, async () => {
        await fundDb.dek_grants.where('granteeId').equals(VAULT_SELF_GRANTEE).delete();
        await fundDb.dek_grants.add({ granteeId: VAULT_SELF_GRANTEE, sealedDEK });
    });

export const initVaultAtomic = (meta: VaultMetaRow, sealedDEK: Uint8Array): Promise<void> =>
    fundDb.transaction('rw', fundDb.vault_meta, fundDb.dek_grants, async () => {
        await fundDb.vault_meta.clear();
        await fundDb.dek_grants.clear();
        await fundDb.vault_meta.add(meta);
        await fundDb.dek_grants.add({ granteeId: VAULT_SELF_GRANTEE, sealedDEK });
    });

export const getDeviceCache = (): Promise<DeviceCacheRow | undefined> =>
    fundDb.vault_device.toCollection().first();

export const putDeviceCache = (row: DeviceCacheRow): Promise<void> =>
    fundDb.transaction('rw', fundDb.vault_device, async () => {
        await fundDb.vault_device.clear();
        await fundDb.vault_device.add(row);
    });

export const clearDeviceCache = (): Promise<void> => fundDb.vault_device.clear();

export const encLoadAll = async <T>(
    table: Table<EncRecord, number>,
    dek: CryptoKey,
    type: string,
): Promise<(T & { id: number })[]> => {
    const rows = await table.toArray();
    return Promise.all(
        rows.map(async (r) => ({
            ...(await decryptRecord<T>(dek, type, r)),
            id: r.id as number,
        })),
    );
};

export const encLoadAllLenient = async <T>(
    table: Table<EncRecord, number>,
    dek: CryptoKey,
    type: string,
): Promise<{ rows: (T & { id: number })[]; failedCount: number }> => {
    const rows = await table.toArray();
    const out: (T & { id: number })[] = [];
    let failedCount = 0;
    await Promise.all(
        rows.map(async (r) => {
            try {
                out.push({ ...(await decryptRecord<T>(dek, type, r)), id: r.id as number });
            } catch {
                failedCount += 1;
            }
        }),
    );
    return { rows: out, failedCount };
};

export const encAdd = async (
    table: Table<EncRecord, number>,
    dek: CryptoKey,
    type: string,
    rec: unknown,
): Promise<number> => {
    const { iv, ct } = await encryptRecord(dek, type, rec);
    return table.add({ iv, ct });
};

export const encBulkAdd = async (
    table: Table<EncRecord, number>,
    dek: CryptoKey,
    type: string,
    recs: unknown[],
): Promise<void> => {
    const rows = await Promise.all(
        recs.map(async (rec) => {
            const { iv, ct } = await encryptRecord(dek, type, rec);
            return { iv, ct };
        }),
    );
    await table.bulkAdd(rows);
};

export const encPut = async (
    table: Table<EncRecord, number>,
    dek: CryptoKey,
    type: string,
    id: number,
    rec: unknown,
): Promise<void> => {
    const { iv, ct } = await encryptRecord(dek, type, rec);
    await table.put({ id, iv, ct });
};
