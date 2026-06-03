import { SettingsRepository } from "../../../domain/repositories";
import { SettingsRepositoryD1 } from "../../../infra/repositories";

let instance: SettingsRepositoryD1 | null = null;

export const makeSettingsRepository = (): SettingsRepository => {
  if (!instance) {
    instance = new SettingsRepositoryD1();
  }
  return instance;
};
