import type { AppError } from "@domain/errors";
import type { HttpResponse } from "@presentation/protocols";

export class HttpResponseFactory {
  public badRequest(response: HttpResponse, error: AppError): void {
    response.status(error.statusCode ?? 422).json({ error: error.message });
  }

  public serverError(response: HttpResponse): void {
    response.status(500).json({ error: "Erro interno no servidor." });
  }

  public created(response: HttpResponse): void {
    response.status(201).send(null);
  }
}
