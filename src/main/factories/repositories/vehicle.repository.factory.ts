import { VehicleRepository } from "../../../domain/repositories";
import { VehicleRepositoryD1 } from "../../../infra/repositories";

let instance: VehicleRepositoryD1 | null = null;

export const makeVehicleRepository = (): VehicleRepository => {
  if (!instance) {
    instance = new VehicleRepositoryD1();
  }
  return instance;
};
