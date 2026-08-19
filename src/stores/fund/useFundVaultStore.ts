import { create } from 'zustand';

import { AUTO_LOCK_MS, PASSPHRASE_MIN_LENGTH, VAULT_SCHEMA_VERSION } from '@/constants/fund';
import {
    clearDeviceCache,
    getDeviceCache,
    getSelfGrant,
    getVaultMeta,
    initVaultAtomic,
    putDeviceCache,
    putVaultMeta,
} from '@/db/fund';
import type { VaultErrorCode, VaultStatus } from '@/types/pages/fund';
import {
    buildRecoveryKit,
    deriveKEK,
    deriveRecoveryKEK,
    generateAccountSalt,
    generateDEK,
    generateDeviceKey,
    generateKeyPair,
    generateSecretKey,
    importDekKey,
    openSealedDEK,
    parseSecretKey,
    sealDEKTo,
    unwrapPrivateKey,
    unwrapWithDeviceKey,
    wrapPrivateKey,
    wrapWithDeviceKey,
} from '@/utils/fund/fund-crypto';

type State = {
    status: VaultStatus;
    error: VaultErrorCode | null;
    requiresSecretKey: boolean;
    pendingRecoveryKit: string | null;
    dek: CryptoKey | null;
    dekRaw: Uint8Array | null;
    privateKey: Uint8Array | null;
};

type Actions = {
    refresh: () => Promise<void>;
    init: (passphrase: string) => Promise<string | null>;
    unlock: (passphrase: string, secretKeyInput?: string) => Promise<void>;
    recover: (secretKeyInput: string, newPassphrase: string) => Promise<void>;
    changePassphrase: (oldPass: string, newPass: string) => Promise<void>;
    lock: () => void;
    bumpActivity: () => void;
    acknowledgeRecoveryKit: () => void;
    reset: () => void;
};

const initialState: State = {
    status: 'loading',
    error: null,
    requiresSecretKey: false,
    pendingRecoveryKit: null,
    dek: null,
    dekRaw: null,
    privateKey: null,
};

let autoLockTimer: ReturnType<typeof setTimeout> | null = null;

const zeroize = (u: Uint8Array | null): void => {
    if (u) u.fill(0);
};

const clearAutoLock = (): void => {
    if (autoLockTimer) {
        clearTimeout(autoLockTimer);
        autoLockTimer = null;
    }
};

const cacheSecretKey = async (secretKey: Uint8Array): Promise<void> => {
    try {
        const deviceKey = await generateDeviceKey();
        const wrappedSecretKey = await wrapWithDeviceKey(secretKey, deviceKey);
        await putDeviceCache({ deviceKey, wrappedSecretKey });
    } catch {}
};

export const useFundVaultStore = create<State & Actions>((set, get) => {
    const startAutoLock = (): void => {
        clearAutoLock();
        autoLockTimer = setTimeout(() => get().lock(), AUTO_LOCK_MS);
        (autoLockTimer as { unref?: () => void })?.unref?.();
    };

    const enterUnlocked = (dek: CryptoKey, dekRaw: Uint8Array, privateKey: Uint8Array): void => {
        set({ status: 'unlocked', error: null, requiresSecretKey: false, dek, dekRaw, privateKey });
        startAutoLock();
    };

    return {
        ...initialState,

        refresh: async () => {
            const meta = await getVaultMeta();
            if (!meta) {
                set({ status: 'uninitialized', requiresSecretKey: false });
                return;
            }
            const device = await getDeviceCache();
            set({ status: 'locked', requiresSecretKey: !device });
        },

        init: async (passphrase) => {
            set({ error: null });
            if (passphrase.length < PASSPHRASE_MIN_LENGTH) {
                set({ error: 'weak_passphrase' });
                return null;
            }
            try {
                const secretKey = await generateSecretKey();
                const accountSalt = await generateAccountSalt();
                const { publicKey, privateKey } = await generateKeyPair();
                const dekRaw = await generateDEK();

                const kek = await deriveKEK(passphrase, secretKey, accountSalt);
                const wrappedPrivateKey = await wrapPrivateKey(privateKey, kek);
                const recoveryKek = await deriveRecoveryKEK(secretKey);
                const wrappedPrivateKeyRecovery = await wrapPrivateKey(privateKey, recoveryKek);
                const sealedDEK = await sealDEKTo(dekRaw, publicKey);

                await initVaultAtomic(
                    {
                        v: VAULT_SCHEMA_VERSION,
                        accountSalt,
                        publicKey,
                        wrappedPrivateKey,
                        wrappedPrivateKeyRecovery,
                        createdAt: new Date().toISOString(),
                    },
                    sealedDEK,
                );
                await cacheSecretKey(secretKey);

                const recoveryKit = await buildRecoveryKit(secretKey);
                const dek = await importDekKey(dekRaw);
                enterUnlocked(dek, dekRaw, privateKey);
                set({ pendingRecoveryKit: recoveryKit });
                return recoveryKit;
            } catch {
                set({ error: 'unknown' });
                return null;
            }
        },

        unlock: async (passphrase, secretKeyInput) => {
            set({ error: null });
            const meta = await getVaultMeta();
            if (!meta) {
                set({ error: 'not_initialized' });
                return;
            }
            try {
                let secretKey: Uint8Array;
                let cacheAfter = false;
                const device = await getDeviceCache();
                if (device) {
                    try {
                        secretKey = await unwrapWithDeviceKey(
                            device.wrappedSecretKey,
                            device.deviceKey,
                        );
                    } catch {
                        await clearDeviceCache();
                        set({ error: 'missing_secret_key', requiresSecretKey: true });
                        return;
                    }
                } else if (secretKeyInput) {
                    try {
                        secretKey = await parseSecretKey(secretKeyInput);
                    } catch {
                        set({ error: 'invalid_secret_key' });
                        return;
                    }
                    cacheAfter = true;
                } else {
                    set({ error: 'missing_secret_key', requiresSecretKey: true });
                    return;
                }

                const kek = await deriveKEK(passphrase, secretKey, meta.accountSalt);
                let privateKey: Uint8Array;
                try {
                    privateKey = await unwrapPrivateKey(meta.wrappedPrivateKey, kek);
                } catch {
                    set({ error: 'wrong_passphrase' });
                    return;
                }

                const grant = await getSelfGrant();
                if (!grant) {
                    set({ error: 'unknown' });
                    return;
                }
                const dekRaw = await openSealedDEK(grant.sealedDEK, {
                    publicKey: meta.publicKey,
                    privateKey,
                });
                if (cacheAfter) await cacheSecretKey(secretKey);
                const dek = await importDekKey(dekRaw);
                enterUnlocked(dek, dekRaw, privateKey);
            } catch {
                set({ error: 'unknown' });
            }
        },

        recover: async (secretKeyInput, newPassphrase) => {
            set({ error: null });
            const meta = await getVaultMeta();
            if (!meta) {
                set({ error: 'not_initialized' });
                return;
            }
            if (newPassphrase.length < PASSPHRASE_MIN_LENGTH) {
                set({ error: 'weak_passphrase' });
                return;
            }
            let secretKey: Uint8Array;
            try {
                secretKey = await parseSecretKey(secretKeyInput);
            } catch {
                set({ error: 'invalid_secret_key' });
                return;
            }
            try {
                const recoveryKek = await deriveRecoveryKEK(secretKey);
                let privateKey: Uint8Array;
                try {
                    privateKey = await unwrapPrivateKey(
                        meta.wrappedPrivateKeyRecovery,
                        recoveryKek,
                    );
                } catch {
                    set({ error: 'recovery_failed' });
                    return;
                }
                const newKek = await deriveKEK(newPassphrase, secretKey, meta.accountSalt);
                const wrappedPrivateKey = await wrapPrivateKey(privateKey, newKek);
                await putVaultMeta({ ...meta, wrappedPrivateKey });
                await cacheSecretKey(secretKey);

                const grant = await getSelfGrant();
                if (!grant) {
                    set({ error: 'unknown' });
                    return;
                }
                const dekRaw = await openSealedDEK(grant.sealedDEK, {
                    publicKey: meta.publicKey,
                    privateKey,
                });
                const dek = await importDekKey(dekRaw);
                enterUnlocked(dek, dekRaw, privateKey);
            } catch {
                set({ error: 'unknown' });
            }
        },

        changePassphrase: async (oldPass, newPass) => {
            set({ error: null });
            const meta = await getVaultMeta();
            if (!meta) {
                set({ error: 'not_initialized' });
                return;
            }
            if (newPass.length < PASSPHRASE_MIN_LENGTH) {
                set({ error: 'weak_passphrase' });
                return;
            }
            const device = await getDeviceCache();
            if (!device) {
                set({ error: 'missing_secret_key' });
                return;
            }
            try {
                const secretKey = await unwrapWithDeviceKey(
                    device.wrappedSecretKey,
                    device.deviceKey,
                );
                const oldKek = await deriveKEK(oldPass, secretKey, meta.accountSalt);
                let privateKey: Uint8Array;
                try {
                    privateKey = await unwrapPrivateKey(meta.wrappedPrivateKey, oldKek);
                } catch {
                    set({ error: 'wrong_passphrase' });
                    return;
                }
                const newKek = await deriveKEK(newPass, secretKey, meta.accountSalt);
                const wrappedPrivateKey = await wrapPrivateKey(privateKey, newKek);
                await putVaultMeta({ ...meta, wrappedPrivateKey });
                zeroize(privateKey);
            } catch {
                set({ error: 'unknown' });
            }
        },

        lock: () => {
            clearAutoLock();
            const { dekRaw, privateKey } = get();
            zeroize(dekRaw);
            zeroize(privateKey);
            set({
                status: 'locked',
                error: null,
                pendingRecoveryKit: null,
                dek: null,
                dekRaw: null,
                privateKey: null,
            });
        },

        bumpActivity: () => {
            if (get().status === 'unlocked') startAutoLock();
        },

        acknowledgeRecoveryKit: () => set({ pendingRecoveryKit: null }),

        reset: () => {
            clearAutoLock();
            const { dekRaw, privateKey } = get();
            zeroize(dekRaw);
            zeroize(privateKey);
            set({ ...initialState });
        },
    };
});
