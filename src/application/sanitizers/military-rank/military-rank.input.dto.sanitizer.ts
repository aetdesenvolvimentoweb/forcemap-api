import { MilitaryRankInputDTOSanitizerProtocol } from "@application/protocols";
import type { MilitaryRankInputDTO } from "@domain/dtos";

export class MilitaryRankInputDTOSanitizer
  implements MilitaryRankInputDTOSanitizerProtocol
{
  private readonly sanitizeAbbreviation = (abbreviation: string): string => {
    if (!abbreviation || typeof abbreviation !== "string") return abbreviation;

    return abbreviation
      .trim() // Remove espaços em branco nas bordas
      .replace(/\s+/g, " ") // Normaliza espaços múltiplos para um único espaço
      .replace(/['";\\]/g, "") // Remove caracteres SQL perigosos
      .replace(/--/g, "") // Remove comentários SQL
      .replace(/\/\*/g, "") // Remove início de comentário
      .replace(/\*\//g, ""); // Remove fim de comentário
  };

  private readonly sanitizeOrder = (order: number): number => {
    // Sanitização: converte string numérica para number se necessário
    return typeof order === "string" ? parseFloat(order) : order;
  };

  public readonly sanitize = (
    data: MilitaryRankInputDTO,
  ): MilitaryRankInputDTO => {
    return {
      abbreviation: this.sanitizeAbbreviation(data.abbreviation),
      order: this.sanitizeOrder(data.order),
    };
  };
}
