import { LoggerProtocol } from "../../../application/protocols";
import { ServiceSwapInputDTO } from "../../../domain/dtos";
import { UpdateServiceSwapUseCase } from "../../../domain/usecases";
import { HttpRequest, HttpResponse } from "../../protocols";
import { emptyRequest, noContent } from "../../utils";
import { BaseController } from "../base.controller";

interface UpdateServiceSwapControllerProps {
  updateServiceSwapService: UpdateServiceSwapUseCase;
  logger: LoggerProtocol;
}

export class UpdateServiceSwapController extends BaseController {
  constructor(private readonly props: UpdateServiceSwapControllerProps) {
    super(props.logger);
  }

  public async handle(
    request: HttpRequest<ServiceSwapInputDTO>,
  ): Promise<HttpResponse> {
    const { updateServiceSwapService } = this.props;

    this.logger.info("Recebida requisição para atualizar troca de serviço", {
      params: request.params,
      body: request.body,
    });

    const id = this.validateRequiredParam(request, "id");
    if (!id) {
      return emptyRequest();
    }

    const body = this.validateRequiredBody(request);
    if (!body) {
      return emptyRequest();
    }

    const result = await this.executeWithErrorHandling(
      async () => {
        await updateServiceSwapService.update(id, body);
        this.logger.info("Troca de serviço atualizada com sucesso", { id });
        return noContent();
      },
      "Erro ao atualizar troca de serviço",
      { id, data: body },
    );

    return result as HttpResponse;
  }
}
