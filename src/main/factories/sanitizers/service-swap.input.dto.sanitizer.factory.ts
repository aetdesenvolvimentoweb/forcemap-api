import { ServiceSwapInputDTOSanitizerProtocol } from "../../../application/protocols";
import { ServiceSwapInputDTOSanitizer } from "../../../application/sanitizers";
import { makeIdSanitizer } from "./id.sanitizer.factory";

export const makeServiceSwapInputDTOSanitizer =
  (): ServiceSwapInputDTOSanitizerProtocol => {
    const idSanitizer = makeIdSanitizer();
    return new ServiceSwapInputDTOSanitizer({
      idSanitizer,
    });
  };
