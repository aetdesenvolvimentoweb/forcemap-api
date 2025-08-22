import { LoggerProtocol } from "@application/protocols";
import pino from "pino";

export class PinoLoggerAdapter implements LoggerProtocol {
  private readonly logger: pino.Logger;

  constructor(options?: pino.LoggerOptions) {
    this.logger = pino(options);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.logger.info(meta || {}, message);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.logger.warn(meta || {}, message);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.logger.error(meta || {}, message);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.logger.debug(meta || {}, message);
  }
}
