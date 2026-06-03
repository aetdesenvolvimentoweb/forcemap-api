import type { Context, Next } from "hono";

/**
 * Comparação de tempo constante para evitar timing side-channel ao validar o
 * segredo interno. A diferença de comprimento ainda vaza (aceitável), mas o
 * conteúdo é comparado sem short-circuit.
 */
const timingSafeEqual = (a: string, b: string): boolean => {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  if (aBytes.length !== bBytes.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) {
    diff |= aBytes[i] ^ bBytes[i];
  }
  return diff === 0;
};

export const createHonoInternalSecretMiddleware = (expectedSecret: string) => {
  return async (c: Context, next: Next) => {
    const secret = c.req.header("X-Internal-Secret");

    if (!secret) {
      // Sem header — deixa CORS decidir (pode ser request de browser)
      await next();
      return c.res;
    }

    if (!expectedSecret || !timingSafeEqual(secret, expectedSecret)) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Secret válido: sinaliza para o CORS fazer bypass de origin
    c.set("bypassCors", true);
    await next();
    return c.res;
  };
};
