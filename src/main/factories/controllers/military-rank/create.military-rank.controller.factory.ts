import { makeLoggerFactory } from "@main/factories/logger";
import { makeCreateMilitaryRankServiceFactory } from "@main/factories/services";
import { CreateMilitaryRankController } from "@presentation/controllers/military-rank";
import { HttpResponseFactory } from "@presentation/factories";
import { ControllerProtocol } from "@presentation/protocols";

export const makeCreateMilitaryRankControllerFactory =
  (): ControllerProtocol => {
    const httpResponseFactory = new HttpResponseFactory();
    const logger = makeLoggerFactory();

    return new CreateMilitaryRankController({
      createMilitaryRankService: makeCreateMilitaryRankServiceFactory(logger),
      httpResponseFactory,
      logger,
    });
  };
