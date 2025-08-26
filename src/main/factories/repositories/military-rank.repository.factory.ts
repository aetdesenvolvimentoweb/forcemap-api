import { MilitaryRankRepository } from "@domain/repositories";
import { InMemoryMilitaryRankRepository } from "@infra/repositories";

export const makeMilitaryRankRepositoryFactory = (): MilitaryRankRepository => {
  return new InMemoryMilitaryRankRepository();
};
