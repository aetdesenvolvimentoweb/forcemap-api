import { RateLimiterProtocol } from "../../../application/protocols";
import { D1RateLimiterAdapter } from "../../../infra/adapters";

export const makeRateLimiter = (): RateLimiterProtocol => {
  return new D1RateLimiterAdapter();
};
