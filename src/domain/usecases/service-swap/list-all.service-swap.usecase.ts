import { ServiceSwapOutputDTO } from "../../dtos";

export interface ListAllServiceSwapUseCase {
  listAll(): Promise<ServiceSwapOutputDTO[]>;
}
