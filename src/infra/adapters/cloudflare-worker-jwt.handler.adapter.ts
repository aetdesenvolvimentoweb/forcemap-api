import { sign, verify } from "@tsndr/cloudflare-worker-jwt";

import { InvalidParamError, UnauthorizedError } from "../../application/errors";
import { TokenHandlerProtocol } from "../../application/protocols";
import { Payload, RefreshTokenPayload } from "../../domain/entities";
import { ConfigurationError } from "../errors";

const JWT_ALGORITHM = "HS256" as const;

/**
 * Configuração resolvida por request. Os secrets NÃO podem ser capturados no
 * momento da construção (módulo carregado fora de uma request), por isso o
 * adapter recebe um provedor avaliado preguiçosamente a cada operação.
 */
export interface JwtHandlerConfig {
  accessTokenSecret?: string;
  refreshTokenSecret?: string;
  accessTokenExpiry?: string;
  refreshTokenExpiry?: string;
  isProduction?: boolean;
}

export class CloudflareWorkerJwtHandlerAdapter implements TokenHandlerProtocol {
  constructor(private readonly getConfig: () => JwtHandlerConfig) {}

  private resolveAccessSecret(): string {
    const { accessTokenSecret, isProduction } = this.getConfig();
    if (!accessTokenSecret) {
      throw new ConfigurationError("JWT_ACCESS_SECRET deve ser configurado");
    }
    if (isProduction && accessTokenSecret.length < 32) {
      throw new ConfigurationError(
        "JWT_ACCESS_SECRET deve ter no mínimo 32 caracteres em produção",
      );
    }
    return accessTokenSecret;
  }

  private resolveRefreshSecret(): string {
    const { refreshTokenSecret, isProduction } = this.getConfig();
    if (!refreshTokenSecret) {
      throw new ConfigurationError("JWT_REFRESH_SECRET deve ser configurado");
    }
    if (isProduction && refreshTokenSecret.length < 32) {
      throw new ConfigurationError(
        "JWT_REFRESH_SECRET deve ter no mínimo 32 caracteres em produção",
      );
    }
    return refreshTokenSecret;
  }

  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new ConfigurationError(`Formato de expiração inválido: ${expiry}`);
    }
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case "s":
        return value;
      case "m":
        return value * 60;
      case "h":
        return value * 3600;
      case "d":
        return value * 86400;
      default:
        throw new ConfigurationError(`Unidade de expiração inválida: ${unit}`);
    }
  }

  public readonly generateAccessToken = async (
    payload: Omit<Payload, "iat" | "exp">,
  ): Promise<string> => {
    const secret = this.resolveAccessSecret();
    const expiry = this.parseExpiry(this.getConfig().accessTokenExpiry || "15m");
    try {
      const now = Math.floor(Date.now() / 1000);
      const payloadWithExp = {
        ...payload,
        iat: now,
        exp: now + expiry,
        iss: "forcemap-api",
        aud: "forcemap-client",
      };
      return await sign(payloadWithExp, secret, { algorithm: JWT_ALGORITHM });
    } catch {
      throw new InvalidParamError("Payload do token", "inválido para geração");
    }
  };

  public readonly generateRefreshToken = async (
    payload: Omit<RefreshTokenPayload, "iat" | "exp">,
  ): Promise<string> => {
    const secret = this.resolveRefreshSecret();
    const expiry = this.parseExpiry(this.getConfig().refreshTokenExpiry || "7d");
    try {
      const now = Math.floor(Date.now() / 1000);
      const payloadWithExp = {
        ...payload,
        iat: now,
        exp: now + expiry,
        iss: "forcemap-api",
        aud: "forcemap-client",
      };
      return await sign(payloadWithExp, secret, { algorithm: JWT_ALGORITHM });
    } catch {
      throw new InvalidParamError(
        "Payload do refresh token",
        "inválido para geração",
      );
    }
  };

  public readonly verifyAccessToken = async (
    token: string,
  ): Promise<Payload> => {
    try {
      if (!token || typeof token !== "string") {
        throw new UnauthorizedError("Token de acesso obrigatório");
      }

      const result = await verify<Payload>(token, this.resolveAccessSecret(), {
        algorithm: JWT_ALGORITHM,
        throwError: true,
      });

      if (!result) {
        throw new UnauthorizedError("Token de acesso inválido");
      }

      const decoded = result.payload as Payload;

      if (
        !decoded.userId ||
        !decoded.sessionId ||
        !decoded.role ||
        !decoded.militaryId ||
        decoded.iss !== "forcemap-api" ||
        decoded.aud !== "forcemap-client"
      ) {
        throw new UnauthorizedError("Token de acesso inválido");
      }

      return decoded;
    } catch (error) {
      if (error instanceof ConfigurationError) {
        throw error;
      }

      if (error instanceof Error && /expired/i.test(error.message)) {
        throw new UnauthorizedError("Token de acesso expirado");
      }

      if (error instanceof UnauthorizedError) {
        throw error;
      }

      throw new UnauthorizedError("Erro na validação do token de acesso");
    }
  };

  public readonly verifyRefreshToken = async (
    token: string,
  ): Promise<RefreshTokenPayload> => {
    try {
      if (!token || typeof token !== "string") {
        throw new UnauthorizedError("Refresh token obrigatório");
      }

      const result = await verify<RefreshTokenPayload>(
        token,
        this.resolveRefreshSecret(),
        { algorithm: JWT_ALGORITHM, throwError: true },
      );

      if (!result) {
        throw new UnauthorizedError("Refresh token inválido");
      }

      const decoded = result.payload as RefreshTokenPayload;

      if (
        !decoded.userId ||
        !decoded.sessionId ||
        decoded.iss !== "forcemap-api" ||
        decoded.aud !== "forcemap-client"
      ) {
        throw new UnauthorizedError("Refresh token inválido");
      }

      return decoded;
    } catch (error) {
      if (error instanceof ConfigurationError) {
        throw error;
      }

      if (error instanceof Error && /expired/i.test(error.message)) {
        throw new UnauthorizedError("Refresh token expirado");
      }

      if (error instanceof UnauthorizedError) {
        throw error;
      }

      throw new UnauthorizedError("Erro na validação do refresh token");
    }
  };

  public readonly extractTokenFromHeader = (
    authHeader?: string,
  ): string | null => {
    if (!authHeader || typeof authHeader !== "string") {
      return null;
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return null;
    }

    const token = parts[1];

    if (!token || token.trim().length === 0) {
      return null;
    }

    return token.trim();
  };
}
