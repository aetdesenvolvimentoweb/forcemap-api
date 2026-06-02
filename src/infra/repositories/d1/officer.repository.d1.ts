import { eq } from "drizzle-orm";

import { EntityNotFoundError } from "../../../application/errors";
import { OfficerInputDTO, OfficerOutputDTO } from "../../../domain/dtos";
import { WorkPeriod, WorkSchedule } from "../../../domain/enums";
import {
  MilitaryRepository,
  OfficerRepository,
} from "../../../domain/repositories";
import { getDb } from "../../db";
import { officer } from "../../db/schema";

export class OfficerRepositoryD1 implements OfficerRepository {
  constructor(private readonly militaryRepository: MilitaryRepository) {}

  private mapper = async (
    row: typeof officer.$inferSelect,
  ): Promise<OfficerOutputDTO> => {
    const military = await this.militaryRepository.findById(row.militaryId);
    if (!military) {
      throw new EntityNotFoundError("Oficial");
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

  public create = async (data: OfficerInputDTO): Promise<void> => {
    const military = await this.militaryRepository.findById(data.militaryId);
    if (!military || !military.id) {
      throw new EntityNotFoundError("Oficial");
    }
    await getDb()
      .insert(officer)
      .values({ id: crypto.randomUUID(), ...data });
  };

  public delete = async (id: string): Promise<void> => {
    await getDb().delete(officer).where(eq(officer.id, id));
  };

  public findByMilitaryId = async (
    militaryId: string,
  ): Promise<OfficerOutputDTO | null> => {
    const row = await getDb().query.officer.findFirst({
      where: eq(officer.militaryId, militaryId),
    });
    return row ? this.mapper(row) : null;
  };

  public findById = async (id: string): Promise<OfficerOutputDTO | null> => {
    const row = await getDb().query.officer.findFirst({
      where: eq(officer.id, id),
    });
    return row ? this.mapper(row) : null;
  };

  public listAll = async (): Promise<OfficerOutputDTO[]> => {
    const rows = await getDb().query.officer.findMany();
    return Promise.all(rows.map((row) => this.mapper(row)));
  };

  public update = async (id: string, data: OfficerInputDTO): Promise<void> => {
    const military = await this.militaryRepository.findById(data.militaryId);
    if (!military || !military.id) {
      throw new EntityNotFoundError("Oficial");
    }
    await getDb().update(officer).set(data).where(eq(officer.id, id));
  };
}
