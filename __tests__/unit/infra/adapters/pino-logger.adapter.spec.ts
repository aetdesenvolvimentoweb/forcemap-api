import { PinoLoggerAdapter } from "@infra/adapters/pino-logger.adapter";
import { Logger } from "pino";

describe("PinoLoggerAdapter", () => {
  let pinoMock: jest.Mocked<Logger>;
  let adapter: PinoLoggerAdapter;

  beforeEach(() => {
    pinoMock = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    } as unknown as jest.Mocked<Logger>;
    // Cria o adapter normalmente
    adapter = new PinoLoggerAdapter();
    // Sobrescreve o logger interno para usar o mock
    (adapter as unknown as { logger: jest.Mocked<Logger> }).logger = pinoMock;
  });

  it("should call info with correct params", () => {
    adapter.info("test info", { foo: "bar" });
    expect(pinoMock.info).toHaveBeenCalledWith({ foo: "bar" }, "test info");
  });

  it("should call warn with correct params", () => {
    adapter.warn("test warn", { foo: "bar" });
    expect(pinoMock.warn).toHaveBeenCalledWith({ foo: "bar" }, "test warn");
  });

  it("should call error with correct params", () => {
    adapter.error("test error", { foo: "bar" });
    expect(pinoMock.error).toHaveBeenCalledWith({ foo: "bar" }, "test error");
  });

  it("should call debug with correct params", () => {
    adapter.debug("test debug", { foo: "bar" });
    expect(pinoMock.debug).toHaveBeenCalledWith({ foo: "bar" }, "test debug");
  });

  it("should use empty object for meta if not provided", () => {
    adapter.info("no meta");
    expect(pinoMock.info).toHaveBeenCalledWith({}, "no meta");
  });
});
