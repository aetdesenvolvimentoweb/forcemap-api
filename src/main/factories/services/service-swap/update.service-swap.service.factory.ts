import { UpdateServiceSwapService } from "../../../../application/services";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
  makeServiceSwapRepository,
} from "../../repositories";
import {
  makeIdSanitizer,
  makeServiceSwapInputDTOSanitizer,
} from "../../sanitizers";
import {
  makeIdValidator,
  makeServiceSwapIdRegisteredValidator,
  makeServiceSwapInputDTOValidator,
} from "../../validators";

export const makeUpdateServiceSwapService = (): UpdateServiceSwapService => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);
  const serviceSwapRepository = makeServiceSwapRepository(militaryRepository);

  return new UpdateServiceSwapService({
    serviceSwapRepository,
    idSanitizer: makeIdSanitizer(),
    dataSanitizer: makeServiceSwapInputDTOSanitizer(),
    idValidator: makeIdValidator(),
    idRegisteredValidator:
      makeServiceSwapIdRegisteredValidator(serviceSwapRepository),
    dataValidator: makeServiceSwapInputDTOValidator(),
  });
};
