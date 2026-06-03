import { SetServiceDateController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeSettingsRepository } from "../../repositories";

export const makeSetServiceDateController = (): ControllerProtocol => {
  return new SetServiceDateController({
    settingsRepository: makeSettingsRepository(),
    logger: makeLogger(),
  });
};
