import { eq } from "drizzle-orm";

import { SettingsRepository } from "../../../domain/repositories";
import { getDb } from "../../db";
import { settings } from "../../db/schema";

export class SettingsRepositoryD1 implements SettingsRepository {
  public get = async (key: string): Promise<string | null> => {
    const row = await getDb().query.settings.findFirst({
      where: eq(settings.key, key),
    });
    return row ? row.value : null;
  };

  public set = async (key: string, value: string): Promise<void> => {
    await getDb()
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value } });
  };
}
