import { LoggerProtocol } from "@application/protocols";
import { CreateMilitaryRankService } from "@application/services";
import { makeMilitaryRankRepositoryFactory } from "@main/factories/repositories";
import { makeMilitaryRankInputDTOSanitizerFactory } from "@main/factories/sanitizers";
import { makeMilitaryRankInputDTOValidatorFactory } from "@main/factories/validators";

export const makeCreateMilitaryRankServiceFactory = (
  logger: LoggerProtocol,
): CreateMilitaryRankService => {
  const militaryRankRepository = makeMilitaryRankRepositoryFactory();
  const sanitizer = makeMilitaryRankInputDTOSanitizerFactory(logger);
  const validator = makeMilitaryRankInputDTOValidatorFactory(
    logger,
    militaryRankRepository,
  );

  return new CreateMilitaryRankService({
    militaryRankRepository,
    logger,
    sanitizer,
    validator,
  });
};
