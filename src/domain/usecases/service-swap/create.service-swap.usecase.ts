import { ServiceSwapInputDTO } from "../../dtos";

export interface CreateServiceSwapUseCase {
  create(data: ServiceSwapInputDTO): Promise<void>;
}
