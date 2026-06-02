import {
  MilitaryRepository,
  UserRepository,
} from "../../../domain/repositories";
import { UserRepositoryD1 } from "../../../infra/repositories";

let instance: UserRepositoryD1 | null = null;

export const makeUserRepository = (
  militaryRepository: MilitaryRepository,
): UserRepository => {
  if (!instance) {
    instance = new UserRepositoryD1(militaryRepository);
  }
  return instance;
};
