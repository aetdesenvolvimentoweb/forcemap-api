import { FindByIdServiceSwapService } from "../../../../application/services";
import { GenericServiceFactory } from "../../common";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
  makeServiceSwapRepository,
} from "../../repositories";
import { makeIdSanitizer } from "../../sanitizers";
import {
  makeIdValidator,
  makeServiceSwapIdRegisteredValidator,
} from "../../validators";

export const makeFindByIdServiceSwapService =
  (): FindByIdServiceSwapService => {
    const militaryRankRepository = makeMilitaryRankRepository();
    const militaryRepository = makeMilitaryRepository(militaryRankRepository);
    const serviceSwapRepository = makeServiceSwapRepository(militaryRepository);

    return GenericServiceFactory.findByIdService({
      ServiceClass: FindByIdServiceSwapService,
      repositoryMaker: () => serviceSwapRepository,
      idSanitizerMaker: makeIdSanitizer,
      idValidatorMaker: makeIdValidator,
      idRegisteredValidatorMaker: () =>
        makeServiceSwapIdRegisteredValidator(serviceSwapRepository),
      repositoryKey: "serviceSwapRepository",
    });
  };
