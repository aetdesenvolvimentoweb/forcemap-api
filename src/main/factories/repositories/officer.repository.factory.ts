import {
  MilitaryRepository,
  OfficerRepository,
} from "../../../domain/repositories";
import { OfficerRepositoryD1 } from "../../../infra/repositories";

let instance: OfficerRepositoryD1 | null = null;

export const makeOfficerRepository = (
  militaryRepository: MilitaryRepository,
): OfficerRepository => {
  if (!instance) {
    instance = new OfficerRepositoryD1(militaryRepository);
  }
  return instance;
};
