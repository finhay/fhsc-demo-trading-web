declare module 'libsodium-wrappers-sumo' {
    export type SodiumKeyPair = {
        keyType: string;
        privateKey: Uint8Array;
        publicKey: Uint8Array;
    };

    type Sodium = {
        ready: Promise<void>;
        crypto_pwhash_ALG_ARGON2ID13: number;
        randombytes_buf(length: number): Uint8Array;
        crypto_box_keypair(): SodiumKeyPair;
        crypto_box_seal(message: Uint8Array, publicKey: Uint8Array): Uint8Array;
        crypto_box_seal_open(
            ciphertext: Uint8Array,
            publicKey: Uint8Array,
            privateKey: Uint8Array,
        ): Uint8Array;
        crypto_generichash(
            hashLength: number,
            message: Uint8Array,
            key?: Uint8Array | null,
        ): Uint8Array;
        crypto_pwhash(
            keyLength: number,
            password: string | Uint8Array,
            salt: Uint8Array,
            opsLimit: number,
            memLimit: number,
            algorithm: number,
        ): Uint8Array;
    };

    const sodium: Sodium;
    export default sodium;
}
