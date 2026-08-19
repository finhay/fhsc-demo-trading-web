import {
    ACCOUNT_SALT_BYTES,
    AES_IV_BYTES,
    ARGON2ID_MEMLIMIT_BYTES,
    ARGON2ID_OPSLIMIT,
    DEK_BYTES,
    KEK_HKDF_INFO,
    RECOVERY_HKDF_INFO,
    SECRET_KEY_BYTES,
    SECRET_KEY_PREFIX,
    VAULT_SCHEMA_VERSION,
} from '@/constants/fund';

export type KeyPair = { publicKey: Uint8Array; privateKey: Uint8Array };
export type Wrapped = { iv: Uint8Array; ct: Uint8Array };

type Sodium = (typeof import('libsodium-wrappers-sumo'))['default'];
let sodiumPromise: Promise<Sodium> | null = null;
const getSodium = (): Promise<Sodium> => {
    if (!sodiumPromise) {
        sodiumPromise = import('libsodium-wrappers-sumo').then(async (m) => {
            await m.default.ready;
            return m.default;
        });
    }
    return sodiumPromise;
};

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const subtle = (): SubtleCrypto => globalThis.crypto.subtle;

const bs = (u: Uint8Array): BufferSource => u as BufferSource;

const aesGcmEncrypt = async (
    key: CryptoKey,
    data: Uint8Array,
    aad?: Uint8Array,
): Promise<Wrapped> => {
    const iv = globalThis.crypto.getRandomValues(new Uint8Array(AES_IV_BYTES));
    const algo: AesGcmParams = { name: 'AES-GCM', iv };
    if (aad) algo.additionalData = bs(aad);
    const ct = new Uint8Array(await subtle().encrypt(algo, key, bs(data)));
    return { iv, ct };
};

const aesGcmDecrypt = async (key: CryptoKey, w: Wrapped, aad?: Uint8Array): Promise<Uint8Array> => {
    const algo: AesGcmParams = { name: 'AES-GCM', iv: bs(w.iv) };
    if (aad) algo.additionalData = bs(aad);
    const pt = await subtle().decrypt(algo, key, bs(w.ct));
    return new Uint8Array(pt);
};

export const generateSecretKey = async (): Promise<Uint8Array> => {
    const s = await getSodium();
    return s.randombytes_buf(SECRET_KEY_BYTES);
};

export const generateAccountSalt = async (): Promise<Uint8Array> => {
    const s = await getSodium();
    return s.randombytes_buf(ACCOUNT_SALT_BYTES);
};

export const generateDEK = async (): Promise<Uint8Array> => {
    const s = await getSodium();
    return s.randombytes_buf(DEK_BYTES);
};

export const generateKeyPair = async (): Promise<KeyPair> => {
    const s = await getSodium();
    const kp = s.crypto_box_keypair();
    return { publicKey: kp.publicKey, privateKey: kp.privateKey };
};

const B32_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const B32_LOOKUP: Record<string, number> = (() => {
    const m: Record<string, number> = {};
    for (let i = 0; i < B32_ALPHABET.length; i++) m[B32_ALPHABET[i]] = i;
    m.I = 1;
    m.L = 1;
    m.O = 0;
    return m;
})();

const b32encode = (bytes: Uint8Array): string => {
    let bits = 0;
    let value = 0;
    let out = '';
    for (let i = 0; i < bytes.length; i++) {
        value = (value << 8) | bytes[i];
        bits += 8;
        while (bits >= 5) {
            out += B32_ALPHABET[(value >>> (bits - 5)) & 31];
            bits -= 5;
        }
    }
    if (bits > 0) out += B32_ALPHABET[(value << (5 - bits)) & 31];
    return out;
};

const b32decode = (str: string): Uint8Array => {
    let bits = 0;
    let value = 0;
    const out: number[] = [];
    const upper = str.toUpperCase();
    for (let i = 0; i < upper.length; i++) {
        const v = B32_LOOKUP[upper[i]];
        if (v === undefined) throw new Error('Secret Key không hợp lệ (ký tự lạ)');
        value = (value << 5) | v;
        bits += 5;
        if (bits >= 8) {
            out.push((value >>> (bits - 8)) & 0xff);
            bits -= 8;
        }
    }
    return new Uint8Array(out);
};

const formatSecretKey = async (sk: Uint8Array): Promise<string> => {
    const s = await getSodium();
    const checksum = s.crypto_generichash(16, sk)[0];
    const payload = new Uint8Array(sk.length + 1);
    payload.set(sk);
    payload[sk.length] = checksum;
    const groups = b32encode(payload).match(/.{1,5}/g) ?? [];
    return `${SECRET_KEY_PREFIX}-${groups.join('-')}`;
};

export const parseSecretKey = async (formatted: string): Promise<Uint8Array> => {
    const s = await getSodium();
    const cleaned = formatted
        .trim()
        .toUpperCase()
        .replace(new RegExp(`^${SECRET_KEY_PREFIX}-?`), '')
        .replace(/-/g, '')
        .replace(/\s+/g, '');
    const payload = b32decode(cleaned);
    if (payload.length < SECRET_KEY_BYTES + 1)
        throw new Error('Secret Key không hợp lệ (quá ngắn)');
    const sk = payload.slice(0, SECRET_KEY_BYTES);
    const checksum = payload[SECRET_KEY_BYTES];
    if (s.crypto_generichash(16, sk)[0] !== checksum) {
        throw new Error('Secret Key không hợp lệ (sai checksum)');
    }
    return sk;
};

export const deriveKEK = async (
    passphrase: string,
    secretKey: Uint8Array,
    accountSalt: Uint8Array,
): Promise<CryptoKey> => {
    const s = await getSodium();
    const saltedPass = s.crypto_pwhash(
        32,
        passphrase,
        accountSalt,
        ARGON2ID_OPSLIMIT,
        ARGON2ID_MEMLIMIT_BYTES,
        s.crypto_pwhash_ALG_ARGON2ID13,
    );
    const ikm = await subtle().importKey('raw', bs(saltedPass), 'HKDF', false, ['deriveKey']);
    const kek = await subtle().deriveKey(
        {
            name: 'HKDF',
            hash: 'SHA-256',
            salt: bs(secretKey),
            info: bs(textEncoder.encode(KEK_HKDF_INFO)),
        },
        ikm,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt'],
    );
    saltedPass.fill(0);
    return kek;
};

export const deriveRecoveryKEK = async (secretKey: Uint8Array): Promise<CryptoKey> => {
    const ikm = await subtle().importKey('raw', bs(secretKey), 'HKDF', false, ['deriveKey']);
    return subtle().deriveKey(
        {
            name: 'HKDF',
            hash: 'SHA-256',
            salt: bs(new Uint8Array(0)),
            info: bs(textEncoder.encode(RECOVERY_HKDF_INFO)),
        },
        ikm,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt'],
    );
};

export const wrapPrivateKey = (priv: Uint8Array, kek: CryptoKey): Promise<Wrapped> =>
    aesGcmEncrypt(kek, priv);

export const unwrapPrivateKey = (w: Wrapped, kek: CryptoKey): Promise<Uint8Array> =>
    aesGcmDecrypt(kek, w);

export const sealDEKTo = async (
    dekRaw: Uint8Array,
    recipientPub: Uint8Array,
): Promise<Uint8Array> => {
    const s = await getSodium();
    return s.crypto_box_seal(dekRaw, recipientPub);
};

export const openSealedDEK = async (sealed: Uint8Array, kp: KeyPair): Promise<Uint8Array> => {
    const s = await getSodium();
    const dek = s.crypto_box_seal_open(sealed, kp.publicKey, kp.privateKey);
    if (!dek) throw new Error('Không mở được sealed DEK (sai khóa)');
    return dek;
};

export const importDekKey = (dekRaw: Uint8Array): Promise<CryptoKey> =>
    subtle().importKey('raw', bs(dekRaw), { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);

export const generateDeviceKey = (): Promise<CryptoKey> =>
    subtle().generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);

export const wrapWithDeviceKey = (secretKey: Uint8Array, deviceKey: CryptoKey): Promise<Wrapped> =>
    aesGcmEncrypt(deviceKey, secretKey);

export const unwrapWithDeviceKey = (w: Wrapped, deviceKey: CryptoKey): Promise<Uint8Array> =>
    aesGcmDecrypt(deviceKey, w);

export const buildRecoveryKit = (secretKey: Uint8Array): Promise<string> =>
    formatSecretKey(secretKey);

const recordAad = (type: string, v: number): Uint8Array => textEncoder.encode(`${type}|v${v}`);

export const encryptRecord = (dek: CryptoKey, type: string, obj: unknown): Promise<Wrapped> =>
    aesGcmEncrypt(
        dek,
        textEncoder.encode(JSON.stringify(obj)),
        recordAad(type, VAULT_SCHEMA_VERSION),
    );

export const decryptRecord = async <T>(dek: CryptoKey, type: string, blob: Wrapped): Promise<T> => {
    const pt = await aesGcmDecrypt(dek, blob, recordAad(type, VAULT_SCHEMA_VERSION));
    return JSON.parse(textDecoder.decode(pt)) as T;
};
