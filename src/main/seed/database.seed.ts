import {
  LoggerProtocol,
  PasswordHasherProtocol,
} from "../../application/protocols";
import {
  MilitaryInputDTO,
  MilitaryRankInputDTO,
  UserInputDTO,
} from "../../domain/dtos";
import { UserRole } from "../../domain/entities";
import {
  MilitaryRankRepository,
  MilitaryRepository,
  UserRepository,
} from "../../domain/repositories";
import { getEnv } from "../../infra/config";

const SEED_ADMIN_RG = 9999;

export class DatabaseSeed {
  private static hasSeeded = false;

  constructor(
    private readonly militaryRankRepository: MilitaryRankRepository,
    private readonly militaryRepository: MilitaryRepository,
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasherProtocol,
    private readonly logger: LoggerProtocol,
  ) {}

  public async run(): Promise<void> {
    if (DatabaseSeed.hasSeeded) {
      return;
    }

    await this.seedMilitaryRanks([
      { abbreviation: "Cel", order: 1 },
      { abbreviation: "TC", order: 2 },
      { abbreviation: "Maj", order: 3 },
      { abbreviation: "Cap", order: 4 },
      { abbreviation: "1º Ten", order: 5 },
      { abbreviation: "2º Ten", order: 6 },
      { abbreviation: "Asp Of", order: 7 },
      { abbreviation: "ST", order: 8 },
      { abbreviation: "1º Sgt", order: 9 },
      { abbreviation: "2º Sgt", order: 10 },
      { abbreviation: "3º Sgt", order: 11 },
      { abbreviation: "Cb", order: 12 },
      { abbreviation: "Sd 1ª Classe", order: 13 },
      { abbreviation: "Sd 2ª Classe", order: 14 },
    ]);

    await this.seedAdminUser();

    DatabaseSeed.hasSeeded = true;
    this.logger.info("Database seeded successfully");
  }

  /**
   * Cria o usuário administrador inicial. A senha NUNCA é hardcoded: vem do
   * secret `SEED_ADMIN_PASSWORD`. Sem ele, o admin não é criado (evita
   * credencial padrão conhecida) e um aviso é registrado para o operador.
   */
  private async seedAdminUser(): Promise<void> {
    const adminPassword = getEnv().SEED_ADMIN_PASSWORD;

    if (!adminPassword) {
      this.logger.warn(
        "SEED_ADMIN_PASSWORD não configurado — usuário admin não foi criado. " +
          "Defina o secret e reinicie para provisionar o administrador inicial.",
      );
      return;
    }

    const militaryRankAdmin =
      await this.militaryRankRepository.findByAbbreviation("Cel");

    await this.seedMilitaries([
      {
        militaryRankId: militaryRankAdmin!.id,
        rg: SEED_ADMIN_RG,
        name: "Administrador",
      },
    ]);

    const admin = await this.militaryRepository.findByRg(SEED_ADMIN_RG);
    const hashedPassword = await this.passwordHasher.hash(adminPassword);

    await this.seedUsers([
      {
        militaryId: admin!.id,
        role: UserRole.ADMIN,
        password: hashedPassword,
      },
    ]);
  }

  private async seedMilitaryRanks(
    ranks: MilitaryRankInputDTO[],
  ): Promise<void> {
    for (const rank of ranks) {
      const exists =
        (await this.militaryRankRepository.findByAbbreviation(
          rank.abbreviation,
        )) ?? (await this.militaryRankRepository.findByOrder(rank.order));
      if (exists) {
        continue;
      }
      await this.militaryRankRepository.create(rank);
    }
  }

  private async seedMilitaries(militaries: MilitaryInputDTO[]): Promise<void> {
    for (const military of militaries) {
      const exists = await this.militaryRepository.findByRg(military.rg);
      if (exists) {
        continue;
      }
      await this.militaryRepository.create({
        name: military.name,
        rg: military.rg,
        militaryRankId: military.militaryRankId,
      });
    }
  }

  private async seedUsers(users: UserInputDTO[]): Promise<void> {
    for (const user of users) {
      const exists = await this.userRepository.findByMilitaryId(
        user.militaryId,
      );
      if (exists) {
        continue;
      }
      await this.userRepository.create({
        militaryId: user.militaryId,
        role: user.role,
        password: user.password,
      });
    }
  }
}
