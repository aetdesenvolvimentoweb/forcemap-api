import { DeleteServiceSwapController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeDeleteServiceSwapService } from "../../services";

export const makeDeleteServiceSwapController = (): ControllerProtocol => {
  const logger = makeLogger();
  const deleteServiceSwapService = makeDeleteServiceSwapService();

  return new DeleteServiceSwapController({
    deleteServiceSwapService,
    logger,
  });
};
