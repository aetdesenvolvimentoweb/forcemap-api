import { eq } from "drizzle-orm";

import { VehicleInputDTO } from "../../../domain/dtos";
import { Vehicle } from "../../../domain/entities";
import { VehicleSituation } from "../../../domain/enums";
import { VehicleRepository } from "../../../domain/repositories";
import { getDb } from "../../db";
import { vehicle } from "../../db/schema";

export class VehicleRepositoryD1 implements VehicleRepository {
  private toVehicle = (row: typeof vehicle.$inferSelect): Vehicle => ({
    id: row.id,
    name: row.name,
    situation: row.situation as VehicleSituation,
    complement: row.complement ?? undefined,
  });

  public create = async (data: VehicleInputDTO): Promise<void> => {
    await getDb()
      .insert(vehicle)
      .values({ id: crypto.randomUUID(), ...data });
  };

  public delete = async (id: string): Promise<void> => {
    await getDb().delete(vehicle).where(eq(vehicle.id, id));
  };

  public findByName = async (name: string): Promise<Vehicle | null> => {
    const row = await getDb().query.vehicle.findFirst({
      where: eq(vehicle.name, name),
    });
    return row ? this.toVehicle(row) : null;
  };

  public findById = async (id: string): Promise<Vehicle | null> => {
    const row = await getDb().query.vehicle.findFirst({
      where: eq(vehicle.id, id),
    });
    return row ? this.toVehicle(row) : null;
  };

  public listAll = async (): Promise<Vehicle[]> => {
    const rows = await getDb().query.vehicle.findMany();
    return rows.map(this.toVehicle);
  };

  public update = async (id: string, data: VehicleInputDTO): Promise<void> => {
    await getDb().update(vehicle).set(data).where(eq(vehicle.id, id));
  };
}
