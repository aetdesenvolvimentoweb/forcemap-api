import type { LoggerProtocol } from "@application/protocols";
import { MilitaryRankInputDTO } from "@domain/dtos";
import type { CreateMilitaryRankUseCase } from "@domain/use-cases";
import { EmptyRequestError } from "@presentation/errors";
import type { HttpResponseFactory } from "@presentation/factories";
import type {
  ControllerProtocol,
  HttpRequest,
  HttpResponse,
} from "@presentation/protocols";
import { handleControllerError } from "@presentation/utils";

interface CreateMilitaryRankControllerProps {
  httpResponseFactory: HttpResponseFactory;
  createMilitaryRankService: CreateMilitaryRankUseCase;
  logger: LoggerProtocol;
}

export class CreateMilitaryRankController implements ControllerProtocol {
  constructor(private readonly props: CreateMilitaryRankControllerProps) {}

  public async handle(
    request: HttpRequest,
    response: HttpResponse,
  ): Promise<void> {
    const { httpResponseFactory, createMilitaryRankService, logger } =
      this.props;

    try {
      logger.info("Recebida requisição para criar posto/graduação", {
        body: request.body,
      });

      if (
        !request.body ||
        typeof request.body !== "object" ||
        !("data" in request.body)
      ) {
        logger.warn("Body da requisição vazio ou inválido");
        httpResponseFactory.badRequest(response, new EmptyRequestError());
        return;
      }

      // Tipagem correta do DTO
      const { data } = request.body as {
        data: MilitaryRankInputDTO;
      };
      await createMilitaryRankService.create(data);

      logger.info("Posto/graduação criado com sucesso");
      httpResponseFactory.created(response);
    } catch (error: unknown) {
      handleControllerError(error, response, logger, httpResponseFactory);
      return;
    }
  }
}
