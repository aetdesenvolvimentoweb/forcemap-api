import {
  MilitaryRankRepository,
  MilitaryRepository,
} from "../../../domain/repositories";
import { MilitaryRepositoryD1 } from "../../../infra/repositories";

let instance: MilitaryRepositoryD1 | null = null;

export const makeMilitaryRepository = (
  militaryRankRepository: MilitaryRankRepository,
): MilitaryRepository => {
  if (!instance) {
    instance = new MilitaryRepositoryD1(militaryRankRepository);
  }
  return instance;
};
