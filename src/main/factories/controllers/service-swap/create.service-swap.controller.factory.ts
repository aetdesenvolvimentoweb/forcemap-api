import { CreateServiceSwapController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeCreateServiceSwapService } from "../../services";

export const makeCreateServiceSwapController = (): ControllerProtocol => {
  const logger = makeLogger();
  const createServiceSwapService = makeCreateServiceSwapService();

  return new CreateServiceSwapController({
    createServiceSwapService,
    logger,
  });
};
