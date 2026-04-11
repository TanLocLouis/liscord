const E2EE_ALGORITHM = 'ECDH-P256';

type StoredKeyPair = {
    privateJwk: JsonWebKey;
    publicKey: string;
};

function toBase64(bytes: Uint8Array): string {
    let binary = '';
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }
    return btoa(binary);
}

function fromBase64(input: string): ArrayBuffer {
    const binary = atob(input);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

function getStorageKey(userId: string): string {
    return `e2ee:keypair:${userId}`;
}

async function createKeyPair(): Promise<StoredKeyPair> {
    const keyPair = await crypto.subtle.generateKey(
        {
            name: 'ECDH',
            namedCurve: 'P-256',
        },
        true,
        ['deriveKey']
    );

    const privateJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
    const publicRaw = await crypto.subtle.exportKey('raw', keyPair.publicKey);

    return {
        privateJwk,
        publicKey: toBase64(new Uint8Array(publicRaw)),
    };
}

export async function getOrCreateStoredKeyPair(userId: string): Promise<StoredKeyPair> {
    const storageKey = getStorageKey(userId);
    const existing = localStorage.getItem(storageKey);

    if (existing) {
        const parsed = JSON.parse(existing) as StoredKeyPair;
        if (parsed?.privateJwk && typeof parsed.publicKey === 'string') {
            return parsed;
        }
    }

    const created = await createKeyPair();
    localStorage.setItem(storageKey, JSON.stringify(created));
    return created;
}

async function deriveSharedAesKey(privateJwk: JsonWebKey, peerPublicKeyBase64: string): Promise<CryptoKey> {
    const privateKey = await crypto.subtle.importKey(
        'jwk',
        privateJwk,
        {
            name: 'ECDH',
            namedCurve: 'P-256',
        },
        false,
        ['deriveKey']
    );

    const peerPublicRaw = fromBase64(peerPublicKeyBase64);
    const publicKey = await crypto.subtle.importKey(
        'raw',
        peerPublicRaw,
        {
            name: 'ECDH',
            namedCurve: 'P-256',
        },
        false,
        []
    );

    return crypto.subtle.deriveKey(
        {
            name: 'ECDH',
            public: publicKey,
        },
        privateKey,
        {
            name: 'AES-GCM',
            length: 256,
        },
        false,
        ['encrypt', 'decrypt']
    );
}

export async function encryptMessage(
    plaintext: string,
    privateJwk: JsonWebKey,
    peerPublicKeyBase64: string
): Promise<{ ciphertext: string; iv: string }> {
    const key = await deriveSharedAesKey(privateJwk, peerPublicKeyBase64);
    const iv = new Uint8Array(12);
    crypto.getRandomValues(iv);
    const encoded = new TextEncoder().encode(plaintext);

    const encrypted = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv,
        },
        key,
        encoded
    );

    return {
        ciphertext: toBase64(new Uint8Array(encrypted)),
        iv: toBase64(iv),
    };
}

export async function decryptMessage(
    ciphertextBase64: string,
    ivBase64: string,
    privateJwk: JsonWebKey,
    peerPublicKeyBase64: string
): Promise<string> {
    const key = await deriveSharedAesKey(privateJwk, peerPublicKeyBase64);
    const ciphertext = fromBase64(ciphertextBase64);
    const iv = fromBase64(ivBase64);

    const decrypted = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv,
        },
        key,
        ciphertext
    );

    return new TextDecoder().decode(decrypted);
}

export function getE2EEAlgorithm(): string {
    return E2EE_ALGORITHM;
}
