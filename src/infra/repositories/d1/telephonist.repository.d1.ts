import { eq } from "drizzle-orm";

import { EntityNotFoundError } from "../../../application/errors";
import {
  TelephonistInputDTO,
  TelephonistOutputDTO,
} from "../../../domain/dtos";
import { WorkPeriod, WorkSchedule } from "../../../domain/enums";
import {
  MilitaryRepository,
  TelephonistRepository,
} from "../../../domain/repositories";
import { getDb } from "../../db";
import { telephonist } from "../../db/schema";

export class TelephonistRepositoryD1 implements TelephonistRepository {
  constructor(private readonly militaryRepository: MilitaryRepository) {}

  private mapper = async (
    row: typeof telephonist.$inferSelect,
  ): Promise<TelephonistOutputDTO> => {
    const military = await this.militaryRepository.findById(row.militaryId);
    if (!military) {
      throw new EntityNotFoundError("Telefonista");
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

  public create = async (data: TelephonistInputDTO): Promise<void> => {
    const military = await this.militaryRepository.findById(data.militaryId);
    if (!military || !military.id) {
      throw new EntityNotFoundError("Telefonista");
    }
    await getDb()
      .insert(telephonist)
      .values({ id: crypto.randomUUID(), ...data });
  };

  public delete = async (id: string): Promise<void> => {
    await getDb().delete(telephonist).where(eq(telephonist.id, id));
  };

  public findByMilitaryId = async (
    militaryId: string,
  ): Promise<TelephonistOutputDTO | null> => {
    const row = await getDb().query.telephonist.findFirst({
      where: eq(telephonist.militaryId, militaryId),
    });
    return row ? this.mapper(row) : null;
  };

  public findById = async (
    id: string,
  ): Promise<TelephonistOutputDTO | null> => {
    const row = await getDb().query.telephonist.findFirst({
      where: eq(telephonist.id, id),
    });
    return row ? this.mapper(row) : null;
  };

  public listAll = async (): Promise<TelephonistOutputDTO[]> => {
    const rows = await getDb().query.telephonist.findMany();
    return Promise.all(rows.map((row) => this.mapper(row)));
  };

  public update = async (
    id: string,
    data: TelephonistInputDTO,
  ): Promise<void> => {
    const military = await this.militaryRepository.findById(data.militaryId);
    if (!military || !military.id) {
      throw new EntityNotFoundError("Telefonista");
    }
    await getDb().update(telephonist).set(data).where(eq(telephonist.id, id));
  };
}
