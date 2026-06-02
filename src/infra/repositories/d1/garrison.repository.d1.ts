import { eq } from "drizzle-orm";

import { EntityNotFoundError } from "../../../application/errors";
import { GarrisonInputDTO, GarrisonOutputDTO } from "../../../domain/dtos";
import { Vehicle } from "../../../domain/entities";
import { VehicleSituation, WorkPeriod, WorkSchedule } from "../../../domain/enums";
import {
  GarrisonRepository,
  MilitaryRepository,
  VehicleRepository,
} from "../../../domain/repositories";
import { getDb } from "../../db";
import { garrison, garrisonMilitary, military, vehicle } from "../../db/schema";

type GarrisonRow = typeof garrison.$inferSelect & {
  vehicle: typeof vehicle.$inferSelect | null;
  militaryInGarrison: (typeof garrisonMilitary.$inferSelect & {
    military:
      | (typeof military.$inferSelect & {
          militaryRank: {
            id: string;
            abbreviation: string;
            order: number;
          } | null;
        })
      | null;
  })[];
};

export class GarrisonRepositoryD1 implements GarrisonRepository {
  constructor(
    private readonly militaryRepository: MilitaryRepository,
    private readonly vehicleRepository: VehicleRepository,
  ) {}

  private toVehicle = (row: NonNullable<GarrisonRow["vehicle"]>): Vehicle => ({
    id: row.id,
    name: row.name,
    situation: row.situation as VehicleSituation,
    complement: row.complement ?? undefined,
  });

  private mapper = (row: GarrisonRow): GarrisonOutputDTO => {
    if (!row.militaryInGarrison || row.militaryInGarrison.length === 0) {
      throw new EntityNotFoundError("Guarnição");
    }
    if (!row.vehicle) {
      throw new EntityNotFoundError("Viatura");
    }
    return {
      id: row.id,
      vehicle: this.toVehicle(row.vehicle),
      militaryInGarrison: row.militaryInGarrison.map((m) => {
        if (!m.military || !m.military.militaryRank) {
          throw new EntityNotFoundError("Militar");
        }
        return {
          military: {
            id: m.military.id,
            militaryRankId: m.military.militaryRankId,
            militaryRank: m.military.militaryRank,
            rg: m.military.rg,
            name: m.military.name,
          },
          workPeriod: m.workPeriod as WorkPeriod,
          workSchedule: m.workSchedule as WorkSchedule,
        };
      }),
    };
  };

  private findRow = async (id: string): Promise<GarrisonRow | undefined> => {
    return getDb().query.garrison.findFirst({
      where: eq(garrison.id, id),
      with: {
        vehicle: true,
        militaryInGarrison: {
          with: { military: { with: { militaryRank: true } } },
        },
      },
    }) as Promise<GarrisonRow | undefined>;
  };

  private assertReferencesExist = async (
    data: GarrisonInputDTO,
  ): Promise<void> => {
    const foundVehicle = await this.vehicleRepository.findById(data.vehicleId);
    if (!foundVehicle) {
      throw new EntityNotFoundError("Viatura");
    }
    for (const m of data.militaryInGarrison) {
      const military = await this.militaryRepository.findById(m.militaryId);
      if (!military) {
        throw new EntityNotFoundError("Militar");
      }
    }
  };

  public create = async (data: GarrisonInputDTO): Promise<void> => {
    await this.assertReferencesExist(data);

    const id = crypto.randomUUID();
    const db = getDb();
    await db.batch([
      db.insert(garrison).values({ id, vehicleId: data.vehicleId }),
      ...data.militaryInGarrison.map((m) =>
        db.insert(garrisonMilitary).values({
          garrisonId: id,
          militaryId: m.militaryId,
          workPeriod: m.workPeriod,
          workSchedule: m.workSchedule,
        }),
      ),
    ]);
  };

  public delete = async (id: string): Promise<void> => {
    const db = getDb();
    await db.batch([
      db.delete(garrisonMilitary).where(eq(garrisonMilitary.garrisonId, id)),
      db.delete(garrison).where(eq(garrison.id, id)),
    ]);
  };

  public findByMilitaryId = async (
    militaryId: string,
  ): Promise<GarrisonOutputDTO | null> => {
    const link = await getDb().query.garrisonMilitary.findFirst({
      where: eq(garrisonMilitary.militaryId, militaryId),
    });
    if (!link) {
      return null;
    }
    const row = await this.findRow(link.garrisonId);
    return row ? this.mapper(row) : null;
  };

  public findById = async (id: string): Promise<GarrisonOutputDTO | null> => {
    const row = await this.findRow(id);
    return row ? this.mapper(row) : null;
  };

  public listAll = async (): Promise<GarrisonOutputDTO[]> => {
    const rows = (await getDb().query.garrison.findMany({
      with: {
        vehicle: true,
        militaryInGarrison: {
          with: { military: { with: { militaryRank: true } } },
        },
      },
    })) as GarrisonRow[];
    return rows.map((row) => this.mapper(row));
  };

  public update = async (id: string, data: GarrisonInputDTO): Promise<void> => {
    await this.assertReferencesExist(data);

    const db = getDb();
    await db.batch([
      db
        .update(garrison)
        .set({ vehicleId: data.vehicleId })
        .where(eq(garrison.id, id)),
      db.delete(garrisonMilitary).where(eq(garrisonMilitary.garrisonId, id)),
      ...data.militaryInGarrison.map((m) =>
        db.insert(garrisonMilitary).values({
          garrisonId: id,
          militaryId: m.militaryId,
          workPeriod: m.workPeriod,
          workSchedule: m.workSchedule,
        }),
      ),
    ]);
  };
}
