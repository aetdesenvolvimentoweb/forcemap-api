import { ServiceSwapInputDTO } from "../../dtos";

export interface UpdateServiceSwapUseCase {
  update(id: string, data: ServiceSwapInputDTO): Promise<void>;
}
