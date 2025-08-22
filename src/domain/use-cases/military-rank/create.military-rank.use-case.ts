import { MilitaryRankInputDTO } from "@domain/dtos";

export interface CreateMilitaryRankUseCase {
  create(data: MilitaryRankInputDTO): Promise<void>;
}
