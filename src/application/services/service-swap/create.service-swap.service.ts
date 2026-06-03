import { ServiceSwapInputDTO } from "../../../domain/dtos";
import { ServiceSwapRepository } from "../../../domain/repositories";
import { CreateServiceSwapUseCase } from "../../../domain/usecases";
import {
  ServiceSwapInputDTOSanitizerProtocol,
  ServiceSwapInputDTOValidatorProtocol,
} from "../../protocols";
import { BaseCreateService, BaseCreateServiceDeps } from "../common";

interface CreateServiceSwapServiceProps {
  serviceSwapRepository: ServiceSwapRepository;
  sanitizer: ServiceSwapInputDTOSanitizerProtocol;
  validator: ServiceSwapInputDTOValidatorProtocol;
}

export class CreateServiceSwapService
  extends BaseCreateService<ServiceSwapInputDTO>
  implements CreateServiceSwapUseCase
{
  constructor(props: CreateServiceSwapServiceProps) {
    const baseServiceDeps: BaseCreateServiceDeps<ServiceSwapInputDTO> = {
      repository: props.serviceSwapRepository,
      sanitizer: props.sanitizer,
      validator: props.validator,
    };
    super(baseServiceDeps);
  }
}
