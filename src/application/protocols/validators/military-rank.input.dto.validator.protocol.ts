import type { MilitaryRankInputDTO } from "@domain/dtos";

export interface MilitaryRankInputDTOValidatorProtocol {
  validate(data: MilitaryRankInputDTO, idToIgnore?: string): Promise<void>;
}
