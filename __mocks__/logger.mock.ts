import type { LoggerProtocol } from "@application/protocols/logger.protocol";

export const createLoggerMock = (): jest.Mocked<LoggerProtocol> => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
});
