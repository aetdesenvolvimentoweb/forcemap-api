import { ServiceSwapInputDTOValidatorProtocol } from "../../../../application/protocols";
import { ServiceSwapInputDTOValidator } from "../../../../application/validators";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
} from "../../repositories";
import { makeIdValidator } from "../id.validator.factory";

export const makeServiceSwapInputDTOValidator =
  (): ServiceSwapInputDTOValidatorProtocol => {
    return new ServiceSwapInputDTOValidator({
      idValidator: makeIdValidator(),
      militaryRepository: makeMilitaryRepository(makeMilitaryRankRepository()),
    });
  };
