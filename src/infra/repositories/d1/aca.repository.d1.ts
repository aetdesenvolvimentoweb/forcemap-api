import { eq } from "drizzle-orm";

import { EntityNotFoundError } from "../../../application/errors";
import { ACAInputDTO, ACAOutputDTO } from "../../../domain/dtos";
import { WorkPeriod, WorkSchedule } from "../../../domain/enums";
import {
  ACARepository,
  MilitaryRepository,
} from "../../../domain/repositories";
import { getDb } from "../../db";
import { aca } from "../../db/schema";

export class ACARepositoryD1 implements ACARepository {
  constructor(private readonly militaryRepository: MilitaryRepository) {}

  private mapper = async (
    row: typeof aca.$inferSelect,
  ): Promise<ACAOutputDTO> => {
    const military = await this.militaryRepository.findById(row.militaryId);
    if (!military) {
      throw new EntityNotFoundError("ACA");
    }
    return {
      id: row.id,
      military: {
        id: military.id,
        militaryRankId: military.militaryRank.id,
        militaryRank: military.militaryRank,
        rg: military.rg,
        name: military.name,
      },
      workPeriod: row.workPeriod as WorkPeriod,
      workSchedule: row.workSchedule as WorkSchedule,
    };
  };

  public create = async (data: ACAInputDTO): Promise<void> => {
    const military = await this.militaryRepository.findById(data.militaryId);
    if (!military || !military.id) {
      throw new EntityNotFoundError("ACA");
    }
    await getDb()
      .insert(aca)
      .values({ id: crypto.randomUUID(), ...data });
  };

  public delete = async (id: string): Promise<void> => {
    await getDb().delete(aca).where(eq(aca.id, id));
  };

  public findByMilitaryId = async (
    militaryId: string,
  ): Promise<ACAOutputDTO | null> => {
    const row = await getDb().query.aca.findFirst({
      where: eq(aca.militaryId, militaryId),
    });
    return row ? this.mapper(row) : null;
  };

  public findById = async (id: string): Promise<ACAOutputDTO | null> => {
    const row = await getDb().query.aca.findFirst({
      where: eq(aca.id, id),
    });
    return row ? this.mapper(row) : null;
  };

  public listAll = async (): Promise<ACAOutputDTO[]> => {
    const rows = await getDb().query.aca.findMany();
    return Promise.all(rows.map((row) => this.mapper(row)));
  };

  public update = async (id: string, data: ACAInputDTO): Promise<void> => {
    const military = await this.militaryRepository.findById(data.militaryId);
    if (!military || !military.id) {
      throw new EntityNotFoundError("ACA");
    }
    await getDb().update(aca).set(data).where(eq(aca.id, id));
  };
}
