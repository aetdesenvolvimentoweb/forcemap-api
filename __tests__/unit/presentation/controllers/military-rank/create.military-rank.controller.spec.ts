import { createMilitaryRankServiceMock } from "@mocks/createMilitaryRankService.mock";
import { httpResponseFactoryMock } from "@mocks/httpResponseFactory.mock";
import { createLoggerMock } from "@mocks/logger.mock";
import { responseMock } from "@mocks/response.mock";
import { CreateMilitaryRankController } from "@presentation/controllers/military-rank";
import { EmptyRequestError } from "@presentation/errors";

describe("CreateMilitaryRankController", () => {
  const makeSut = () => {
    const loggerMock = createLoggerMock();
    jest.clearAllMocks();
    const controller = new CreateMilitaryRankController({
      httpResponseFactory: httpResponseFactoryMock,
      createMilitaryRankService: createMilitaryRankServiceMock,
      logger: loggerMock,
    });
    return { controller, loggerMock };
  };

  it("should handle empty body", async () => {
    const { controller, loggerMock } = makeSut();
    await controller.handle({ body: undefined }, responseMock);
    expect(loggerMock.warn).toHaveBeenCalled();
    expect(httpResponseFactoryMock.badRequest).toHaveBeenCalledWith(
      responseMock,
      expect.any(EmptyRequestError),
    );
  });

  it("should handle valid creation", async () => {
    const { controller, loggerMock } = makeSut();
    createMilitaryRankServiceMock.create.mockResolvedValueOnce(undefined);
    await controller.handle(
      { body: { data: { nome: "Teste" } } },
      responseMock,
    );
    expect(loggerMock.info).toHaveBeenCalledWith(
      "Posto/graduação criado com sucesso",
    );
    expect(httpResponseFactoryMock.created).toHaveBeenCalledWith(responseMock);
  });

  it("should handle business error", async () => {
    const { controller, loggerMock } = makeSut();
    createMilitaryRankServiceMock.create.mockImplementationOnce(() => {
      throw new EmptyRequestError();
    });
    await controller.handle(
      { body: { data: { nome: "Teste" } } },
      responseMock,
    );
    expect(loggerMock.error).toHaveBeenCalled();
    expect(httpResponseFactoryMock.badRequest).toHaveBeenCalledWith(
      responseMock,
      expect.any(EmptyRequestError),
    );
  });

  it("should handle unexpected error", async () => {
    const { controller, loggerMock } = makeSut();
    createMilitaryRankServiceMock.create.mockImplementationOnce(() => {
      throw new Error("Generic");
    });
    await controller.handle(
      { body: { data: { nome: "Teste" } } },
      responseMock,
    );
    expect(loggerMock.error).toHaveBeenCalled();
    expect(httpResponseFactoryMock.serverError).toHaveBeenCalledWith(
      responseMock,
    );
  });
});
