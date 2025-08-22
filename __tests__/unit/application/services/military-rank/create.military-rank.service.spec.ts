import { MilitaryRankInputDTOSanitizer } from "@application/sanitizers";
import { CreateMilitaryRankService } from "@application/services";
import { MilitaryRankInputDTOValidator } from "@application/validators";
import { MilitaryRankInputDTO } from "@domain/dtos";
import { createLoggerMock } from "@mocks/logger.mock";
import { createMilitaryRankRepositoryMock } from "@mocks/military-rank.repository.mock";

interface SutTypes {
  sut: CreateMilitaryRankService;
  loggerMock: ReturnType<typeof createLoggerMock>;
  repositoryMock: ReturnType<typeof createMilitaryRankRepositoryMock>;
  sanitizer: MilitaryRankInputDTOSanitizer;
  validator: MilitaryRankInputDTOValidator;
}

const makeSut = (): SutTypes => {
  const loggerMock = createLoggerMock();
  const repositoryMock = createMilitaryRankRepositoryMock();
  const sanitizer = new MilitaryRankInputDTOSanitizer(loggerMock);
  const validator = new MilitaryRankInputDTOValidator({
    militaryRankRepository: repositoryMock,
    logger: loggerMock,
  });
  const sut = new CreateMilitaryRankService({
    militaryRankRepository: repositoryMock,
    sanitizer,
    validator,
    logger: loggerMock,
  });
  return { sut, loggerMock, repositoryMock, sanitizer, validator };
};

describe("CreateMilitaryRankService", () => {
  let sutInstance: SutTypes;

  beforeEach(() => {
    sutInstance = makeSut();
  });

  it("should sanitize, validate and create a military rank, logging all steps", async () => {
    // ARRANGE
    const { sut, loggerMock, repositoryMock } = sutInstance;
    const input: MilitaryRankInputDTO = { abbreviation: "CEL", order: 1 };
    repositoryMock.create.mockResolvedValue(undefined);
    repositoryMock.findByAbbreviation.mockResolvedValue(null);
    repositoryMock.findByOrder.mockResolvedValue(null);

    // ACT
    await sut.create(input);

    // ASSERT
    expect(loggerMock.info).toHaveBeenCalledWith(
      "CreateMilitaryRankService.create called",
      { input },
    );
    expect(loggerMock.info).toHaveBeenCalledWith("Sanitized data", {
      sanitizedData: { abbreviation: "CEL", order: 1 },
    });
    expect(loggerMock.info).toHaveBeenCalledWith("Validation passed", {
      sanitizedData: { abbreviation: "CEL", order: 1 },
    });
    expect(loggerMock.info).toHaveBeenCalledWith(
      "Military rank created successfully",
      { sanitizedData: { abbreviation: "CEL", order: 1 } },
    );
    expect(repositoryMock.create).toHaveBeenCalledWith({
      abbreviation: "CEL",
      order: 1,
    });
  });

  it("should log and throw if validator throws", async () => {
    // ARRANGE
    const { sut, loggerMock, validator } = sutInstance;
    const input: MilitaryRankInputDTO = { abbreviation: "CEL", order: 1 };
    const error = new Error("Validation error");
    jest.spyOn(validator, "validate").mockRejectedValue(error);

    // ACT & ASSERT
    await expect(sut.create(input)).rejects.toThrow(error);
    expect(loggerMock.error).toHaveBeenCalledWith(
      "Error creating military rank",
      expect.objectContaining({ input, error }),
    );
  });
});
