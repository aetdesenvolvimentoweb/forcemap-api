import type { Context, Next } from "hono";

/**
 * Tipos de eventos de segurança que podem ser logados
 */
export enum SecurityEventType {
  // Autenticação e Autorização
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILED = "LOGIN_FAILED",
  LOGIN_BLOCKED = "LOGIN_BLOCKED",
  LOGOUT = "LOGOUT",
  TOKEN_REFRESH = "TOKEN_REFRESH",
  TOKEN_INVALID = "TOKEN_INVALID",
  ACCESS_DENIED = "ACCESS_DENIED",

  // Rate Limiting
  RATE_LIMIT_HIT = "RATE_LIMIT_HIT",
  RATE_LIMIT_BLOCKED = "RATE_LIMIT_BLOCKED",

  // Ataques e Tentativas Suspeitas
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
  CORS_VIOLATION = "CORS_VIOLATION",
  INVALID_INPUT = "INVALID_INPUT",
  SQL_INJECTION_ATTEMPT = "SQL_INJECTION_ATTEMPT",
  XSS_ATTEMPT = "XSS_ATTEMPT",

  // Sistema
  SERVER_ERROR = "SERVER_ERROR",
  SECURITY_HEADER_MISSING = "SECURITY_HEADER_MISSING",
}

/**
 * Severidade do evento de segurança
 */
export enum SecurityEventSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

/**
 * Interface para eventos de segurança
 */
export interface SecurityEvent {
  timestamp: string;
  eventType: SecurityEventType;
  severity: SecurityEventSeverity;
  message: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  additionalData?: Record<string, unknown>;
}

/**
 * Interface para o logger de segurança
 */
export interface SecurityLogger {
  logSecurityEvent(event: SecurityEvent): void;
  logLoginAttempt(
    success: boolean,
    userId?: string,
    ipAddress?: string,
    additionalData?: Record<string, unknown>,
  ): void;
  logRateLimitHit(ipAddress: string, endpoint: string, limit: number): void;
  logSuspiciousActivity(
    description: string,
    ipAddress?: string,
    additionalData?: Record<string, unknown>,
  ): void;
  logCorsViolation(origin: string, ipAddress?: string): void;
  logAccessDenied(userId: string, resource: string, ipAddress?: string): void;
}

import { LoggerProtocol } from "../../../application/protocols";
import { getClientIp } from "../get-client-ip";

/**
 * Implementação do logger de segurança usando LogLevel
 */
export class LogLevelSecurityLogger implements SecurityLogger {
  constructor(private readonly logger: LoggerProtocol) {}
  private getLogLevel(
    severity: SecurityEventSeverity,
  ): "info" | "warn" | "error" {
    switch (severity) {
      case SecurityEventSeverity.LOW:
        return "info";
      case SecurityEventSeverity.MEDIUM:
        return "warn";
      case SecurityEventSeverity.HIGH:
      case SecurityEventSeverity.CRITICAL:
        return "error";
      default:
        return "info";
    }
  }

  logSecurityEvent(event: SecurityEvent): void {
    const level = this.getLogLevel(event.severity);
    this.logger[level](`[SECURITY] ${event.message}`, {
      type: "SECURITY_EVENT",
      ...event,
    });
  }

  logLoginAttempt(
    success: boolean,
    userId?: string,
    ipAddress?: string,
    additionalData?: Record<string, unknown>,
  ): void {
    const level = success ? "info" : "warn";
    const message = success
      ? `Login bem-sucedido para usuário ${userId || "desconhecido"}`
      : `Tentativa de login falhada para usuário ${userId || "desconhecido"}`;

    this.logger[level](`[SECURITY] ${message}`, {
      type: "SECURITY_EVENT",
      eventType: success
        ? SecurityEventType.LOGIN_SUCCESS
        : SecurityEventType.LOGIN_FAILED,
      severity: success
        ? SecurityEventSeverity.LOW
        : SecurityEventSeverity.MEDIUM,
      timestamp: new Date().toISOString(),
      userId,
      ipAddress,
      additionalData,
    });
  }

  logRateLimitHit(ipAddress: string, endpoint: string, limit: number): void {
    this.logger.warn(
      `[SECURITY] Rate limit atingido para IP ${ipAddress} no endpoint ${endpoint} (limite: ${limit})`,
      {
        type: "SECURITY_EVENT",
        eventType: SecurityEventType.RATE_LIMIT_HIT,
        severity: SecurityEventSeverity.MEDIUM,
        timestamp: new Date().toISOString(),
        ipAddress,
        endpoint,
        additionalData: { limit },
      },
    );
  }

  logSuspiciousActivity(
    description: string,
    ipAddress?: string,
    additionalData?: Record<string, unknown>,
  ): void {
    this.logger.error(
      `[SECURITY] Atividade suspeita detectada: ${description}`,
      {
        type: "SECURITY_EVENT",
        eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
        severity: SecurityEventSeverity.HIGH,
        timestamp: new Date().toISOString(),
        ipAddress,
        additionalData,
      },
    );
  }

  logCorsViolation(origin: string, ipAddress?: string): void {
    this.logger.warn(
      `[SECURITY] Violação de CORS detectada da origem: ${origin}`,
      {
        type: "SECURITY_EVENT",
        eventType: SecurityEventType.CORS_VIOLATION,
        severity: SecurityEventSeverity.MEDIUM,
        timestamp: new Date().toISOString(),
        ipAddress,
        additionalData: { origin },
      },
    );
  }

  logAccessDenied(userId: string, resource: string, ipAddress?: string): void {
    this.logger.warn(
      `[SECURITY] Acesso negado para usuário ${userId} ao recurso ${resource}`,
      {
        type: "SECURITY_EVENT",
        eventType: SecurityEventType.ACCESS_DENIED,
        severity: SecurityEventSeverity.MEDIUM,
        timestamp: new Date().toISOString(),
        userId,
        ipAddress,
        additionalData: { resource },
      },
    );
  }
}

/**
 * Extrai informações da requisição para logging de segurança
 */
const extractRequestInfo = (c: Context) => ({
  // Apenas CF-Connecting-IP é confiável no Workers (ver getClientIp).
  ipAddress: getClientIp(c) ?? "unknown",
  userAgent: c.req.header("User-Agent") || "unknown",
  endpoint: c.req.path,
  method: c.req.method,
});

/**
 * Middleware para logging automático de eventos de segurança
 * Intercepta requisições e respostas para detectar eventos relevantes
 */
export const securityLogging = (logger: LoggerProtocol) => {
  const securityLogger: SecurityLogger = new LogLevelSecurityLogger(logger);

  return async (c: Context, next: Next): Promise<void> => {
    const startTime = Date.now();
    const requestInfo = extractRequestInfo(c);

    // Detecta padrões suspeitos na URL antes de processar
    const suspiciousPatterns = [
      /union.*select/i, // SQL Injection
      /<script.*>/i, // XSS
      /javascript:/i, // XSS
      /on\w+\s*=/i, // XSS event handlers
      /\.\.\/.*\.\.\/|\.\.\\.*\.\.\\/, // Path Traversal
      /%2e%2e%2f|%2e%2e%5c/i, // Encoded Path Traversal
      /null|0x[0-9a-f]+/i, // SQL Injection patterns
      /waitfor\s+delay/i, // SQL Injection timing
    ];

    const fullUrl = c.req.url;

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(fullUrl)) {
        securityLogger.logSuspiciousActivity(
          `Padrão suspeito detectado: ${pattern.source}`,
          requestInfo.ipAddress,
          {
            url: fullUrl,
            pattern: pattern.source,
          },
        );
        break; // Para evitar múltiplos logs para a mesma requisição
      }
    }

    await next();

    // Após a resposta, log baseado no status
    const responseTime = Date.now() - startTime;
    const statusCode = c.res.status;

    // Log eventos baseados no status code
    if (statusCode === 401) {
      logger.warn("[SECURITY] Token inválido ou expirado", {
        type: "SECURITY_EVENT",
        eventType: SecurityEventType.TOKEN_INVALID,
        severity: SecurityEventSeverity.MEDIUM,
        timestamp: new Date().toISOString(),
        ...requestInfo,
        statusCode,
        additionalData: { responseTime },
      });
    } else if (statusCode === 403) {
      logger.warn("[SECURITY] Acesso negado ao recurso", {
        type: "SECURITY_EVENT",
        eventType: SecurityEventType.ACCESS_DENIED,
        severity: SecurityEventSeverity.MEDIUM,
        timestamp: new Date().toISOString(),
        ...requestInfo,
        statusCode,
        additionalData: { responseTime },
      });
    } else if (statusCode === 429) {
      securityLogger.logRateLimitHit(
        requestInfo.ipAddress,
        requestInfo.endpoint,
        0, // Limite específico seria obtido do rate limiter
      );
    } else if (statusCode >= 500) {
      logger.error("[SECURITY] Erro interno do servidor", {
        type: "SECURITY_EVENT",
        eventType: SecurityEventType.SERVER_ERROR,
        severity: SecurityEventSeverity.HIGH,
        timestamp: new Date().toISOString(),
        ...requestInfo,
        statusCode,
        additionalData: { responseTime },
      });
    }
  };
};
