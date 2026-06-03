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

  info(message: string, meta?: Record<string, unknown>): void {
    if (!this.enabled("info")) return;
    if (meta) {
      this.logger.info(message, meta);
    } else {
      this.logger.info(message);
    }
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    if (!this.enabled("warn")) return;
    if (meta) {
      this.logger.warn(message, meta);
    } else {
      this.logger.warn(message);
    }
  }

  error(message: string, meta?: Record<string, unknown>): void {
    if (!this.enabled("error")) return;
    if (meta) {
      this.logger.error(message, meta);
    } else {
      this.logger.error(message);
    }
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (!this.enabled("debug")) return;
    if (meta) {
      this.logger.debug(message, meta);
    } else {
      this.logger.debug(message);
    }
  }
}
