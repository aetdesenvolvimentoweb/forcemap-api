import { eq } from "drizzle-orm";

import { EntityNotFoundError } from "../../../application/errors";
import { SYSTEM_USER_RG } from "../../../domain/constants";
import {
  UpdateUserInputDTO,
  UserInputDTO,
  UserOutputDTO,
} from "../../../domain/dtos";
import { User, UserRole } from "../../../domain/entities";
import {
  MilitaryRepository,
  UserRepository,
} from "../../../domain/repositories";
import { getDb } from "../../db";
import { user } from "../../db/schema";

export class UserRepositoryD1 implements UserRepository {
  constructor(private readonly militaryRepository: MilitaryRepository) {}

  private toUser = (row: typeof user.$inferSelect): User => ({
    id: row.id,
    militaryId: row.militaryId,
    role: row.role as UserRole,
    password: row.password,
  });

  private mapperUser = async (
    row: typeof user.$inferSelect,
  ): Promise<UserOutputDTO> => {
    const military = await this.militaryRepository.findById(row.militaryId);
    if (!military) {
      throw new EntityNotFoundError("Militar");
    }
    return { id: row.id, military, role: row.role as UserRole };
  };

  public create = async (data: UserInputDTO): Promise<void> => {
    await getDb()
      .insert(user)
      .values({ id: crypto.randomUUID(), ...data });
  };

  public delete = async (id: string): Promise<void> => {
    await getDb().delete(user).where(eq(user.id, id));
  };

  public findByMilitaryId = async (
    militaryId: string,
  ): Promise<UserOutputDTO | null> => {
    const row = await getDb().query.user.findFirst({
      where: eq(user.militaryId, militaryId),
    });
    return row ? this.mapperUser(row) : null;
  };

  public findByMilitaryIdWithPassword = async (
    militaryId: string,
  ): Promise<User | null> => {
    const row = await getDb().query.user.findFirst({
      where: eq(user.militaryId, militaryId),
    });
    return row ? this.toUser(row) : null;
  };

  public findById = async (id: string): Promise<UserOutputDTO | null> => {
    const row = await getDb().query.user.findFirst({
      where: eq(user.id, id),
    });
    return row ? this.mapperUser(row) : null;
  };

  public findByIdWithPassword = async (id: string): Promise<User | null> => {
    const row = await getDb().query.user.findFirst({
      where: eq(user.id, id),
    });
    return row ? this.toUser(row) : null;
  };

  /**
   * Lista todos os usuários, exceto o usuário de sistema (RG {@link SYSTEM_USER_RG}),
   * filtrado por questões de segurança.
   */
  public listAll = async (): Promise<UserOutputDTO[]> => {
    const rows = await getDb().query.user.findMany();
    const mapped = await Promise.all(rows.map((row) => this.mapperUser(row)));
    return mapped.filter((u) => u.military.rg !== SYSTEM_USER_RG);
  };

  public updateUserPassword = async (
    id: string,
    data: UpdateUserInputDTO,
  ): Promise<void> => {
    await getDb()
      .update(user)
      .set({ password: data.newPassword })
      .where(eq(user.id, id));
  };

  public updateUserRole = async (
    id: string,
    role: UserRole,
  ): Promise<void> => {
    await getDb().update(user).set({ role }).where(eq(user.id, id));
  };
}
