import { AppError } from "@domain/errors";
import { httpResponseFactoryMock } from "@mocks/httpResponseFactory.mock";
import { createLoggerMock } from "@mocks/logger.mock";
import { responseMock } from "@mocks/response.mock";
import { EmptyRequestError } from "@presentation/errors";
import { handleControllerError } from "@presentation/utils";

interface SutTypes {
  response: typeof responseMock;
  loggerMock: ReturnType<typeof createLoggerMock>;
  factoryMock: typeof httpResponseFactoryMock;
}

const makeSut = (): SutTypes => {
  const loggerMock = createLoggerMock();
  const factoryMock = httpResponseFactoryMock;
  return {
    response: responseMock,
    loggerMock,
    factoryMock,
  };
};

describe("handleControllerError", () => {
  let sut: SutTypes;

  beforeEach(() => {
    sut = makeSut();
  });

  it("should handle AppError", () => {
    const error = new AppError("Erro", 400);
    handleControllerError(error, sut.response, sut.loggerMock, sut.factoryMock);
    expect(sut.loggerMock.error).toHaveBeenCalledWith("Erro de negócio", {
      error,
    });
    expect(sut.factoryMock.badRequest).toHaveBeenCalledWith(
      sut.response,
      error,
    );
  });

  it("should handle EmptyRequestError", () => {
    const error = new EmptyRequestError();
    handleControllerError(error, sut.response, sut.loggerMock, sut.factoryMock);
    expect(sut.loggerMock.error).toHaveBeenCalledWith("Erro de negócio", {
      error,
    });
    expect(sut.factoryMock.badRequest).toHaveBeenCalledWith(
      sut.response,
      error,
    );
  });

  it("should handle generic error", () => {
    const error = new Error("Generic");
    handleControllerError(error, sut.response, sut.loggerMock, sut.factoryMock);
    expect(sut.loggerMock.error).toHaveBeenCalledWith("Erro inesperado", {
      error,
    });
    expect(sut.factoryMock.serverError).toHaveBeenCalledWith(sut.response);
  });
});
