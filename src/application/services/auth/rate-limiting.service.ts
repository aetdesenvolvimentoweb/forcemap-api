import { TooManyRequestsError } from "../../errors";
import {
  LoginRateLimitPolicyProvider,
  RateLimiterProtocol,
  SecurityLoggerProtocol,
} from "../../protocols";

interface RateLimitingServiceDependencies {
  rateLimiter: RateLimiterProtocol;
  securityLogger: SecurityLoggerProtocol;
  policyProvider: LoginRateLimitPolicyProvider;
}

interface RateLimitKeys {
  ipLimitKey: string;
  rgLimitKey: string;
}

/**
 * Serviço responsável por gerenciar rate limiting em tentativas de login.
 *
 * Implementa proteção contra força bruta através de:
 * - Rate limiting por IP
 * - Rate limiting por usuário (RG)
 * - Logging de tentativas bloqueadas
 */
export class RateLimitingService {
  constructor(private readonly dependencies: RateLimitingServiceDependencies) {}

  /**
   * Valida se o IP e RG podem fazer uma nova tentativa de login.
   *
   * @throws {TooManyRequestsError} Quando rate limit é excedido
   */
  public readonly validateLoginAttempt = async (
    ipAddress: string,
    rg: number,
  ): Promise<RateLimitKeys> => {
    const { rateLimiter, securityLogger, policyProvider } = this.dependencies;

    const { ipMaxAttempts, userMaxAttempts, windowMs } = policyProvider.get();

    const ipLimitKey = `login:ip:${ipAddress}`;
    const ipLimit = await rateLimiter.checkLimit(
      ipLimitKey,
      ipMaxAttempts,
      windowMs,
    );

    if (!ipLimit.allowed) {
      securityLogger.logLoginBlocked(
        ipAddress,
        undefined,
        "Rate limit por IP excedido",
      );
      throw new TooManyRequestsError(
        `Muitas tentativas de login. Tente novamente em ${Math.ceil(
          (ipLimit.resetTime.getTime() - Date.now()) / 60000,
        )} minutos.`,
      );
    }

    const rgLimitKey = `login:rg:${rg}`;
    const rgLimit = await rateLimiter.checkLimit(
      rgLimitKey,
      userMaxAttempts,
      windowMs,
    );

    if (!rgLimit.allowed) {
      securityLogger.logLoginBlocked(
        `RG:${rg}`,
        undefined,
        "Rate limit por usuário excedido",
      );
      throw new TooManyRequestsError(
        `Muitas tentativas para este usuário. Tente novamente em ${Math.ceil(
          (rgLimit.resetTime.getTime() - Date.now()) / 60000,
        )} minutos.`,
      );
    }

    return { ipLimitKey, rgLimitKey };
  };

  /**
   * Registra uma tentativa de login falhada.
   */
  public readonly recordFailedAttempt = async (
    keys: RateLimitKeys,
  ): Promise<void> => {
    const { rateLimiter, policyProvider } = this.dependencies;
    const { windowMs } = policyProvider.get();
    await rateLimiter.recordAttempt(keys.ipLimitKey, windowMs);
    await rateLimiter.recordAttempt(keys.rgLimitKey, windowMs);
  };

  /**
   * Reseta os contadores de rate limit após login bem-sucedido.
   */
  public readonly resetLimits = async (keys: RateLimitKeys): Promise<void> => {
    const { rateLimiter } = this.dependencies;
    await rateLimiter.reset(keys.ipLimitKey);
    await rateLimiter.reset(keys.rgLimitKey);
  };
}
