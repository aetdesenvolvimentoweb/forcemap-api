import { UnauthorizedError } from "../../application/errors";
import { LoggerProtocol } from "../../application/protocols";
import { TokenValidator } from "../../application/validators";
import { SessionRepository } from "../../domain/repositories";
import { HttpRequest, HttpResponse } from "../protocols";
import { badRequest, forbidden } from "../utils";

interface AuthMiddlewareProps {
  tokenValidator: TokenValidator;
  sessionRepository: SessionRepository;
  logger: LoggerProtocol;
}

interface AuthenticatedRequest extends HttpRequest {
  user?: {
    userId: string;
    sessionId: string;
    role: string;
    militaryId: string;
  };
  headers?: { [key: string]: string | string[] | undefined };
}

export class AuthMiddleware {
  constructor(private readonly props: AuthMiddlewareProps) {}

  public validateAuth = async (
    request: AuthenticatedRequest,
  ): Promise<AuthenticatedRequest | HttpResponse> => {
    const { tokenValidator, logger } = this.props;

    try {
      const authHeader = request.headers?.authorization as string;

      const { payload, sessionId } =
        await tokenValidator.validateAccessToken(authHeader);

      request.user = {
        userId: payload.userId,
        sessionId: sessionId,
        role: payload.role,
        militaryId: payload.militaryId,
      };

      logger.info("Usuário validado com sucesso", {
        userId: payload.userId,
        role: payload.role,
        sessionId: sessionId,
      });

      return request;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return badRequest(error);
      }
      logger.error("Erro na validação de autenticação", { error });
      return badRequest(new UnauthorizedError("Falha na autenticação"));
    }
  };

  public updateSessionAccess = async (sessionId: string): Promise<void> => {
    const { sessionRepository } = this.props;
    await sessionRepository.updateLastAccess(sessionId);
  };

  public authenticate = async (
    request: AuthenticatedRequest,
  ): Promise<AuthenticatedRequest | HttpResponse> => {
    // CQS: Separate query (validation) from command (update)
    const validatedRequest = await this.validateAuth(request);

    if ("statusCode" in validatedRequest) {
      return validatedRequest; // Return error response
    }

    // Command: Update last access after successful validation
    if ("user" in validatedRequest && validatedRequest.user?.sessionId) {
      await this.updateSessionAccess(validatedRequest.user.sessionId);
    }

    return validatedRequest;
  };

  public authorize = (allowedRoles: string[]) => {
    const { logger } = this.props;

    return (
      request: AuthenticatedRequest,
    ): AuthenticatedRequest | HttpResponse => {
      if (!request.user) {
        logger.warn("Tentativa de autorização sem usuário autenticado");
        return badRequest(new UnauthorizedError("Usuário não autenticado"));
      }

      if (!allowedRoles.includes(request.user.role)) {
        logger.warn("Acesso negado - papel insuficiente", {
          userId: request.user.userId,
          userRole: request.user.role,
          requiredRoles: allowedRoles,
        });
        return forbidden("Acesso negado");
      }

      logger.debug?.("Usuário autorizado", {
        userId: request.user.userId,
        role: request.user.role,
        allowedRoles,
      });

      return request;
    };
  };
}
