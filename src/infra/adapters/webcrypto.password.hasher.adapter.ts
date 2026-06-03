import { PasswordHasherProtocol } from "../../application/protocols";

const webcrypto = crypto;

// Contagem de iterações usada para hashes legados que não a embutem no formato.
const LEGACY_ITERATIONS = 100000;

export class WebCryptoPasswordHasherAdapter implements PasswordHasherProtocol {
  // OWASP recomenda >= 600k iterações para PBKDF2-SHA256.
  constructor(private readonly iterations: number = 600000) {}

  private async deriveHash(
    plainPassword: string,
    salt: Uint8Array,
    iterations: number,
  ): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const keyMaterial = await webcrypto.subtle.importKey(
      "raw",
      encoder.encode(plainPassword),
      "PBKDF2",
      false,
      ["deriveBits"],
    );
    const derivedKey = await webcrypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations,
        hash: "SHA-256",
      },
      keyMaterial,
      256,
    );
    return new Uint8Array(derivedKey);
  }

  async hash(plainPassword: string): Promise<string> {
    const salt = webcrypto.getRandomValues(new Uint8Array(16));
    const hash = await this.deriveHash(plainPassword, salt, this.iterations);
    // Formato: iterations:salt:hash — embute a contagem de iterações para
    // permitir aumentar o custo no futuro sem invalidar hashes existentes.
    return `${this.iterations}:${btoa(String.fromCharCode(...salt))}:${btoa(
      String.fromCharCode(...hash),
    )}`;
  }

  async compare(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const parts = hashedPassword.split(":");

    // Suporta o formato legado (salt:hash, sem iterações embutidas).
    const [iterationsStr, saltB64, hashB64] =
      parts.length === 3 ? parts : [String(LEGACY_ITERATIONS), ...parts];

    if (!saltB64 || !hashB64) return false;

    const iterations = Number(iterationsStr) || LEGACY_ITERATIONS;
    const salt = new Uint8Array(
      atob(saltB64)
        .split("")
        .map((c) => c.charCodeAt(0)),
    );
    const storedHash = new Uint8Array(
      atob(hashB64)
        .split("")
        .map((c) => c.charCodeAt(0)),
    );

    const computedHash = await this.deriveHash(plainPassword, salt, iterations);

    if (computedHash.length !== storedHash.length) return false;
    // Comparação de tempo constante.
    let diff = 0;
    for (let i = 0; i < computedHash.length; i++) {
      diff |= computedHash[i] ^ storedHash[i];
    }
    return diff === 0;
  }
}
