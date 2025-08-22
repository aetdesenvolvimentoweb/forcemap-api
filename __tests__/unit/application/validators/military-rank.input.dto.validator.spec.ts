import { MilitaryRankInputDTOValidator } from "@application/validators/military-rank.input.dto.validator";
import { MilitaryRankInputDTO } from "@domain/dtos";
import { createLoggerMock } from "@mocks/logger.mock";
import { createMilitaryRankRepositoryMock } from "@mocks/military-rank.repository.mock";

interface SutTypes {
  sut: MilitaryRankInputDTOValidator;
  repositoryMock: ReturnType<typeof createMilitaryRankRepositoryMock>;
  loggerMock: jest.Mocked<
    import("@application/protocols/logger.protocol").LoggerProtocol
  >;
}

const makeSut = (): SutTypes => {
  const repositoryMock = createMilitaryRankRepositoryMock();
  const loggerMock = createLoggerMock();
  const sut = new MilitaryRankInputDTOValidator({
    militaryRankRepository: repositoryMock,
    logger: loggerMock,
  });
  return { sut, repositoryMock, loggerMock };
};

describe("MilitaryRankInputDTOValidator", () => {
  let sutInstance: SutTypes;

  beforeEach(() => {
    sutInstance = makeSut();
  });

  it("should throw MissingParamError if abbreviation is missing and log error", async () => {
    // ARRANGE
    const { sut, loggerMock } = sutInstance;
    const input: MilitaryRankInputDTO = { abbreviation: "", order: 1 };

    // ACT & ASSERT
    await expect(sut.validate(input)).rejects.toThrow("Abreviatura");
    expect(loggerMock.info).toHaveBeenCalledWith(
      "Validating MilitaryRankInputDTO",
      { input, idToIgnore: undefined },
    );
    expect(loggerMock.error).toHaveBeenCalledWith(
      "Validation error in MilitaryRankInputDTO",
      expect.objectContaining({
        input,
        idToIgnore: undefined,
        error: expect.any(Error),
      }),
    );
  });

  it("should throw MissingParamError if order is missing", async () => {
    // ARRANGE
    const { sut } = sutInstance;
    const input: MilitaryRankInputDTO = {
      abbreviation: "CEL",
      // @ts-expect-error: testando campo order como undefined
      order: undefined,
    };

    // ACT & ASSERT
    await expect(sut.validate(input)).rejects.toThrow("Ordem");
  });

  it("should throw InvalidParamError if abbreviation is too long", async () => {
    // ARRANGE
    const { sut } = sutInstance;
    const input: MilitaryRankInputDTO = {
      abbreviation: "ABCDEFGHIJK",
      order: 1,
    };

    // ACT & ASSERT
    await expect(sut.validate(input)).rejects.toThrow(
      "não pode exceder 10 caracteres",
    );
  });

  it("should throw InvalidParamError if abbreviation has invalid chars", async () => {
    // ARRANGE
    const { sut } = sutInstance;
    const input: MilitaryRankInputDTO = { abbreviation: "CEL@", order: 1 };

    // ACT & ASSERT
    await expect(sut.validate(input)).rejects.toThrow(
      "deve conter apenas letras, números, espaços e/ou o caractere ordinal (º)",
    );
  });

  it("should throw InvalidParamError if order is not integer", async () => {
    // ARRANGE
    const { sut } = sutInstance;
    const input: MilitaryRankInputDTO = { abbreviation: "CEL", order: 1.5 };

    // ACT & ASSERT
    await expect(sut.validate(input)).rejects.toThrow(
      "deve ser um número inteiro",
    );
  });

  it("should throw InvalidParamError if order is less than 1", async () => {
    // ARRANGE
    const { sut } = sutInstance;
    const input: MilitaryRankInputDTO = { abbreviation: "CEL", order: 0 };

    // ACT & ASSERT
    await expect(sut.validate(input)).rejects.toThrow("deve ser maior que 0");
  });

  it("should throw InvalidParamError if order is greater than 20", async () => {
    // ARRANGE
    const { sut } = sutInstance;
    const input: MilitaryRankInputDTO = { abbreviation: "CEL", order: 21 };

    // ACT & ASSERT
    await expect(sut.validate(input)).rejects.toThrow("deve ser menor que 20");
  });

  it("should throw DuplicatedKeyError if abbreviation already exists", async () => {
    // ARRANGE
    const { sut, repositoryMock } = sutInstance;
    repositoryMock.findByAbbreviation.mockResolvedValue({ id: "1" });
    const input: MilitaryRankInputDTO = { abbreviation: "CEL", order: 1 };

    // ACT & ASSERT
    await expect(sut.validate(input)).rejects.toThrow("Abreviatura");
  });

  it("should throw DuplicatedKeyError if order already exists", async () => {
    // ARRANGE
    const { sut, repositoryMock } = sutInstance;
    repositoryMock.findByOrder.mockResolvedValue({ id: "1" });
    const input: MilitaryRankInputDTO = { abbreviation: "CEL", order: 1 };

    // ACT & ASSERT
    await expect(sut.validate(input)).rejects.toThrow("Ordem");
  });

  it("should not throw if all validations pass and log success", async () => {
    // ARRANGE
    const { sut, repositoryMock, loggerMock } = sutInstance;
    repositoryMock.findByAbbreviation.mockResolvedValue(null);
    repositoryMock.findByOrder.mockResolvedValue(null);
    const input: MilitaryRankInputDTO = { abbreviation: "CEL", order: 1 };

    // ACT
    const act = () => sut.validate(input);

    // ASSERT
    await expect(act()).resolves.toBeUndefined();
    expect(loggerMock.info).toHaveBeenCalledWith(
      "Validating MilitaryRankInputDTO",
      { input, idToIgnore: undefined },
    );
    expect(loggerMock.info).toHaveBeenCalledWith(
      "MilitaryRankInputDTO validated successfully",
      { input, idToIgnore: undefined },
    );
  });

  it("should not throw when updating and the found record has the same id as idToIgnore", async () => {
    // ARRANGE
    const { sut, repositoryMock } = sutInstance;
    repositoryMock.findByAbbreviation.mockResolvedValue({ id: "123" });
    repositoryMock.findByOrder.mockResolvedValue({ id: "123" });
    const input: MilitaryRankInputDTO = { abbreviation: "CEL", order: 1 };

    // ACT
    const act = () => sut.validate(input, "123");

    // ASSERT
    await expect(act()).resolves.toBeUndefined();
  });
});
