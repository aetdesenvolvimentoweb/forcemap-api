import { LoggerProtocol } from "../../../application/protocols";
import { ServiceSwapOutputDTO } from "../../../domain/dtos";
import { FindByIdServiceSwapUseCase } from "../../../domain/usecases";
import { HttpRequest, HttpResponse } from "../../protocols";
import { emptyRequest, ok } from "../../utils";
import { BaseController } from "../base.controller";

interface FindByIdServiceSwapControllerProps {
  findByIdServiceSwapService: FindByIdServiceSwapUseCase;
  logger: LoggerProtocol;
}

export class FindByIdServiceSwapController extends BaseController {
  constructor(private readonly props: FindByIdServiceSwapControllerProps) {
    super(props.logger);
  }

  public async handle(
    request: HttpRequest,
  ): Promise<HttpResponse | HttpResponse<ServiceSwapOutputDTO | null>> {
    const { findByIdServiceSwapService } = this.props;

    this.logger.info("Recebida requisição para listar troca de serviço por ID", {
      params: request.params,
    });

    const id = this.validateRequiredParam(request, "id");
    if (!id) {
      return emptyRequest();
    }

    const result = await this.executeWithErrorHandling(
      async () => {
        const serviceSwap = await findByIdServiceSwapService.findById(id);
        this.logger.info("Troca de serviço encontrada com sucesso", {
          id,
          found: !!serviceSwap,
        });
        return ok<ServiceSwapOutputDTO | null>(serviceSwap);
      },
      "Erro ao listar troca de serviço",
      { id },
    );

    return result as HttpResponse;
  }
}
