import { MilitaryRankInputDTOValidator } from "@application/validators/military-rank.input.dto.validator";
import { MilitaryRankInputDTO } from "@domain/dtos";
import { createMilitaryRankRepositoryMock } from "@mocks/military-rank.repository.mock";

interface SutTypes {
  sut: MilitaryRankInputDTOValidator;
  repositoryMock: ReturnType<typeof createMilitaryRankRepositoryMock>;
}

const makeSut = (): SutTypes => {
  const repositoryMock = createMilitaryRankRepositoryMock();
  const sut = new MilitaryRankInputDTOValidator({
    militaryRankRepository: repositoryMock,
  });
  return { sut, repositoryMock };
};

describe("MilitaryRankInputDTOValidator", () => {
  let sutInstance: SutTypes;

  beforeEach(() => {
    sutInstance = makeSut();
  });

  it("should throw MissingParamError if abbreviation is missing", async () => {
    const { sut } = sutInstance;
    const input: MilitaryRankInputDTO = { abbreviation: "", order: 1 };
    await expect(sut.validate(input)).rejects.toThrow("Abreviatura");
  });

  it("should throw MissingParamError if order is missing", async () => {
    const { sut } = sutInstance;
    const input: MilitaryRankInputDTO = {
      abbreviation: "CEL",
      // @ts-expect-error: testando campo order como undefined
      order: undefined,
    };
    await expect(sut.validate(input)).rejects.toThrow("Ordem");
  });

  it("should throw InvalidParamError if abbreviation is too long", async () => {
    const { sut } = sutInstance;
    const input: MilitaryRankInputDTO = {
      abbreviation: "ABCDEFGHIJK",
      order: 1,
    };
    await expect(sut.validate(input)).rejects.toThrow(
      "não pode exceder 10 caracteres",
    );
  });

  it("should throw InvalidParamError if abbreviation has invalid chars", async () => {
    const { sut } = sutInstance;
    const input: MilitaryRankInputDTO = { abbreviation: "CEL@", order: 1 };
    await expect(sut.validate(input)).rejects.toThrow(
      "deve conter apenas letras, números, espaços e/ou o caractere ordinal (º)",
    );
  });

  it("should throw InvalidParamError if order is not integer", async () => {
    const { sut } = sutInstance;
    const input: MilitaryRankInputDTO = { abbreviation: "CEL", order: 1.5 };
    await expect(sut.validate(input)).rejects.toThrow(
      "deve ser um número inteiro",
    );
  });

  it("should throw InvalidParamError if order is less than 1", async () => {
    const { sut } = sutInstance;
    const input: MilitaryRankInputDTO = { abbreviation: "CEL", order: 0 };
    await expect(sut.validate(input)).rejects.toThrow("deve ser maior que 0");
  });

  it("should throw InvalidParamError if order is greater than 20", async () => {
    const { sut } = sutInstance;
    const input: MilitaryRankInputDTO = { abbreviation: "CEL", order: 21 };
    await expect(sut.validate(input)).rejects.toThrow("deve ser menor que 20");
  });

  it("should throw DuplicatedKeyError if abbreviation already exists", async () => {
    const { sut, repositoryMock } = sutInstance;
    repositoryMock.findByAbbreviation.mockResolvedValue({ id: "1" });
    const input: MilitaryRankInputDTO = { abbreviation: "CEL", order: 1 };
    await expect(sut.validate(input)).rejects.toThrow("Abreviatura");
  });

  it("should throw DuplicatedKeyError if order already exists", async () => {
    const { sut, repositoryMock } = sutInstance;
    repositoryMock.findByOrder.mockResolvedValue({ id: "1" });
    const input: MilitaryRankInputDTO = { abbreviation: "CEL", order: 1 };
    await expect(sut.validate(input)).rejects.toThrow("Ordem");
  });

  it("should not throw if all validations pass", async () => {
    const { sut, repositoryMock } = sutInstance;
    repositoryMock.findByAbbreviation.mockResolvedValue(null);
    repositoryMock.findByOrder.mockResolvedValue(null);
    const input: MilitaryRankInputDTO = { abbreviation: "CEL", order: 1 };
    await expect(sut.validate(input)).resolves.toBeUndefined();
  });

  it("should not throw when updating and the found record has the same id as idToIgnore", async () => {
    const { sut, repositoryMock } = sutInstance;
    repositoryMock.findByAbbreviation.mockResolvedValue({ id: "123" });
    repositoryMock.findByOrder.mockResolvedValue({ id: "123" });
    const input: MilitaryRankInputDTO = { abbreviation: "CEL", order: 1 };
    await expect(sut.validate(input, "123")).resolves.toBeUndefined();
  });
});
