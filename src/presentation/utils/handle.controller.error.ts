import { LoggerProtocol } from "@application/protocols";
import { AppError } from "@domain/errors";
import { EmptyRequestError } from "@presentation/errors";
import { HttpResponseFactory } from "@presentation/factories";
import { HttpResponse } from "@presentation/protocols";

export function handleControllerError(
  error: unknown,
  response: HttpResponse,
  logger: LoggerProtocol,
  httpResponseFactory: HttpResponseFactory,
) {
  if (error instanceof AppError || error instanceof EmptyRequestError) {
    logger.error("Erro de negócio", { error });
    httpResponseFactory.badRequest(response, error as AppError);
    return;
  }
  logger.error("Erro inesperado", { error });
  httpResponseFactory.serverError(response);
}
