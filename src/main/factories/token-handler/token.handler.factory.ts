import { TokenHandlerProtocol } from "../../../application/protocols";
import { CloudflareWorkerJwtHandlerAdapter } from "../../../infra/adapters";
import { getEnv } from "../../../infra/config";

/**
 * Os secrets vêm do binding `c.env` da request (Workers), exposto pelo contexto
 * request-scoped {@link getEnv}. A configuração é resolvida preguiçosamente a
 * cada operação de token — não há fallback hardcoded: se o secret não estiver
 * configurado, o adapter lança `ConfigurationError` (falha dura).
 */
export const makeTokenHandler = (): TokenHandlerProtocol => {
  return new CloudflareWorkerJwtHandlerAdapter(() => {
    const env = getEnv();
    return {
      accessTokenSecret: env.JWT_ACCESS_SECRET,
      refreshTokenSecret: env.JWT_REFRESH_SECRET,
      accessTokenExpiry: env.JWT_ACCESS_EXPIRY || "15m",
      refreshTokenExpiry: env.JWT_REFRESH_EXPIRY || "7d",
      isProduction: env.BUN_ENV === "production",
    };
  });
};
