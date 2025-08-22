import { MilitaryRankInputDTOSanitizerProtocol } from "@application/protocols";
import type { LoggerProtocol } from "@application/protocols/logger.protocol";
import { MilitaryRankInputDTOValidatorProtocol } from "@application/protocols/validators";
import { MilitaryRankInputDTO } from "@domain/dtos";
import { MilitaryRankRepository } from "@domain/repositories";
import { CreateMilitaryRankUseCase } from "@domain/use-cases/military-rank";

interface CreateMilitaryRankServiceProps {
  militaryRankRepository: MilitaryRankRepository;
  sanitizer: MilitaryRankInputDTOSanitizerProtocol;
  validator: MilitaryRankInputDTOValidatorProtocol;
  logger: LoggerProtocol;
}

export class CreateMilitaryRankService implements CreateMilitaryRankUseCase {
  private readonly logger: LoggerProtocol;
  private readonly props: CreateMilitaryRankServiceProps;

  constructor(props: CreateMilitaryRankServiceProps) {
    this.props = props;
    this.logger = props.logger;
  }

  public readonly create = async (
    data: MilitaryRankInputDTO,
  ): Promise<void> => {
    const { militaryRankRepository, sanitizer, validator } = this.props;
    this.logger.info("CreateMilitaryRankService.create called", {
      input: data,
    });
    try {
      const sanitizedData = sanitizer.sanitize(data);
      this.logger.info("Sanitized data", { sanitizedData });
      await validator.validate(sanitizedData);
      this.logger.info("Validation passed", { sanitizedData });
      await militaryRankRepository.create(sanitizedData);
      this.logger.info("Military rank created successfully", { sanitizedData });
    } catch (error) {
      this.logger.error("Error creating military rank", { input: data, error });
      throw error;
    }
  };
}
