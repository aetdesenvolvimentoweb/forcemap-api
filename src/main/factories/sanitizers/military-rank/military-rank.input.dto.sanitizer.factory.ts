import { LoggerProtocol } from "@application/protocols";
import { MilitaryRankInputDTOSanitizer } from "@application/sanitizers";

export const makeMilitaryRankInputDTOSanitizerFactory = (
  logger: LoggerProtocol,
) => {
  return new MilitaryRankInputDTOSanitizer(logger);
};
