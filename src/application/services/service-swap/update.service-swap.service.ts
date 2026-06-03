import { ServiceSwapInputDTO } from "../../../domain/dtos";
import { ServiceSwapRepository } from "../../../domain/repositories";
import { UpdateServiceSwapUseCase } from "../../../domain/usecases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  ServiceSwapIdRegisteredValidatorProtocol,
  ServiceSwapInputDTOSanitizerProtocol,
  ServiceSwapInputDTOValidatorProtocol,
} from "../../protocols";
import { BaseUpdateService, BaseUpdateServiceDeps } from "../common";

interface UpdateServiceSwapServiceProps {
  serviceSwapRepository: ServiceSwapRepository;
  idSanitizer: IdSanitizerProtocol;
  dataSanitizer: ServiceSwapInputDTOSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: ServiceSwapIdRegisteredValidatorProtocol;
  dataValidator: ServiceSwapInputDTOValidatorProtocol;
}

export class UpdateServiceSwapService
  extends BaseUpdateService<ServiceSwapInputDTO>
  implements UpdateServiceSwapUseCase
{
  constructor(props: UpdateServiceSwapServiceProps) {
    const baseServiceDeps: BaseUpdateServiceDeps<ServiceSwapInputDTO> = {
      repository: props.serviceSwapRepository,
      idSanitizer: props.idSanitizer,
      dataSanitizer: props.dataSanitizer,
      idValidator: props.idValidator,
      idRegisteredValidator: props.idRegisteredValidator,
      dataValidator: props.dataValidator,
    };
    super(baseServiceDeps);
  }
}
