import { ServiceSwapOutputDTO } from "../../dtos";

export interface FindByIdServiceSwapUseCase {
  findById(id: string): Promise<ServiceSwapOutputDTO | null>;
}
