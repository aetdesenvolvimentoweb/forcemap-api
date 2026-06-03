import { ServiceSwapIdRegisteredValidatorProtocol } from "../../../../application/protocols";
import { ServiceSwapIdRegisteredValidator } from "../../../../application/validators";
import { ServiceSwapRepository } from "../../../../domain/repositories";

export const makeServiceSwapIdRegisteredValidator = (
  serviceSwapRepository: ServiceSwapRepository,
): ServiceSwapIdRegisteredValidatorProtocol => {
  return new ServiceSwapIdRegisteredValidator({
    serviceSwapRepository,
  });
};
