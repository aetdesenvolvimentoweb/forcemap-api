import { eq } from "drizzle-orm";

import { MilitaryRankInputDTO } from "../../../domain/dtos";
import { MilitaryRank } from "../../../domain/entities";
import { MilitaryRankRepository } from "../../../domain/repositories";
import { getDb } from "../../db";
import { militaryRank } from "../../db/schema";

export class MilitaryRankRepositoryD1 implements MilitaryRankRepository {
  public create = async (data: MilitaryRankInputDTO): Promise<void> => {
    await getDb()
      .insert(militaryRank)
      .values({ id: crypto.randomUUID(), ...data });
  };

  public delete = async (id: string): Promise<void> => {
    await getDb().delete(militaryRank).where(eq(militaryRank.id, id));
  };

  public findByAbbreviation = async (
    abbreviation: string,
  ): Promise<MilitaryRank | null> => {
    const row = await getDb().query.militaryRank.findFirst({
      where: eq(militaryRank.abbreviation, abbreviation),
    });
    return row ?? null;
  };

  public findById = async (id: string): Promise<MilitaryRank | null> => {
    const row = await getDb().query.militaryRank.findFirst({
      where: eq(militaryRank.id, id),
    });
    return row ?? null;
  };

  public findByOrder = async (order: number): Promise<MilitaryRank | null> => {
    const row = await getDb().query.militaryRank.findFirst({
      where: eq(militaryRank.order, order),
    });
    return row ?? null;
  };

  public listAll = async (): Promise<MilitaryRank[]> => {
    return getDb().query.militaryRank.findMany();
  };

  public update = async (
    id: string,
    data: MilitaryRankInputDTO,
  ): Promise<void> => {
    await getDb()
      .update(militaryRank)
      .set(data)
      .where(eq(militaryRank.id, id));
  };
}
