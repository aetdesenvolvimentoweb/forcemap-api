/**
 * Política de rate limiting para o fluxo de login, com valores já resolvidos
 * (números prontos para uso). A leitura de configuração/ambiente fica a cargo
 * da implementação (camada infra) — a aplicação só conhece esta abstração.
 */
export interface LoginRateLimitPolicy {
  ipMaxAttempts: number;
  userMaxAttempts: number;
  windowMs: number;
}

export interface LoginRateLimitPolicyProvider {
  get(): LoginRateLimitPolicy;
}
