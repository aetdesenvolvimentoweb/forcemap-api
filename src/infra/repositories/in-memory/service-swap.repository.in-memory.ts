import { EntityNotFoundError } from "../../../application/errors";
import {
  ServiceSwapInputDTO,
  ServiceSwapOutputDTO,
} from "../../../domain/dtos";
import { ServiceSwap } from "../../../domain/entities";
import {
  MilitaryRepository,
  ServiceSwapRepository,
} from "../../../domain/repositories";

export class ServiceSwapRepositoryInMemory implements ServiceSwapRepository {
  private items: ServiceSwap[] = [];

  constructor(private readonly militaryRepository: MilitaryRepository) {}

  private mapper = async (
    item: ServiceSwap,
  ): Promise<ServiceSwapOutputDTO> => {
    if (!item.substitutedMilitary || !item.substituteMilitary) {
      throw new EntityNotFoundError("Troca de Serviço");
    }
    return {
      id: item.id,
      substitutedMilitary: item.substitutedMilitary,
      substituteMilitary: item.substituteMilitary,
      startsAt: item.startsAt,
      endsAt: item.endsAt,
    };
  };

  public create = async (data: ServiceSwapInputDTO): Promise<void> => {
    const substituted = await this.militaryRepository.findById(
      data.substitutedMilitaryId,
    );
    const substitute = await this.militaryRepository.findById(
      data.substituteMilitaryId,
    );
    if (!substituted || !substitute) {
      throw new EntityNotFoundError("Troca de Serviço");
    }
    this.items.push({
      ...data,
      id: crypto.randomUUID(),
      substitutedMilitary: {
        id: substituted.id,
        militaryRankId: substituted.militaryRank.id,
        militaryRank: substituted.militaryRank,
        rg: substituted.rg,
        name: substituted.name,
      },
      substituteMilitary: {
        id: substitute.id,
        militaryRankId: substitute.militaryRank.id,
        militaryRank: substitute.militaryRank,
        rg: substitute.rg,
        name: substitute.name,
      },
    });
  };

  public delete = async (id: string): Promise<void> => {
    this.items = this.items.filter((item) => item.id !== id);
  };

  public findById = async (
    id: string,
  ): Promise<ServiceSwapOutputDTO | null> => {
    const item = this.items.find((i) => i.id === id);
    return item ? this.mapper(item) : null;
  };

  public listAll = async (): Promise<ServiceSwapOutputDTO[]> => {
    return Promise.all(this.items.map((item) => this.mapper(item)));
  };

  public update = async (
    id: string,
    data: ServiceSwapInputDTO,
  ): Promise<void> => {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return;

    const substituted = await this.militaryRepository.findById(
      data.substitutedMilitaryId,
    );
    const substitute = await this.militaryRepository.findById(
      data.substituteMilitaryId,
    );
    if (!substituted || !substitute) {
      throw new EntityNotFoundError("Troca de Serviço");
    }

    this.items[index] = {
      ...this.items[index],
      ...data,
      substitutedMilitary: {
        id: substituted.id,
        militaryRankId: substituted.militaryRank.id,
        militaryRank: substituted.militaryRank,
        rg: substituted.rg,
        name: substituted.name,
      },
      substituteMilitary: {
        id: substitute.id,
        militaryRankId: substitute.militaryRank.id,
        militaryRank: substitute.militaryRank,
        rg: substitute.rg,
        name: substitute.name,
      },
    };
  };
}
