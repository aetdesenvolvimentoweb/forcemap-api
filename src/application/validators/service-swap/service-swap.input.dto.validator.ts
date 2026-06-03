import { ServiceSwapInputDTO } from "../../../domain/dtos";
import { MilitaryRepository } from "../../../domain/repositories";
import {
  BusinessRuleError,
  EntityNotFoundError,
  InvalidParamError,
} from "../../errors";
import {
  IdValidatorProtocol,
  ServiceSwapInputDTOValidatorProtocol,
} from "../../protocols";
import { ValidationPatterns } from "../common";

interface ServiceSwapInputDTOValidatorProps {
  militaryRepository: MilitaryRepository;
  idValidator: IdValidatorProtocol;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export class ServiceSwapInputDTOValidator
  implements ServiceSwapInputDTOValidatorProtocol
{
  constructor(private readonly props: ServiceSwapInputDTOValidatorProps) {}

  private readonly parseParts = (
    value: string,
  ): { y: number; mo: number; d: number; h: number; mi: number } | null => {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
    if (!match) return null;
    return {
      y: Number(match[1]),
      mo: Number(match[2]),
      d: Number(match[3]),
      h: Number(match[4]),
      mi: Number(match[5]),
    };
  };

  private readonly validateRequiredFields = (
    data: ServiceSwapInputDTO,
  ): void => {
    ValidationPatterns.validatePresence(
      data.substitutedMilitaryId,
      "Militar substituído",
    );
    ValidationPatterns.validatePresence(
      data.substituteMilitaryId,
      "Militar substituto",
    );
    ValidationPatterns.validatePresence(data.startsAt, "Horário inicial");
    ValidationPatterns.validatePresence(data.endsAt, "Horário final");
  };

  private readonly validateMilitariesDistinct = (
    data: ServiceSwapInputDTO,
  ): void => {
    if (data.substitutedMilitaryId === data.substituteMilitaryId) {
      throw new BusinessRuleError(
        "O militar substituto não pode ser igual ao militar substituído.",
      );
    }
  };

  private readonly validateSchedule = (data: ServiceSwapInputDTO): void => {
    const start = this.parseParts(data.startsAt);
    const end = this.parseParts(data.endsAt);

    if (!start) {
      throw new InvalidParamError("Horário inicial", "data/hora inválida");
    }
    if (!end) {
      throw new InvalidParamError("Horário final", "data/hora inválida");
    }

    const startMs = Date.UTC(start.y, start.mo - 1, start.d, start.h, start.mi);
    const endMs = Date.UTC(end.y, end.mo - 1, end.d, end.h, end.mi);

    if (endMs <= startMs) {
      throw new InvalidParamError(
        "Horário final",
        "não pode ser anterior ou igual ao horário inicial",
      );
    }

    if (endMs - startMs > ONE_DAY_MS) {
      throw new BusinessRuleError(
        "A troca de serviço não pode exceder 24 horas.",
      );
    }

    const nextDayLimit = Date.UTC(start.y, start.mo - 1, start.d + 1, 8, 0);
    if (endMs > nextDayLimit) {
      throw new BusinessRuleError(
        "A troca de serviço deve terminar no máximo às 08:00 do dia seguinte ao início.",
      );
    }
  };

  private readonly validateMilitariesExist = async (
    data: ServiceSwapInputDTO,
  ): Promise<void> => {
    const { idValidator, militaryRepository } = this.props;

    idValidator.validate(data.substitutedMilitaryId);
    idValidator.validate(data.substituteMilitaryId);

    const substituted = await militaryRepository.findById(
      data.substitutedMilitaryId,
    );
    if (!substituted) {
      throw new EntityNotFoundError("Militar substituído");
    }

    const substitute = await militaryRepository.findById(
      data.substituteMilitaryId,
    );
    if (!substitute) {
      throw new EntityNotFoundError("Militar substituto");
    }
  };

  public readonly validate = async (
    data: ServiceSwapInputDTO,
    _idToIgnore?: string,
  ): Promise<void> => {
    this.validateRequiredFields(data);
    this.validateMilitariesDistinct(data);
    this.validateSchedule(data);
    await this.validateMilitariesExist(data);
  };
}
