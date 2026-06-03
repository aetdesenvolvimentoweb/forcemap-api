import { ServiceSwapOutputDTO } from "../../../domain/dtos";
import { ServiceSwapRepository } from "../../../domain/repositories";
import { FindByIdServiceSwapUseCase } from "../../../domain/usecases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  ServiceSwapIdRegisteredValidatorProtocol,
} from "../../protocols";
import { BaseFindByIdService, BaseFindByIdServiceDeps } from "../common";

interface FindByIdServiceSwapServiceProps {
  serviceSwapRepository: ServiceSwapRepository;
  sanitizer: IdSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: ServiceSwapIdRegisteredValidatorProtocol;
}

export class FindByIdServiceSwapService
  extends BaseFindByIdService<ServiceSwapOutputDTO>
  implements FindByIdServiceSwapUseCase
{
  constructor(props: FindByIdServiceSwapServiceProps) {
    const baseServiceDeps: BaseFindByIdServiceDeps<ServiceSwapOutputDTO> = {
      repository: props.serviceSwapRepository,
      idSanitizer: props.sanitizer,
      idValidator: props.idValidator,
      idRegisteredValidator: props.idRegisteredValidator,
    };
    super(baseServiceDeps);
  }
}
