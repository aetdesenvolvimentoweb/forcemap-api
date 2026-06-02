import { PasswordHasherProtocol } from "../../application/protocols";

const webcrypto = crypto;

export class WebCryptoPasswordHasherAdapter implements PasswordHasherProtocol {
  constructor(private readonly iterations: number = 100000) {}

  async hash(plainPassword: string): Promise<string> {
    const encoder = new TextEncoder();
    const salt = webcrypto.getRandomValues(new Uint8Array(16));
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
        iterations: this.iterations,
        hash: "SHA-256",
      },
      keyMaterial,
      256,
    );
    const hash = new Uint8Array(derivedKey);
    return `${btoa(String.fromCharCode(...salt))}:${btoa(String.fromCharCode(...hash))}`;
  }

  async compare(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const [saltB64, hashB64] = hashedPassword.split(":");
    if (!saltB64 || !hashB64) return false;
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
        iterations: this.iterations,
        hash: "SHA-256",
      },
      keyMaterial,
      256,
    );
    const computedHash = new Uint8Array(derivedKey);

    return (
      computedHash.length === storedHash.length &&
      computedHash.every((byte, i) => byte === storedHash[i])
    );
  }
}
