import { CreateServiceSwapService } from "../../../../application/services";
import { GenericServiceFactory } from "../../common";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
  makeServiceSwapRepository,
} from "../../repositories";
import { makeServiceSwapInputDTOSanitizer } from "../../sanitizers";
import { makeServiceSwapInputDTOValidator } from "../../validators";

export const makeCreateServiceSwapService = (): CreateServiceSwapService => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);
  const serviceSwapRepository = makeServiceSwapRepository(militaryRepository);

  return GenericServiceFactory.createService({
    ServiceClass: CreateServiceSwapService,
    repositoryMaker: () => serviceSwapRepository,
    sanitizerMaker: makeServiceSwapInputDTOSanitizer,
    validatorMaker: () => makeServiceSwapInputDTOValidator(),
    repositoryKey: "serviceSwapRepository",
  });
};
