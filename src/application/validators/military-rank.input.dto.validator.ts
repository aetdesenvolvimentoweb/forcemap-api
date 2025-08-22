import {
  DuplicatedKeyError,
  InvalidParamError,
  MissingParamError,
} from "@application/errors";
import { MilitaryRankInputDTOValidatorProtocol } from "@application/protocols/validators";
import { MilitaryRankInputDTO } from "@domain/dtos";
import { MilitaryRankRepository } from "@domain/repositories";

interface MilitaryRankInputDTOValidatorProps {
  militaryRankRepository: MilitaryRankRepository;
}

export class MilitaryRankInputDTOValidator
  implements MilitaryRankInputDTOValidatorProtocol
{
  constructor(private readonly props: MilitaryRankInputDTOValidatorProps) {}

  private readonly validateAbbreviationPresence = (
    abbreviation: string,
  ): void => {
    if (!abbreviation || abbreviation.trim() === "") {
      throw new MissingParamError("Abreviatura");
    }
  };

  private readonly validateOrderPresence = (order: number): void => {
    if (order === null || order === undefined) {
      throw new MissingParamError("Ordem");
    }
  };

  private readonly validateAbbreviationFormat = (
    abbreviation: string,
  ): void => {
    if (abbreviation.length > 10) {
      throw new InvalidParamError(
        "Abreviatura",
        "não pode exceder 10 caracteres",
      );
    }

    if (!/^[A-Z0-9º ]+$/.test(abbreviation)) {
      throw new InvalidParamError(
        "Abreviatura",
        "deve conter apenas letras, números, espaços e/ou o caractere ordinal (º)",
      );
    }
  };

  private readonly validateOrderRange = (order: number): void => {
    if (!Number.isInteger(order)) {
      throw new InvalidParamError("Ordem", "deve ser um número inteiro");
    }

    if (order < 1) {
      throw new InvalidParamError("Ordem", "deve ser maior que 0");
    }

    if (order > 20) {
      throw new InvalidParamError("Ordem", "deve ser menor que 20");
    }
  };

  private readonly validateAbbreviationUniqueness = async (
    abbreviation: string,
    idToIgnore?: string,
  ): Promise<void> => {
    const exists =
      await this.props.militaryRankRepository.findByAbbreviation(abbreviation);
    if (exists && (!idToIgnore || exists.id !== idToIgnore)) {
      throw new DuplicatedKeyError("Abreviatura");
    }
  };

  private readonly validateOrderUniqueness = async (
    order: number,
    idToIgnore?: string,
  ): Promise<void> => {
    const exists = await this.props.militaryRankRepository.findByOrder(order);
    if (exists && (!idToIgnore || exists.id !== idToIgnore)) {
      throw new DuplicatedKeyError("Ordem");
    }
  };

  private readonly validateRequiredFields = (
    data: MilitaryRankInputDTO,
  ): void => {
    this.validateAbbreviationPresence(data.abbreviation);
    this.validateOrderPresence(data.order);
  };

  private readonly validateBusinessRules = (
    data: MilitaryRankInputDTO,
  ): void => {
    this.validateAbbreviationFormat(data.abbreviation);
    this.validateOrderRange(data.order);
  };

  private readonly validateUniqueness = async (
    data: MilitaryRankInputDTO,
    idToIgnore?: string,
  ): Promise<void> => {
    await this.validateAbbreviationUniqueness(data.abbreviation, idToIgnore);
    await this.validateOrderUniqueness(data.order, idToIgnore);
  };

  /**
   * Valida para create (idToIgnore não informado) ou update (idToIgnore informado)
   */
  public readonly validate = async (
    data: MilitaryRankInputDTO,
    idToIgnore?: string,
  ): Promise<void> => {
    this.validateRequiredFields(data);
    this.validateBusinessRules(data);
    await this.validateUniqueness(data, idToIgnore);
  };
}
