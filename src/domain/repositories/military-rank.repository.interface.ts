import { MilitaryRankInputDTO } from "@domain/dtos";
import type { MilitaryRank } from "@domain/entities";

export interface MilitaryRankRepository {
  create(data: MilitaryRankInputDTO): Promise<void>;
  findByAbbreviation(abbreviation: string): Promise<MilitaryRank | null>;
  findByOrder(order: number): Promise<MilitaryRank | null>;
}
