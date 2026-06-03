import { ServiceSwapRepository } from "../../../domain/repositories";
import { DeleteServiceSwapUseCase } from "../../../domain/usecases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  ServiceSwapIdRegisteredValidatorProtocol,
} from "../../protocols";
import { BaseDeleteService, BaseDeleteServiceDeps } from "../common";

interface DeleteServiceSwapServiceProps {
  serviceSwapRepository: ServiceSwapRepository;
  sanitizer: IdSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: ServiceSwapIdRegisteredValidatorProtocol;
}

export class DeleteServiceSwapService
  extends BaseDeleteService
  implements DeleteServiceSwapUseCase
{
  constructor(props: DeleteServiceSwapServiceProps) {
    const baseServiceDeps: BaseDeleteServiceDeps = {
      repository: props.serviceSwapRepository,
      idSanitizer: props.sanitizer,
      idValidator: props.idValidator,
      idRegisteredValidator: props.idRegisteredValidator,
    };
    super(baseServiceDeps);
  }
}
