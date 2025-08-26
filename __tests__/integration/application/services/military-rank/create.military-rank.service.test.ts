import { LoggerProtocol } from "@application/protocols";
import { MilitaryRankInputDTOSanitizer } from "@application/sanitizers";
import { CreateMilitaryRankService } from "@application/services";
import { MilitaryRankInputDTOValidator } from "@application/validators";
import { MilitaryRankInputDTO } from "@domain/dtos";
import { InMemoryMilitaryRankRepository } from "@infra/repositories/in-memory/in-memory-military-rank.repository";
import { createLoggerMock } from "@mocks/logger.mock";

type SutTypes = {
  sut: CreateMilitaryRankService;
  repository: InMemoryMilitaryRankRepository;
  sanitizer: MilitaryRankInputDTOSanitizer;
  validator: MilitaryRankInputDTOValidator;
  logger: LoggerProtocol;
};

const makeSut = (): SutTypes => {
  const repository = new InMemoryMilitaryRankRepository();
  const logger: LoggerProtocol = createLoggerMock();
  const sanitizer = new MilitaryRankInputDTOSanitizer(logger);
  const validator = new MilitaryRankInputDTOValidator({
    militaryRankRepository: repository,
    logger,
  });
  const sut = new CreateMilitaryRankService({
    militaryRankRepository: repository,
    sanitizer,
    validator,
    logger,
  });
  repository.clear();
  return { sut, repository, sanitizer, validator, logger };
};

describe("CreateMilitaryRankService (integração)", () => {
  let sutInstance: SutTypes;

  beforeEach(() => {
    sutInstance = makeSut();
  });

  it("should create a valid military rank and persist in repository", async () => {
    // ARRANGE
    const { sut, repository } = sutInstance;
    const input: MilitaryRankInputDTO = { abbreviation: "CEL", order: 1 };

    // ACT
    await sut.create(input);

    // ASSERT
    const all = repository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].abbreviation).toBe("CEL");
    expect(all[0].order).toBe(1);
  });

  it("should throw error when trying to create duplicate military rank", async () => {
    // ARRANGE
    const { sut } = sutInstance;
    const input: MilitaryRankInputDTO = { abbreviation: "CEL", order: 1 };
    await sut.create(input);

    // ACT & ASSERT
    await expect(sut.create(input)).rejects.toThrow();
  });

  it("should throw error when trying to create with invalid data", async () => {
    // ARRANGE
    const { sut } = sutInstance;
    const input: MilitaryRankInputDTO = { abbreviation: "", order: 1 };

    // ACT & ASSERT
    await expect(sut.create(input)).rejects.toThrow();
  });
});
