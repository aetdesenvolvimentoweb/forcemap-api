import { MilitaryRankInputDTOSanitizer } from "@application/sanitizers";
import { CreateMilitaryRankService } from "@application/services";
import { MilitaryRankInputDTOValidator } from "@application/validators";
import { InMemoryMilitaryRankRepository } from "@infra/repositories/in-memory-military-rank.repository";
import { httpResponseFactoryMock } from "@mocks/httpResponseFactory.mock";
import { createLoggerMock } from "@mocks/logger.mock";
import { responseMock } from "@mocks/response.mock";
import { CreateMilitaryRankController } from "@presentation/controllers/military-rank";

type SutTypes = {
  sut: CreateMilitaryRankController;
  repository: InMemoryMilitaryRankRepository;
  service: CreateMilitaryRankService;
  sanitizer: MilitaryRankInputDTOSanitizer;
  validator: MilitaryRankInputDTOValidator;
  logger: ReturnType<typeof createLoggerMock>;
  httpResponseFactory: typeof httpResponseFactoryMock;
};

const makeSut = (): SutTypes => {
  const repository = new InMemoryMilitaryRankRepository();
  const logger = createLoggerMock();
  const sanitizer = new MilitaryRankInputDTOSanitizer(logger);
  const validator = new MilitaryRankInputDTOValidator({
    militaryRankRepository: repository,
    logger,
  });
  const service = new CreateMilitaryRankService({
    militaryRankRepository: repository,
    sanitizer,
    validator,
    logger,
  });
  const httpResponseFactory = httpResponseFactoryMock;
  const sut = new CreateMilitaryRankController({
    httpResponseFactory,
    createMilitaryRankService: service,
    logger,
  });
  repository.clear();
  return {
    sut,
    repository,
    service,
    sanitizer,
    validator,
    logger,
    httpResponseFactory,
  };
};

describe("CreateMilitaryRankController (integração)", () => {
  let sutInstance: SutTypes;

  beforeEach(() => {
    sutInstance = makeSut();
    jest.clearAllMocks();
  });

  it("should create a valid military rank and return created response", async () => {
    // ARRANGE
    const { sut, repository, httpResponseFactory } = sutInstance;
    const request = { body: { data: { abbreviation: "CEL", order: 1 } } };

    // ACT
    await sut.handle(request, responseMock);

    // ASSERT
    const all = repository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].abbreviation).toBe("CEL");
    expect(httpResponseFactory.created).toHaveBeenCalledWith(responseMock);
  });

  it("should return badRequest for invalid body", async () => {
    // ARRANGE
    const { sut, httpResponseFactory } = sutInstance;
    const request = { body: undefined };

    // ACT
    await sut.handle(request, responseMock);

    // ASSERT
    expect(httpResponseFactory.badRequest).toHaveBeenCalledWith(
      responseMock,
      expect.any(Error),
    );
  });

  it("should return badRequest for invalid data", async () => {
    // ARRANGE
    const { sut, httpResponseFactory } = sutInstance;
    const request = { body: { data: { abbreviation: "", order: 1 } } };

    // ACT
    await sut.handle(request, responseMock);

    // ASSERT
    expect(httpResponseFactory.badRequest).toHaveBeenCalledWith(
      responseMock,
      expect.any(Error),
    );
  });

  it("should return error for duplicate military rank", async () => {
    // ARRANGE
    const { sut, httpResponseFactory } = sutInstance;
    const request = { body: { data: { abbreviation: "CEL", order: 1 } } };
    await sut.handle(request, responseMock);

    // ACT
    await sut.handle(request, responseMock);

    // ASSERT
    expect(httpResponseFactory.badRequest).toHaveBeenCalledWith(
      responseMock,
      expect.any(Error),
    );
  });
});
