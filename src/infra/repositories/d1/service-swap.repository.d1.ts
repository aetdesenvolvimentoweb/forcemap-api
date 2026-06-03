import { eq } from "drizzle-orm";

import { EntityNotFoundError } from "../../../application/errors";
import {
  ServiceSwapInputDTO,
  ServiceSwapOutputDTO,
} from "../../../domain/dtos";
import {
  MilitaryRepository,
  ServiceSwapRepository,
} from "../../../domain/repositories";
import { getDb } from "../../db";
import { serviceSwap } from "../../db/schema";

export class ServiceSwapRepositoryD1 implements ServiceSwapRepository {
  constructor(private readonly militaryRepository: MilitaryRepository) {}

  private mapper = async (
    row: typeof serviceSwap.$inferSelect,
  ): Promise<ServiceSwapOutputDTO> => {
    const substituted = await this.militaryRepository.findById(
      row.substitutedMilitaryId,
    );
    const substitute = await this.militaryRepository.findById(
      row.substituteMilitaryId,
    );
    if (!substituted || !substitute) {
      throw new EntityNotFoundError("Troca de Serviço");
    }
    return {
      id: row.id,
      substitutedMilitary: {
        id: substituted.id,
        militaryRankId: substituted.militaryRank.id,
        militaryRank: substituted.militaryRank,
        rg: substituted.rg,
        name: substituted.name,
      },
      substituteMilitary: {
        id: substitute.id,
        militaryRankId: substitute.militaryRank.id,
        militaryRank: substitute.militaryRank,
        rg: substitute.rg,
        name: substitute.name,
      },
      startsAt: row.startsAt,
      endsAt: row.endsAt,
    };
  };

  public create = async (data: ServiceSwapInputDTO): Promise<void> => {
    await getDb()
      .insert(serviceSwap)
      .values({ id: crypto.randomUUID(), ...data });
  };

  public delete = async (id: string): Promise<void> => {
    await getDb().delete(serviceSwap).where(eq(serviceSwap.id, id));
  };

  public findById = async (
    id: string,
  ): Promise<ServiceSwapOutputDTO | null> => {
    const row = await getDb().query.serviceSwap.findFirst({
      where: eq(serviceSwap.id, id),
    });
    return row ? this.mapper(row) : null;
  };

  public listAll = async (): Promise<ServiceSwapOutputDTO[]> => {
    const rows = await getDb().query.serviceSwap.findMany();
    return Promise.all(rows.map((row) => this.mapper(row)));
  };

  public update = async (
    id: string,
    data: ServiceSwapInputDTO,
  ): Promise<void> => {
    await getDb().update(serviceSwap).set(data).where(eq(serviceSwap.id, id));
  };
}
