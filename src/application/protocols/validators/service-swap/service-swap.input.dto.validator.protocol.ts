import { ServiceSwapInputDTO } from "../../../../domain/dtos";

export interface ServiceSwapInputDTOValidatorProtocol {
  validate(data: ServiceSwapInputDTO, idToIgnore?: string): Promise<void>;
}
