import {
  GarrisonRepository,
  MilitaryRepository,
  VehicleRepository,
} from "../../../domain/repositories";
import { GarrisonRepositoryD1 } from "../../../infra/repositories";

let instance: GarrisonRepositoryD1 | null = null;

export const makeGarrisonRepository = (
  militaryRepository: MilitaryRepository,
  vehicleRepository: VehicleRepository,
): GarrisonRepository => {
  if (!instance) {
    instance = new GarrisonRepositoryD1(militaryRepository, vehicleRepository);
  }
  return instance;
};
