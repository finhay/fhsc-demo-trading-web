import { VAULT_BACKUP_MAGIC, VAULT_SCHEMA_VERSION } from '@/constants/fund';
import { type EncRecord, fundDb } from '@/db/fund';

const b64 = (u: Uint8Array): string => {
    let s = '';
    for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]);
    return btoa(s);
};

const unb64 = (s: string): Uint8Array => {
    const bin = atob(s);
    const u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return u;
};

type B64Blob = { iv: string; ct: string };
const wrapOut = (w: { iv: Uint8Array; ct: Uint8Array }): B64Blob => ({
    iv: b64(w.iv),
    ct: b64(w.ct),
});
const wrapIn = (w: B64Blob) => ({ iv: unb64(w.iv), ct: unb64(w.ct) });

type EncRowB64 = { id?: number } & B64Blob;
const rowOut = (r: EncRecord): EncRowB64 => ({ id: r.id, ...wrapOut(r) });
const rowIn = (r: EncRowB64): EncRecord => ({ id: r.id, ...wrapIn(r) });

const DATA_TABLES = [
    'investors',
    'transactions',
    'holdings',
    'nav_snapshots',
    'import_batches',
] as const;

type BackupFile = {
    magic: string;
    v: number;
    exportedAt: string;
    vault_meta: {
        id?: number;
        v: number;
        accountSalt: string;
        publicKey: string;
        wrappedPrivateKey: B64Blob;
        wrappedPrivateKeyRecovery: B64Blob;
        createdAt: string;
    } | null;
    dek_grants: { id?: number; granteeId: string; sealedDEK: string }[];
    data: Record<(typeof DATA_TABLES)[number], EncRowB64[]>;
};

export const exportVaultBackup = async (): Promise<Blob> => {
    const meta = await fundDb.vault_meta.toCollection().first();
    const grants = await fundDb.dek_grants.toArray();
    const data = {} as Record<(typeof DATA_TABLES)[number], EncRowB64[]>;
    for (const name of DATA_TABLES) {
        const rows = await fundDb.table<EncRecord>(name).toArray();
        data[name] = rows.map(rowOut);
    }

    const payload: BackupFile = {
        magic: VAULT_BACKUP_MAGIC,
        v: VAULT_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        vault_meta: meta
            ? {
                  id: meta.id,
                  v: meta.v,
                  accountSalt: b64(meta.accountSalt),
                  publicKey: b64(meta.publicKey),
                  wrappedPrivateKey: wrapOut(meta.wrappedPrivateKey),
                  wrappedPrivateKeyRecovery: wrapOut(meta.wrappedPrivateKeyRecovery),
                  createdAt: meta.createdAt,
              }
            : null,
        dek_grants: grants.map((g) => ({
            id: g.id,
            granteeId: g.granteeId,
            sealedDEK: b64(g.sealedDEK),
        })),
        data,
    };
    return new Blob([JSON.stringify(payload)], { type: 'application/octet-stream' });
};

const isB64Blob = (v: unknown): v is B64Blob => {
    if (typeof v !== 'object' || v === null) return false;
    const b = v as Record<string, unknown>;
    return typeof b.iv === 'string' && typeof b.ct === 'string';
};

const isValidBackupFile = (parsed: unknown): parsed is BackupFile => {
    if (typeof parsed !== 'object' || parsed === null) return false;
    const p = parsed as Record<string, unknown>;
    if (p.magic !== VAULT_BACKUP_MAGIC || typeof p.v !== 'number') return false;

    const meta = p.vault_meta;
    if (typeof meta !== 'object' || meta === null) return false;
    const m = meta as Record<string, unknown>;
    if (
        typeof m.accountSalt !== 'string' ||
        typeof m.publicKey !== 'string' ||
        !isB64Blob(m.wrappedPrivateKey) ||
        !isB64Blob(m.wrappedPrivateKeyRecovery)
    ) {
        return false;
    }

    if (!Array.isArray(p.dek_grants)) return false;

    const data = p.data;
    if (typeof data !== 'object' || data === null) return false;
    const d = data as Record<string, unknown>;
    return DATA_TABLES.every((name) => Array.isArray(d[name]));
};

export const importVaultBackup = async (file: Blob): Promise<void> => {
    let parsed: unknown;
    try {
        parsed = JSON.parse(await file.text());
    } catch {
        throw new Error('invalid_backup');
    }
    if (!isValidBackupFile(parsed)) {
        throw new Error('invalid_backup');
    }
    if (parsed.v > VAULT_SCHEMA_VERSION) {
        throw new Error('unsupported_version');
    }
    const meta = parsed.vault_meta;
    if (!meta) {
        throw new Error('invalid_backup');
    }

    await fundDb.transaction(
        'rw',
        [
            fundDb.vault_meta,
            fundDb.dek_grants,
            fundDb.vault_device,
            fundDb.investors,
            fundDb.transactions,
            fundDb.holdings,
            fundDb.nav_snapshots,
            fundDb.import_batches,
        ],
        async () => {
            await Promise.all([
                fundDb.vault_meta.clear(),
                fundDb.dek_grants.clear(),
                fundDb.vault_device.clear(),
                ...DATA_TABLES.map((name) => fundDb.table(name).clear()),
            ]);

            await fundDb.vault_meta.add({
                id: meta.id,
                v: meta.v,
                accountSalt: unb64(meta.accountSalt),
                publicKey: unb64(meta.publicKey),
                wrappedPrivateKey: wrapIn(meta.wrappedPrivateKey),
                wrappedPrivateKeyRecovery: wrapIn(meta.wrappedPrivateKeyRecovery),
                createdAt: meta.createdAt,
            });
            await fundDb.dek_grants.bulkAdd(
                parsed.dek_grants.map((g) => ({
                    id: g.id,
                    granteeId: g.granteeId,
                    sealedDEK: unb64(g.sealedDEK),
                })),
            );
            for (const name of DATA_TABLES) {
                await fundDb.table<EncRecord>(name).bulkAdd((parsed.data[name] ?? []).map(rowIn));
            }
        },
    );
};
