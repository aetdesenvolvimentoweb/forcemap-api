import { MilitaryRankInputDTO } from "@domain/dtos";
import { MilitaryRank } from "@domain/entities";
import { MilitaryRankRepository } from "@domain/repositories";

export class InMemoryMilitaryRankRepository implements MilitaryRankRepository {
  private items: MilitaryRank[] = [];

  async create(data: MilitaryRankInputDTO): Promise<void> {
    const entity: MilitaryRank = {
      ...data,
      id: `${Date.now()}-${Math.random()}`,
    };
    this.items.push(entity);
  }

  async findByAbbreviation(abbreviation: string): Promise<MilitaryRank | null> {
    return (
      this.items.find((item) => item.abbreviation === abbreviation) || null
    );
  }

  async findByOrder(order: number): Promise<MilitaryRank | null> {
    return this.items.find((item) => item.order === order) || null;
  }

  // Métodos utilitários para testes
  clear(): void {
    this.items = [];
  }

  getAll(): MilitaryRank[] {
    return [...this.items];
  }
}
