import { GetServiceDateController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeSettingsRepository } from "../../repositories";

export const makeGetServiceDateController = (): ControllerProtocol => {
  return new GetServiceDateController({
    settingsRepository: makeSettingsRepository(),
    logger: makeLogger(),
  });
};
