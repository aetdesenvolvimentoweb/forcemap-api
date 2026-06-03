import { LoggerProtocol } from "../../../application/protocols";
import { UserInputDTO } from "../../../domain/dtos";
import { UserRole } from "../../../domain/entities";
import { CreateUserUseCase } from "../../../domain/usecases";
import { HttpRequest, HttpResponse } from "../../protocols";
import { created, emptyRequest } from "../../utils";
import { BaseController } from "../base.controller";

interface CreateUserControllerProps {
  createUserService: CreateUserUseCase;
  logger: LoggerProtocol;
}

export class CreateUserController extends BaseController {
  constructor(private readonly props: CreateUserControllerProps) {
    super(props.logger);
  }

  public async handle(
    request: HttpRequest<UserInputDTO>,
  ): Promise<HttpResponse> {
    const { createUserService } = this.props;

    this.logger.info("Recebida requisição para criar usuário", {
      body: {
        militaryId: request.body?.militaryId,
        role: request.body?.role,
        password: "senha oculta",
      },
    });

    const body = this.validateRequiredBody(request);
    if (!body) {
      return emptyRequest();
    }

    const requestingUserRole = request.user?.role as UserRole;

    const result = await this.executeWithErrorHandling(
      async () => {
        await createUserService.create(body, requestingUserRole);
        this.logger.info("Usuário criado com sucesso", {
          militaryId: body.militaryId,
          role: body.role,
          password: "senha oculta",
        });
        return created();
      },
      "Erro ao criar usuário",
      // NÃO passar o body cru: contém password em texto puro (logado no erro).
      { militaryId: body.militaryId, role: body.role },
    );

    return result as HttpResponse;
  }
}
