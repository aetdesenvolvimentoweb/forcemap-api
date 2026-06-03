import { ServiceSwapInputDTO, ServiceSwapOutputDTO } from "../dtos";

export interface ServiceSwapRepository {
  create(data: ServiceSwapInputDTO): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<ServiceSwapOutputDTO | null>;
  listAll(): Promise<ServiceSwapOutputDTO[]>;
  update(id: string, data: ServiceSwapInputDTO): Promise<void>;
}
