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
      // Adicione outros métodos se necessário
    } as Partial<Logger> as jest.Mocked<Logger>;
    adapter = new PinoLoggerAdapter();
    (adapter as PinoLoggerAdapter).logger = pinoMock;
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

  it("should use empty object for meta if not provided in warn", () => {
    adapter.warn("no meta");
    expect(pinoMock.warn).toHaveBeenCalledWith({}, "no meta");
  });

  it("should use empty object for meta if not provided in error", () => {
    adapter.error("no meta");
    expect(pinoMock.error).toHaveBeenCalledWith({}, "no meta");
  });

  it("should use empty object for meta if not provided in debug", () => {
    adapter.debug("no meta");
    expect(pinoMock.debug).toHaveBeenCalledWith({}, "no meta");
  });
});
