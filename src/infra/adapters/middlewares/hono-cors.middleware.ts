import type { Context, Next } from "hono";

import { LoggerProtocol } from "../../../application/protocols";
import { getClientIp } from "../get-client-ip";

/**
 * Configurações para CORS (Cross-Origin Resource Sharing)
 */
export interface CorsConfig {
  /** Origens permitidas - pode ser string, array ou função */
  origin?:
    | string
    | string[]
    | boolean
    | ((
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void,
      ) => void);
  /** Métodos HTTP permitidos */
  methods?: string | string[];
  /** Headers permitidos nas requisições */
  allowedHeaders?: string | string[];
  /** Headers expostos nas respostas */
  exposedHeaders?: string | string[];
  /** Permite envio de cookies e credenciais */
  credentials?: boolean;
  /** Tempo de cache para requisições preflight (OPTIONS) */
  maxAge?: number;
  /** Se deve responder automaticamente a requisições OPTIONS */
  preflightContinue?: boolean;
  /** Status code para requisições OPTIONS bem-sucedidas */
  optionsSuccessStatus?: number;
}

/**
 * Configuração padrão segura para APIs
 */
const defaultCorsConfig: CorsConfig = {
  origin: false, // Bloqueia todas as origens por padrão (mais seguro)
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: [],
  credentials: false, // Não permite cookies por padrão
  maxAge: 86400, // 24 horas
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

/**
 * Obtém os domínios permitidos a partir das variáveis de ambiente
 */
const getAllowedOrigins = (
  environment: "development" | "production",
  env: Record<string, string | undefined>,
): string[] => {
  const envVar =
    environment === "development"
      ? env.CORS_ALLOWED_ORIGINS_DEV
      : env.CORS_ALLOWED_ORIGINS_PROD;

  if (envVar) {
    // Suporte a múltiplos domínios separados por vírgula
    return envVar
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  // Fallback para valores padrão se não houver variável de ambiente
  if (environment === "development") {
    return [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://localhost:8080", // Para possíveis frontends alternativos
    ];
  }

  // Produção sem fallback - deve ser configurado explicitamente
  return [];
};

/**
 * Configuração para desenvolvimento - mais permissiva
 */
const getDevelopmentCorsConfig = (
  env: Record<string, string | undefined>,
): CorsConfig => {
  const allowedOrigins = getAllowedOrigins("development", env);

  return {
    origin: (origin, callback) => {
      // Em desenvolvimento, permite requisições sem origin (Insomnia, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Verifica se o origin está na lista permitida
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "X-CSRF-Token",
    ],
    exposedHeaders: ["X-Total-Count"],
    credentials: env.CORS_ALLOW_CREDENTIALS_DEV === "true", // Configurável via ENV
    maxAge: Number(env.CORS_MAX_AGE_DEV) || 86400,
    preflightContinue: false,
    optionsSuccessStatus: 200,
  };
};

/**
 * Configuração para produção - restritiva e segura
 */
const getProductionCorsConfig = (
  env: Record<string, string | undefined>,
): CorsConfig => {
  const allowedOrigins = getAllowedOrigins("production", env);
  const allowNoOrigin = env.CORS_ALLOW_NO_ORIGIN_PROD === "true"; // Para mobile apps/Postman

  return {
    origin: (origin, callback) => {
      // Permite requisições sem origin se configurado (mobile apps, Postman, etc.)
      if (!origin && allowNoOrigin) {
        return callback(null, true);
      }

      // Verifica se o origin está na lista permitida
      if (origin && allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(
          new Error(
            `CORS: Origem '${origin || "undefined"}' não permitida em produção`,
          ),
          false,
        );
      }
    },
    methods: env.CORS_ALLOWED_METHODS_PROD?.split(",").map((m) => m.trim()) || [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "PATCH",
    ],
    allowedHeaders: env.CORS_ALLOWED_HEADERS_PROD?.split(",").map((h) =>
      h.trim(),
    ) || ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    exposedHeaders:
      env.CORS_EXPOSED_HEADERS_PROD?.split(",").map((h) => h.trim()) || [],
    credentials: env.CORS_ALLOW_CREDENTIALS_PROD === "true",
    maxAge: Number(env.CORS_MAX_AGE_PROD) || 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };
};

/**
 * Verifica se uma origem está permitida
 */
const isOriginAllowed = (
  origin: string | undefined,
  allowedOrigin: CorsConfig["origin"],
  callback: (err: Error | null, allow?: boolean) => void,
): void => {
  if (typeof allowedOrigin === "boolean") {
    callback(null, allowedOrigin);
    return;
  }

  if (typeof allowedOrigin === "string") {
    callback(null, origin === allowedOrigin);
    return;
  }

  if (Array.isArray(allowedOrigin)) {
    callback(null, allowedOrigin.includes(origin || ""));
    return;
  }

  if (typeof allowedOrigin === "function") {
    allowedOrigin(origin, callback);
    return;
  }

  callback(null, false);
};

/**
 * Middleware CORS customizado para Express
 * Implementa controle de acesso entre origens de forma segura
 */
export const cors = (config: CorsConfig = {}, logger: LoggerProtocol) => {
  const finalConfig = { ...defaultCorsConfig, ...config };

  return async (c: Context, next: Next) => {
    // Requests autenticados via X-Internal-Secret não precisam de validação de origin
    if (c.get("bypassCors") === true) {
      await next();
      return c.res;
    }

    const origin = c.req.header("Origin") ?? undefined;
    const requestMethod = c.req.method.toUpperCase();
    const ip = getClientIp(c);

    // Verifica se a origem é permitida
    let response: Response | undefined;

    isOriginAllowed(origin, finalConfig.origin, (err, allowed) => {
      if (err || !allowed) {
        // Log do bloqueio para monitoramento
        logger.warn("CORS: Origem bloqueada", {
          origin: origin || "undefined",
          path: c.req.path,
          method: c.req.method,
          ip: ip || "undefined",
        });

        response = c.json(
          {
            error: "CORS: Origem não permitida",
            origin: origin || "undefined",
            message: "Esta API não permite requisições de sua origem",
          },
          403,
        );
        return;
      }

      // Define headers CORS para origens permitidas
      if (origin && allowed) {
        c.header("Access-Control-Allow-Origin", origin);
      } else if (finalConfig.origin === true) {
        c.header("Access-Control-Allow-Origin", "*");
      }

      // Métodos permitidos
      if (finalConfig.methods) {
        const methods = Array.isArray(finalConfig.methods)
          ? finalConfig.methods.join(",")
          : finalConfig.methods;
        c.header("Access-Control-Allow-Methods", methods);
      }

      // Headers permitidos
      if (finalConfig.allowedHeaders) {
        const headers = Array.isArray(finalConfig.allowedHeaders)
          ? finalConfig.allowedHeaders.join(",")
          : finalConfig.allowedHeaders;
        c.header("Access-Control-Allow-Headers", headers);
      }

      // Headers expostos
      if (finalConfig.exposedHeaders && finalConfig.exposedHeaders.length > 0) {
        const exposedHeaders = Array.isArray(finalConfig.exposedHeaders)
          ? finalConfig.exposedHeaders.join(",")
          : finalConfig.exposedHeaders;
        c.header("Access-Control-Expose-Headers", exposedHeaders);
      }

      // Credenciais
      if (finalConfig.credentials) {
        c.header("Access-Control-Allow-Credentials", "true");
      }

      // Max Age para cache de preflight
      if (finalConfig.maxAge !== undefined) {
        c.header("Access-Control-Max-Age", finalConfig.maxAge.toString());
      }

      // Trata requisições OPTIONS (preflight)
      if (requestMethod === "OPTIONS") {
        if (!finalConfig.preflightContinue) {
          response = c.body(null, (finalConfig.optionsSuccessStatus || 204) as 200 | 204);
          return;
        }
      }
    });

    if (response) {
      return response;
    }

    await next();
    return c.res;
  };
};

/**
 * Middleware CORS para desenvolvimento
 * Configuração permissiva para facilitar desenvolvimento local
 */
export const corsDev = (
  logger: LoggerProtocol,
  env: Record<string, string | undefined> = {},
) => {
  return cors(getDevelopmentCorsConfig(env), logger);
};

/**
 * Middleware CORS para produção
 * Configuração restritiva e segura para ambiente de produção
 */
export const corsProd = (
  logger: LoggerProtocol,
  env: Record<string, string | undefined> = {},
) => {
  return cors(getProductionCorsConfig(env), logger);
};

/**
 * Middleware CORS que adapta automaticamente ao ambiente
 */
export const corsAuto = (
  logger: LoggerProtocol,
  env: Record<string, string | undefined> = {},
) => {
  const isDevelopment = env.BUN_ENV === "development";
  return isDevelopment ? corsDev(logger, env) : corsProd(logger, env);
};
