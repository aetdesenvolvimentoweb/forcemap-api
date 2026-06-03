import {
  MilitaryRepository,
  ServiceSwapRepository,
} from "../../../domain/repositories";
import { ServiceSwapRepositoryD1 } from "../../../infra/repositories";

let instance: ServiceSwapRepositoryD1 | null = null;

export const makeServiceSwapRepository = (
  militaryRepository: MilitaryRepository,
): ServiceSwapRepository => {
  if (!instance) {
    instance = new ServiceSwapRepositoryD1(militaryRepository);
  }
  return instance;
};
