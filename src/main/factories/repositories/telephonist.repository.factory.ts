import {
  MilitaryRepository,
  TelephonistRepository,
} from "../../../domain/repositories";
import { TelephonistRepositoryD1 } from "../../../infra/repositories";

let instance: TelephonistRepositoryD1 | null = null;

export const makeTelephonistRepository = (
  militaryRepository: MilitaryRepository,
): TelephonistRepository => {
  if (!instance) {
    instance = new TelephonistRepositoryD1(militaryRepository);
  }
  return instance;
};
