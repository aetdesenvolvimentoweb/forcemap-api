import { RateLimitingService } from "../../../../application/services";
import { EnvLoginRateLimitPolicyAdapter } from "../../../../infra/adapters";
import { makeSecurityLogger } from "../../logger";
import { makeRateLimiter } from "../../rate-limiter";

export const makeRateLimitingService = (): RateLimitingService => {
  const rateLimiter = makeRateLimiter();
  const securityLogger = makeSecurityLogger();
  const policyProvider = new EnvLoginRateLimitPolicyAdapter();

  return new RateLimitingService({
    rateLimiter,
    securityLogger,
    policyProvider,
  });
};
