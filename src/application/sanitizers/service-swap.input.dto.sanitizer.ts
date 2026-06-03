import { ServiceSwapInputDTO } from "../../domain/dtos";
import {
  IdSanitizerProtocol,
  ServiceSwapInputDTOSanitizerProtocol,
} from "../protocols";

interface ServiceSwapInputDTOSanitizerProps {
  idSanitizer: IdSanitizerProtocol;
}

export class ServiceSwapInputDTOSanitizer
  implements ServiceSwapInputDTOSanitizerProtocol
{
  constructor(private readonly props: ServiceSwapInputDTOSanitizerProps) {}

  public readonly sanitize = (
    data: ServiceSwapInputDTO,
  ): ServiceSwapInputDTO => {
    return {
      substitutedMilitaryId: this.props.idSanitizer.sanitize(
        data.substitutedMilitaryId,
      ),
      substituteMilitaryId: this.props.idSanitizer.sanitize(
        data.substituteMilitaryId,
      ),
      startsAt: (data.startsAt ?? "").trim(),
      endsAt: (data.endsAt ?? "").trim(),
    };
  };
}
