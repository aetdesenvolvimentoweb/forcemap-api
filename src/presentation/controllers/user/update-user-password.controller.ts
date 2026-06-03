import { LoggerProtocol } from "../../../application/protocols";
import { UpdateUserInputDTO } from "../../../domain/dtos";
import { UpdateUserPasswordUseCase } from "../../../domain/usecases";
import { HttpRequest, HttpResponse } from "../../protocols";
import { emptyRequest, forbidden, noContent } from "../../utils";
import { BaseController } from "../base.controller";

interface UpdateUserPasswordControllerProps {
  updateUserPasswordService: UpdateUserPasswordUseCase;
  logger: LoggerProtocol;
}

export class UpdateUserPasswordController extends BaseController {
  constructor(private readonly props: UpdateUserPasswordControllerProps) {
    super(props.logger);
  }

  public async handle(
    request: HttpRequest<UpdateUserInputDTO>,
  ): Promise<HttpResponse> {
    const { updateUserPasswordService } = this.props;

    // NÃO logar o body: contém currentPassword/newPassword em texto puro.
    this.logger.info("Recebida requisição para atualizar senha do usuário", {
      params: request.params,
    });

    const id = this.validateRequiredParam(request, "id");
    if (!id) {
      return emptyRequest();
    }

    const body = this.validateRequiredBody(request);
    if (!body) {
      return emptyRequest();
    }

    // Verifica se o usuário está autenticado
    if (!request.user) {
      this.logger.warn("Tentativa de atualizar senha sem autenticação", { id });
      return forbidden("Usuário não autenticado");
    }

    // Verifica se o usuário está tentando alterar sua própria senha
    // Por segurança e conformidade com LGPD, apenas o próprio usuário pode alterar sua senha
    const isOwnPassword = request.user.userId === id;

    if (!isOwnPassword) {
      this.logger.warn("Usuário tentou alterar senha de outro usuário", {
        requestingUserId: request.user.userId,
        targetUserId: id,
        role: request.user.role,
      });
      return forbidden("Você só pode alterar sua própria senha");
    }

    const result = await this.executeWithErrorHandling(
      async () => {
        await updateUserPasswordService.updateUserPassword(id, body);
        this.logger.info("Senha do usuário atualizada com sucesso", {
          id,
          updatedBy: request.user?.userId,
        });
        return noContent();
      },
      "Erro ao atualizar senha do usuário",
      { id },
    );

    return result as HttpResponse;
  }
}
