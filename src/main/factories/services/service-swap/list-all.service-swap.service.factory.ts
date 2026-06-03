import { ListAllServiceSwapService } from "../../../../application/services";
import { GenericServiceFactory } from "../../common";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
  makeServiceSwapRepository,
} from "../../repositories";

export const makeListAllServiceSwapService =
  (): ListAllServiceSwapService => {
    const militaryRankRepository = makeMilitaryRankRepository();
    const militaryRepository = makeMilitaryRepository(militaryRankRepository);
    const serviceSwapRepository = makeServiceSwapRepository(militaryRepository);

    return GenericServiceFactory.listAllService({
      ServiceClass: ListAllServiceSwapService,
      repositoryMaker: () => serviceSwapRepository,
      repositoryKey: "serviceSwapRepository",
    });
  };
