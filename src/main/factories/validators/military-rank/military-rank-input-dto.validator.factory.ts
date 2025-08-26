import { LoggerProtocol } from "@application/protocols";
import { MilitaryRankInputDTOValidatorProtocol } from "@application/protocols/validators";
import { MilitaryRankInputDTOValidator } from "@application/validators";
import { MilitaryRankRepository } from "@domain/repositories";

export const makeMilitaryRankInputDTOValidatorFactory = (
  logger: LoggerProtocol,
  militaryRankRepository: MilitaryRankRepository,
): MilitaryRankInputDTOValidatorProtocol => {
  return new MilitaryRankInputDTOValidator({
    logger,
    militaryRankRepository,
  });
};
