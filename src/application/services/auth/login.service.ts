import { LoginInputDTO, LoginOutputDTO } from "../../../domain/dtos";
import { User } from "../../../domain/entities";
import {
  MilitaryRepository,
  UserRepository,
} from "../../../domain/repositories";
import { TooManyRequestsError, UnauthorizedError } from "../../errors";
import {
  PasswordHasherProtocol,
  SecurityLoggerProtocol,
  UserCredentialsInputDTOSanitizerProtocol,
} from "../../protocols";
import { RateLimitingService } from "./rate-limiting.service";
import { SessionManagementService } from "./session-management.service";

/**
 * Hash dummy (formato `iterations:salt:hash`) usado para executar um
 * `compare()` quando o usuário não existe, equalizando o tempo de resposta e
 * mitigando enumeração de usuário por timing. As iterações casam com o custo
 * padrão do hasher; o valor nunca confere com nenhuma senha real.
 */
const DUMMY_HASH = `100000:${btoa("\0".repeat(16))}:${btoa("\0".repeat(32))}`;

interface LoginServiceDependencies {
  userRepository: UserRepository;
  militaryRepository: MilitaryRepository;
  userCredentialsInputDTOSanitizer: UserCredentialsInputDTOSanitizerProtocol;
  passwordHasher: PasswordHasherProtocol;
  rateLimitingService: RateLimitingService;
  sessionManagementService: SessionManagementService;
  securityLogger: SecurityLoggerProtocol;
}

/**
 * Serviço de autenticação com proteção contra ataques de força bruta.
 *
 * Implementa rate limiting por IP e por usuário, logging de segurança
 * e gerenciamento de sessões com JWT.
 */
export class LoginService {
  constructor(private readonly dependencies: LoginServiceDependencies) {}

  /**
   * Autentica um usuário e retorna tokens de acesso.
   *
   * @param data - Credenciais do usuário (RG e senha)
   * @param ipAddress - IP da requisição (para rate limiting)
   * @param userAgent - User agent do cliente
   * @param request - Request Express (opcional, para logging contextual)
   * @returns Tokens de acesso e informações do usuário
   * @throws {TooManyRequestsError} Quando rate limit é excedido
   * @throws {UnauthorizedError} Quando credenciais são inválidas
   */
  public readonly authenticate = async (
    data: LoginInputDTO,
    ipAddress: string,
    userAgent: string,
  ): Promise<LoginOutputDTO> => {
    const { userCredentialsInputDTOSanitizer, rateLimitingService } =
      this.dependencies;

    // Sanitize credentials
    const sanitizedCredentials =
      userCredentialsInputDTOSanitizer.sanitize(data);

    // Validate rate limits
    const rateLimitKeys = await rateLimitingService.validateLoginAttempt(
      ipAddress,
      sanitizedCredentials.rg,
    );

    try {
      // Validate credentials and get user data
      const { user } = await this.validateCredentials(
        sanitizedCredentials,
        rateLimitKeys,
      );

      // Create user session and generate tokens
      const { accessToken, refreshToken, sessionId, expiresIn } =
        await this.dependencies.sessionManagementService.createSession(
          user,
          ipAddress,
          userAgent,
          data.deviceInfo,
        );

      // Reset rate limits on successful login
      await rateLimitingService.resetLimits(rateLimitKeys);

      // Log successful login
      this.dependencies.securityLogger.logLogin(true, user.id, sessionId, {
        rg: sanitizedCredentials.rg,
        militaryId: user.militaryId,
        userAgent,
        deviceInfo: data.deviceInfo,
      });

      // Build and return response
      return this.buildLoginResponse(
        user,
        accessToken,
        refreshToken,
        expiresIn,
      );
    } catch (error) {
      if (
        error instanceof UnauthorizedError ||
        error instanceof TooManyRequestsError
      ) {
        throw error;
      }

      // Erro inesperado (ex.: ConfigurationError de secret ausente, falha de D1).
      // NÃO mascarar como credencial inválida — registrar a tentativa e propagar
      // o erro real para que vire 500 com a mensagem verdadeira no observability.
      await rateLimitingService.recordFailedAttempt(rateLimitKeys);
      throw error;
    }
  };

  private readonly validateCredentials = async (
    sanitizedCredentials: { rg: number; password: string },
    rateLimitKeys: { ipLimitKey: string; rgLimitKey: string },
  ): Promise<{ user: User }> => {
    const { userRepository, militaryRepository, passwordHasher } =
      this.dependencies;

    const military = await militaryRepository.findByRg(sanitizedCredentials.rg);
    if (!military) {
      // Compara contra um hash dummy para equalizar o tempo de resposta e
      // mitigar enumeração de usuário por timing (RG válido vs. inválido).
      await passwordHasher.compare(sanitizedCredentials.password, DUMMY_HASH);
      return this.handleAuthenticationFailure(rateLimitKeys, {
        identifier: `RG:${sanitizedCredentials.rg}`,
        reason: "RG não encontrado",
        metadata: { rg: sanitizedCredentials.rg },
      });
    }

    const user = await userRepository.findByMilitaryIdWithPassword(military.id);
    if (!user) {
      await passwordHasher.compare(sanitizedCredentials.password, DUMMY_HASH);
      return this.handleAuthenticationFailure(rateLimitKeys, {
        identifier: `RG:${sanitizedCredentials.rg}`,
        reason: "Usuário não encontrado para o militar",
        metadata: {
          rg: sanitizedCredentials.rg,
          militaryId: military.id,
        },
      });
    }

    const passwordMatch = await passwordHasher.compare(
      sanitizedCredentials.password,
      user.password,
    );
    if (!passwordMatch) {
      return this.handleAuthenticationFailure(rateLimitKeys, {
        identifier: user.id,
        reason: "Senha incorreta",
        metadata: {
          rg: sanitizedCredentials.rg,
          userId: user.id,
        },
      });
    }

    return { user };
  };

  /**
   * Trata falhas de autenticação de forma centralizada.
   * Registra tentativa falhada, loga o evento e lança exceção.
   */
  private readonly handleAuthenticationFailure = async (
    rateLimitKeys: { ipLimitKey: string; rgLimitKey: string },
    failureData: {
      identifier: string;
      reason: string;
      metadata: Record<string, unknown>;
    },
  ): Promise<never> => {
    const { rateLimitingService, securityLogger } = this.dependencies;

    await rateLimitingService.recordFailedAttempt(rateLimitKeys);
    securityLogger.logLogin(false, failureData.identifier, undefined, {
      reason: failureData.reason,
      ...failureData.metadata,
    });
    throw new UnauthorizedError("Credenciais inválidas");
  };

  private readonly buildLoginResponse = (
    user: User,
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
  ): LoginOutputDTO => {
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        militaryId: user.militaryId,
        role: user.role,
      },
      expiresIn,
    };
  };
}
