import { FindByIdServiceSwapController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeFindByIdServiceSwapService } from "../../services";

export const makeFindByIdServiceSwapController = (): ControllerProtocol => {
  const logger = makeLogger();
  const findByIdServiceSwapService = makeFindByIdServiceSwapService();

  return new FindByIdServiceSwapController({
    findByIdServiceSwapService,
    logger,
  });
};
