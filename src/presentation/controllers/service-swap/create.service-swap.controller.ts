import { LoggerProtocol } from "../../../application/protocols";
import { ServiceSwapInputDTO } from "../../../domain/dtos";
import { CreateServiceSwapUseCase } from "../../../domain/usecases";
import { HttpRequest, HttpResponse } from "../../protocols";
import { created, emptyRequest } from "../../utils";
import { BaseController } from "../base.controller";

interface CreateServiceSwapControllerProps {
  createServiceSwapService: CreateServiceSwapUseCase;
  logger: LoggerProtocol;
}

export class CreateServiceSwapController extends BaseController {
  constructor(private readonly props: CreateServiceSwapControllerProps) {
    super(props.logger);
  }

  public async handle(
    request: HttpRequest<ServiceSwapInputDTO>,
  ): Promise<HttpResponse> {
    const { createServiceSwapService } = this.props;

    this.logger.info("Recebida requisição para criar troca de serviço", {
      body: request.body,
    });

    const body = this.validateRequiredBody(request);
    if (!body) {
      return emptyRequest();
    }

    const result = await this.executeWithErrorHandling(
      async () => {
        await createServiceSwapService.create(body);
        this.logger.info("Troca de serviço criada com sucesso");
        return created();
      },
      "Erro ao criar troca de serviço",
      body,
    );

    return result as HttpResponse;
  }
}
