import { LoggerProtocol } from "../../../application/protocols";
import { SettingsRepository } from "../../../domain/repositories";
import { HttpResponse } from "../../protocols";
import { ok } from "../../utils";
import { BaseController } from "../base.controller";

export const SERVICE_DATE_KEY = "service_date";

interface GetServiceDateControllerProps {
  settingsRepository: SettingsRepository;
  logger: LoggerProtocol;
}

export class GetServiceDateController extends BaseController {
  constructor(private readonly props: GetServiceDateControllerProps) {
    super(props.logger);
  }

  public async handle(): Promise<HttpResponse> {
    const { settingsRepository } = this.props;

    const result = await this.executeWithErrorHandling(async () => {
      const date = await settingsRepository.get(SERVICE_DATE_KEY);
      return ok<{ date: string | null }>({ date });
    }, "Erro ao obter a data do serviço");

    return result as HttpResponse;
  }
}
