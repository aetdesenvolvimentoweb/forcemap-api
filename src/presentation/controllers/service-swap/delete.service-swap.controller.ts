import { LoggerProtocol } from "../../../application/protocols";
import { DeleteServiceSwapUseCase } from "../../../domain/usecases";
import { HttpRequest, HttpResponse } from "../../protocols";
import { emptyRequest, noContent } from "../../utils";
import { BaseController } from "../base.controller";

interface DeleteServiceSwapControllerProps {
  deleteServiceSwapService: DeleteServiceSwapUseCase;
  logger: LoggerProtocol;
}

export class DeleteServiceSwapController extends BaseController {
  constructor(private readonly props: DeleteServiceSwapControllerProps) {
    super(props.logger);
  }

  public async handle(request: HttpRequest): Promise<HttpResponse> {
    const { deleteServiceSwapService } = this.props;

    this.logger.info("Recebida requisição para deletar troca de serviço");

    const id = this.validateRequiredParam(request, "id");
    if (!id) {
      return emptyRequest();
    }

    const result = await this.executeWithErrorHandling(
      async () => {
        await deleteServiceSwapService.delete(id);
        this.logger.info("Troca de serviço deletada com sucesso", { id });
        return noContent();
      },
      "Erro ao deletar troca de serviço",
      { id },
    );

    return result as HttpResponse;
  }
}
