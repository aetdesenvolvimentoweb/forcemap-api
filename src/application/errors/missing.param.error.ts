import { AppError } from "@domain/errors";

/**
 * Erro para parâmetros obrigatórios ausentes ou vazios
 *
 * @class MissingParamError
 * @extends {AppError}
 * @description
 * Classe de erro especializada para indicar que um parâmetro obrigatório
 * não foi fornecido ou está vazio. Utilizada para validação de entrada
 * de dados e fornece mensagens padronizadas e código de status HTTP
 * apropriado (422 - Unprocessable Entity).
 */
export class MissingParamError extends AppError {
  constructor(paramName: string) {
    super(`O campo ${paramName} precisa ser preenchido.`, 422);
    this.name = "MissingParamError";
  }
}
