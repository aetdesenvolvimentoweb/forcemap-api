import {
  ACARepository,
  MilitaryRepository,
} from "../../../domain/repositories";
import { ACARepositoryD1 } from "../../../infra/repositories";

let instance: ACARepositoryD1 | null = null;

export const makeACARepository = (
  militaryRepository: MilitaryRepository,
): ACARepository => {
  if (!instance) {
    instance = new ACARepositoryD1(militaryRepository);
  }
  return instance;
};
