import { MilitaryRankRepository } from "../../../domain/repositories";
import { MilitaryRankRepositoryD1 } from "../../../infra/repositories";

let instance: MilitaryRankRepositoryD1 | null = null;

export const makeMilitaryRankRepository = (): MilitaryRankRepository => {
  if (!instance) {
    instance = new MilitaryRankRepositoryD1();
  }
  return instance;
};
