import { UpdateServiceSwapController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeUpdateServiceSwapService } from "../../services";

export const makeUpdateServiceSwapController = (): ControllerProtocol => {
  const logger = makeLogger();
  const updateServiceSwapService = makeUpdateServiceSwapService();

  return new UpdateServiceSwapController({
    updateServiceSwapService,
    logger,
  });
};
