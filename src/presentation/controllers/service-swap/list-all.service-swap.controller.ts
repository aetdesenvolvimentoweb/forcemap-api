import { LoggerProtocol } from "../../../application/protocols";
import { ServiceSwapOutputDTO } from "../../../domain/dtos";
import { ListAllServiceSwapUseCase } from "../../../domain/usecases";
import { HttpResponse } from "../../protocols";
import { ok } from "../../utils";
import { BaseController } from "../base.controller";

interface ListAllServiceSwapControllerProps {
  listAllServiceSwapService: ListAllServiceSwapUseCase;
  logger: LoggerProtocol;
}

export class ListAllServiceSwapController extends BaseController {
  constructor(private readonly props: ListAllServiceSwapControllerProps) {
    super(props.logger);
  }

  public async handle(): Promise<HttpResponse> {
    const { listAllServiceSwapService } = this.props;

    this.logger.info("Recebida requisição para listar todas as trocas de serviço");

    const result = await this.executeWithErrorHandling(async () => {
      const serviceSwaps = await listAllServiceSwapService.listAll();
      this.logger.info("Trocas de serviço listadas com sucesso", {
        count: serviceSwaps.length,
      });
      return ok<ServiceSwapOutputDTO[]>(serviceSwaps);
    }, "Erro ao listar trocas de serviço");

    return result as HttpResponse;
  }
}
