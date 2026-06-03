import { DeleteServiceSwapService } from "../../../../application/services";
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

export const makeDeleteServiceSwapService = (): DeleteServiceSwapService => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);
  const serviceSwapRepository = makeServiceSwapRepository(militaryRepository);

  return GenericServiceFactory.deleteService({
    ServiceClass: DeleteServiceSwapService,
    repositoryMaker: () => serviceSwapRepository,
    idSanitizerMaker: makeIdSanitizer,
    idValidatorMaker: makeIdValidator,
    idRegisteredValidatorMaker: () =>
      makeServiceSwapIdRegisteredValidator(serviceSwapRepository),
    repositoryKey: "serviceSwapRepository",
  });
};
