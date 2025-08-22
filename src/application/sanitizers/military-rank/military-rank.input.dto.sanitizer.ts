import { MilitaryRankInputDTOSanitizerProtocol } from "@application/protocols";
import type { LoggerProtocol } from "@application/protocols/logger.protocol";
import type { MilitaryRankInputDTO } from "@domain/dtos";

export class MilitaryRankInputDTOSanitizer
  implements MilitaryRankInputDTOSanitizerProtocol
{
  private readonly logger: LoggerProtocol;

  constructor(logger: LoggerProtocol) {
    this.logger = logger;
  }

  private readonly sanitizeAbbreviation = (abbreviation: string): string => {
    if (!abbreviation || typeof abbreviation !== "string") return abbreviation;

    return abbreviation
      .trim()
      .replace(/\s+/g, " ")
      .replace(/['";\\]/g, "")
      .replace(/--/g, "")
      .replace(/\/\*/g, "")
      .replace(/\*\//g, "");
  };

  private readonly sanitizeOrder = (order: number): number => {
    return typeof order === "string" ? parseFloat(order) : order;
  };

  public readonly sanitize = (
    data: MilitaryRankInputDTO,
  ): MilitaryRankInputDTO => {
    this.logger.info("Sanitizing MilitaryRankInputDTO", { input: data });
    const sanitized = {
      abbreviation: this.sanitizeAbbreviation(data.abbreviation),
      order: this.sanitizeOrder(data.order),
    };
    this.logger.info("Sanitized MilitaryRankInputDTO", { output: sanitized });
    return sanitized;
  };
}
