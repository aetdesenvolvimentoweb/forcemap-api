import {
  LoginRateLimitPolicy,
  LoginRateLimitPolicyProvider,
} from "../../application/protocols";
import {
  DEFAULT_LOGIN_IP_MAX_ATTEMPTS,
  DEFAULT_LOGIN_USER_MAX_ATTEMPTS,
  DEFAULT_LOGIN_WINDOW_MS,
} from "../../domain/constants";
import { getEnv } from "../config";

/**
 * Resolve a política de rate limit de login a partir do ambiente request-scoped
 * ({@link getEnv}). No Cloudflare Workers as vars só existem via `c.env`, então a
 * leitura é por chamada. Valores ausentes/ inválidos caem nos defaults de domínio.
 */
export class EnvLoginRateLimitPolicyAdapter
  implements LoginRateLimitPolicyProvider
{
  get(): LoginRateLimitPolicy {
    const env = getEnv();
    return {
      ipMaxAttempts:
        Number(env.RATE_LIMIT_LOGIN_IP_MAX_ATTEMPTS) ||
        DEFAULT_LOGIN_IP_MAX_ATTEMPTS,
      userMaxAttempts:
        Number(env.RATE_LIMIT_LOGIN_USER_MAX_ATTEMPTS) ||
        DEFAULT_LOGIN_USER_MAX_ATTEMPTS,
      windowMs:
        Number(env.RATE_LIMIT_LOGIN_WINDOW_MINUTES) * 60 * 1000 ||
        DEFAULT_LOGIN_WINDOW_MS,
    };
  }
}
