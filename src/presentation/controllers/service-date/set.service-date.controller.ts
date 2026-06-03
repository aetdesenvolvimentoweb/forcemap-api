import { LoggerProtocol } from "../../../application/protocols";
import { SettingsRepository } from "../../../domain/repositories";
import { HttpResponse } from "../../protocols";
import { ok } from "../../utils";
import { BaseController } from "../base.controller";
import { SERVICE_DATE_KEY } from "./get.service-date.controller";

const SAO_PAULO_OFFSET_MS = 3 * 60 * 60 * 1000;

interface SetServiceDateControllerProps {
  settingsRepository: SettingsRepository;
  logger: LoggerProtocol;
}

export class SetServiceDateController extends BaseController {
  constructor(private readonly props: SetServiceDateControllerProps) {
    super(props.logger);
  }

  public async handle(): Promise<HttpResponse> {
    const { settingsRepository } = this.props;

    const result = await this.executeWithErrorHandling(async () => {
      // Data "de hoje" no fuso de Brasília (UTC-3, sem horário de verão),
      // independente do fuso do servidor.
      const date = new Date(Date.now() - SAO_PAULO_OFFSET_MS)
        .toISOString()
        .slice(0, 10);
      await settingsRepository.set(SERVICE_DATE_KEY, date);
      this.logger.info("Data do serviço definida", { date });
      return ok<{ date: string }>({ date });
    }, "Erro ao definir a data do serviço");

    return result as HttpResponse;
  }
}
