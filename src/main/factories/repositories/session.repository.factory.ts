import { SessionRepository } from "../../../domain/repositories";
import { SessionRepositoryD1 } from "../../../infra/repositories";

let sessionRepositoryInstance: SessionRepository | null = null;

export const makeSessionRepository = (): SessionRepository => {
  if (!sessionRepositoryInstance) {
    sessionRepositoryInstance = new SessionRepositoryD1();
  }
  return sessionRepositoryInstance;
};
