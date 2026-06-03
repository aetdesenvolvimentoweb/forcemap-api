import { ServiceSwapOutputDTO } from "../../../domain/dtos";
import { ServiceSwapRepository } from "../../../domain/repositories";
import { ListAllServiceSwapUseCase } from "../../../domain/usecases";
import { BaseListAllService, BaseListAllServiceDeps } from "../common";

interface ListAllServiceSwapServiceProps {
  serviceSwapRepository: ServiceSwapRepository;
}

export class ListAllServiceSwapService
  extends BaseListAllService<ServiceSwapOutputDTO>
  implements ListAllServiceSwapUseCase
{
  constructor(props: ListAllServiceSwapServiceProps) {
    const baseServiceDeps: BaseListAllServiceDeps<ServiceSwapOutputDTO> = {
      repository: props.serviceSwapRepository,
    };
    super(baseServiceDeps);
  }
}
