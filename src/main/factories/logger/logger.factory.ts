import { LoggerProtocol } from "@application/protocols";
import { PinoLoggerAdapter } from "@infra/adapters";

export const makeLoggerFactory = (): LoggerProtocol => {
  return new PinoLoggerAdapter();
};
