import log from "loglevel";

import { LoggerProtocol } from "../../application/protocols";
import { getEnv } from "../config";

type Level = "debug" | "info" | "warn" | "error" | "silent";

const PRIORITY: Record<Level, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 99,
};

// Defaults por ambiente quando LOG_LEVEL não está configurado.
const DEV_DEFAULT: Level = "debug";
const PROD_DEFAULT: Level = "warn";

export class LogLevelLoggerAdapter implements LoggerProtocol {
  private logger: log.Logger;

  constructor() {
    this.logger = log.getLogger("forcemap");
    // Deixa o loglevel emitir tudo; o gating de nível é feito aqui a partir do
    // LOG_LEVEL request-scoped (o construtor roda no load do módulo, quando o
    // env ainda não está disponível, por isso a decisão é por chamada).
    this.logger.setLevel("trace");
  }

  private threshold(): number {
    const env = getEnv();
    const configured = env.LOG_LEVEL?.toLowerCase() as Level | undefined;
    if (configured && configured in PRIORITY) {
      return PRIORITY[configured];
    }
    const isProduction = env.BUN_ENV === "production";
    return PRIORITY[isProduction ? PROD_DEFAULT : DEV_DEFAULT];
  }

  private enabled(level: Exclude<Level, "silent">): boolean {
    return PRIORITY[level] >= this.threshold();
  }

  // Formato legível (pretty) vs JSON estruturado em uma linha. Decisão por
  // chamada, pelo mesmo motivo de threshold(): o env é request-scoped.
  private pretty(): boolean {
    const env = getEnv();
    if (env.LOG_PRETTY !== undefined) return env.LOG_PRETTY === "true";
    return env.BUN_ENV !== "production"; // default: pretty em dev, JSON em prod
  }

  private emit(
    level: Exclude<Level, "silent">,
    message: string,
    meta?: Record<string, unknown>,
  ): void {
    if (!this.enabled(level)) return;
    if (this.pretty()) {
      if (meta) {
        this.logger[level](message, meta);
      } else {
        this.logger[level](message);
      }
    } else {
      this.logger[level](JSON.stringify({ level, message, ...(meta ?? {}) }));
    }
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.emit("info", message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.emit("warn", message, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.emit("error", message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.emit("debug", message, meta);
  }
}
