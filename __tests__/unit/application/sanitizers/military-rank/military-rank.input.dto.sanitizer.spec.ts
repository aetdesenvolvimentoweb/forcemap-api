import { LoggerProtocol } from "@application/protocols";
import { MilitaryRankInputDTOSanitizer } from "@application/sanitizers";
import { createLoggerMock } from "@mocks/logger.mock";

interface SutTypes {
  sut: MilitaryRankInputDTOSanitizer;
  loggerMock: jest.Mocked<LoggerProtocol>;
}

const makeSut = (): SutTypes => {
  const loggerMock = createLoggerMock();
  const sut = new MilitaryRankInputDTOSanitizer(loggerMock);
  return {
    sut,
    loggerMock,
  };
};

describe("MilitaryRankInputDTOSanitizer", () => {
  let sutInstance: SutTypes;

  beforeEach(() => {
    sutInstance = makeSut();
  });

  describe("abbreviation sanitization", () => {
    it("should trim and convert abbreviation to uppercase and log input/output", () => {
      // ARRANGE
      const { sut, loggerMock } = sutInstance;
      const inputDto = { abbreviation: "  cel  ", order: 1 };

      // ACT
      const result = sut.sanitize(inputDto);

      // ASSERT
      expect(result.abbreviation).toBe("cel");
      expect(loggerMock.info).toHaveBeenCalledWith(
        "Sanitizing MilitaryRankInputDTO",
        { input: inputDto },
      );
      expect(loggerMock.info).toHaveBeenCalledWith(
        "Sanitized MilitaryRankInputDTO",
        { output: result },
      );
    });

    it("should normalize multiple spaces to single space", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto = { abbreviation: "1º   TEN", order: 1 };

      // ACT
      const result = sut.sanitize(inputDto);

      // ASSERT
      expect(result.abbreviation).toBe("1º TEN");
    });

    it("should remove dangerous characters while preserving valid ones", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto = { abbreviation: "1º'TEN;--", order: 1 };

      // ACT
      const result = sut.sanitize(inputDto);

      // ASSERT
      expect(result.abbreviation).toBe("1ºTEN");
    });

    it("should preserve invalid input for validator to handle", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto = { abbreviation: null, order: 1 } as unknown as {
        abbreviation: string;
        order: number;
      };

      // ACT
      const result = sut.sanitize(inputDto);

      // ASSERT
      expect(result.abbreviation).toBe(null);
    });
  });

  describe("order sanitization", () => {
    it("should convert string number to integer", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto = { abbreviation: "CEL", order: "5" } as unknown as {
        abbreviation: string;
        order: number;
      };

      // ACT
      const result = sut.sanitize(inputDto);

      // ASSERT
      expect(result.order).toBe(5);
      expect(typeof result.order).toBe("number");
    });

    it("should preserve null and undefined", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDtoNull = { abbreviation: "CEL", order: null } as unknown as {
        abbreviation: string;
        order: number;
      };
      const inputDtoUndefined = {
        abbreviation: "CEL",
        order: undefined,
      } as unknown as {
        abbreviation: string;
        order: number;
      };

      // ACT
      const resultNull = sut.sanitize(inputDtoNull);
      const resultUndefined = sut.sanitize(inputDtoUndefined);

      // ASSERT
      expect(resultNull.order).toBe(null);
      expect(resultUndefined.order).toBe(undefined);
    });
  });

  describe("complete sanitization", () => {
    it("should sanitize both abbreviation and order", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto = { abbreviation: "  1º Ten  ", order: 5.8 };

      // ACT
      const result = sut.sanitize(inputDto);

      // ASSERT
      expect(result.abbreviation).toBe("1º Ten");
      expect(result.order).toBe(5.8);
    });
  });
});
