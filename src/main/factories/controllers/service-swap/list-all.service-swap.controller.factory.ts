import { ListAllServiceSwapController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeListAllServiceSwapService } from "../../services";

export const makeListAllServiceSwapController = (): ControllerProtocol => {
  const logger = makeLogger();
  const listAllServiceSwapService = makeListAllServiceSwapService();

  return new ListAllServiceSwapController({
    listAllServiceSwapService,
    logger,
  });
};
