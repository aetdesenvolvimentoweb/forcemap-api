import { eq, ne } from "drizzle-orm";

import { EntityNotFoundError } from "../../../application/errors";
import { MilitaryInputDTO, MilitaryOutputDTO } from "../../../domain/dtos";
import {
  MilitaryRankRepository,
  MilitaryRepository,
} from "../../../domain/repositories";
import { getDb } from "../../db";
import { military } from "../../db/schema";

type MilitaryRow = typeof military.$inferSelect & {
  militaryRank: { id: string; abbreviation: string; order: number } | null;
};

export class MilitaryRepositoryD1 implements MilitaryRepository {
  constructor(private readonly militaryRankRepository: MilitaryRankRepository) {}

  private mapper = (row: MilitaryRow): MilitaryOutputDTO => {
    if (!row.militaryRank) {
      throw new EntityNotFoundError("Posto/Graduação");
    }
    return {
      id: row.id,
      militaryRank: row.militaryRank,
      rg: row.rg,
      name: row.name,
    };
  };

  public create = async (data: MilitaryInputDTO): Promise<void> => {
    const militaryRank = await this.militaryRankRepository.findById(
      data.militaryRankId,
    );
    if (!militaryRank) {
      throw new EntityNotFoundError("Posto/Graduação");
    }

    await getDb()
      .insert(military)
      .values({ id: crypto.randomUUID(), ...data });
  };

  public delete = async (id: string): Promise<void> => {
    await getDb().delete(military).where(eq(military.id, id));
  };

  public findByRg = async (rg: number): Promise<MilitaryOutputDTO | null> => {
    const row = await getDb().query.military.findFirst({
      where: eq(military.rg, rg),
      with: { militaryRank: true },
    });
    return row ? this.mapper(row) : null;
  };

  public findById = async (id: string): Promise<MilitaryOutputDTO | null> => {
    const row = await getDb().query.military.findFirst({
      where: eq(military.id, id),
      with: { militaryRank: true },
    });
    return row ? this.mapper(row) : null;
  };

  public listAll = async (): Promise<MilitaryOutputDTO[]> => {
    const rows = await getDb().query.military.findMany({
      where: ne(military.rg, 9999),
      with: { militaryRank: true },
    });
    return rows.map(this.mapper);
  };

  public update = async (id: string, data: MilitaryInputDTO): Promise<void> => {
    const militaryRank = await this.militaryRankRepository.findById(
      data.militaryRankId,
    );
    if (!militaryRank) {
      throw new EntityNotFoundError("Posto/Graduação");
    }

    await getDb().update(military).set(data).where(eq(military.id, id));
  };
}
