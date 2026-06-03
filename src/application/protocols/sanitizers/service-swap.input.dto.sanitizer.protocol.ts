import { ServiceSwapInputDTO } from "../../../domain/dtos";

export interface ServiceSwapInputDTOSanitizerProtocol {
  sanitize(data: ServiceSwapInputDTO): ServiceSwapInputDTO;
}
