import { MilitaryRankInputDTO } from "@domain/dtos/military-rank.dto";
import { MilitaryRank } from "@domain/entities/military-rank.interface";
import { MilitaryRankRepository } from "@domain/repositories/military-rank.repository.interface";

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
