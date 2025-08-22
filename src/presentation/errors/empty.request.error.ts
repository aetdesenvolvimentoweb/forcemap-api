import { AppError } from "@domain/errors";

export class EmptyRequestError extends AppError {
  constructor() {
    super("Campos obrigatórios não foram preenchidos.", 422);
    this.name = "EmptyRequestError";
  }
}
