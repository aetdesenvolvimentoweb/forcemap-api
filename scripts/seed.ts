/**
 * Seed manual e idempotente do banco (postos/graduações + admin inicial).
 *
 * Substitui o antigo seed automático que rodava no caminho da request. Aqui o
 * provisionamento é explícito e fora do runtime do Worker:
 *   SEED_ADMIN_PASSWORD='...' bun run db:seed:remote   (ou :local)
 *
 * Segurança:
 * - A senha em texto puro vem só do ambiente; NUNCA é gravada em disco nem vai
 *   para a linha de comando. O que se grava é o hash PBKDF2 (mesmo formato do
 *   login), reusando o adapter real.
 * - O SQL gerado contém o hash, então é transitório: escrito com permissão 0600,
 *   aplicado via `--file` (evita o hash em argv/`ps`) e removido num `finally`.
 *   Também está no .gitignore por garantia.
 * - Idempotência via chaves naturais: postos/graduações usam `INSERT OR IGNORE`
 *   (conflito em `abbreviation`/`order` UNIQUE vira no-op). O militar admin usa
 *   `INSERT OR IGNORE` via subquery (conflito em `rg` UNIQUE). O usuário admin
 *   é inserido apenas se ainda não existir (verificação por `military_id`), e a
 *   senha é sempre atualizada — re-rodar o seed rotaciona a senha do admin, que
 *   é o caminho suportado para resetar o login em produção.
 * - IDs gerados dinamicamente: cada execução do seed gera novos UUIDs para os
 *   registros que ainda não existem, sem depender de valores hardcoded no código.
 */
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { unlinkSync, writeFileSync } from "node:fs";

import { WebCryptoPasswordHasherAdapter } from "../src/infra/adapters/webcrypto.password.hasher.adapter";

import pkg from "../package.json" with { type: "json" };
const DB_NAME: string =
  (pkg as { config?: { db?: string } }).config?.db ??
  (() => { throw new Error("config.db não definido em package.json"); })();
const GENERATED_FILE = "drizzle/seed.generated.sql";
const ADMIN_RG = 9999;

const RANKS: ReadonlyArray<{ abbreviation: string; order: number }> = [
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
];

const sqlStr = (value: string): string => `'${value.replace(/'/g, "''")}'`;

const resolveTarget = (): "--local" | "--remote" => {
  if (process.argv.includes("--remote")) return "--remote";
  if (process.argv.includes("--local")) return "--local";
  console.error("Informe o alvo: --local ou --remote.");
  process.exit(1);
};

async function main(): Promise<void> {
  const target = resolveTarget();

  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password) {
    console.error(
      "SEED_ADMIN_PASSWORD ausente no ambiente. " +
        "Ex.: SEED_ADMIN_PASSWORD='SuaSenhaForte!1' bun run db:seed:remote",
    );
    process.exit(1);
  }

  const passwordHash = await new WebCryptoPasswordHasherAdapter().hash(password);

  const statements: string[] = [
    // Idempotente via UNIQUE(abbreviation) e UNIQUE(order)
    ...RANKS.map(
      (r) =>
        `INSERT OR IGNORE INTO military_rank (id, abbreviation, "order") VALUES (${sqlStr(randomUUID())}, ${sqlStr(r.abbreviation)}, ${r.order});`,
    ),
    // Idempotente via UNIQUE(rg); busca o id do posto Cel por subquery
    `INSERT OR IGNORE INTO military (id, military_rank_id, rg, name) SELECT ${sqlStr(randomUUID())}, id, ${ADMIN_RG}, ${sqlStr("Administrador")} FROM military_rank WHERE abbreviation = ${sqlStr("Cel")};`,
    // Insere o usuário admin apenas se ainda não existir para este militar
    `INSERT INTO "user" (id, military_id, role, password) SELECT ${sqlStr(randomUUID())}, m.id, ${sqlStr("Admin")}, ${sqlStr(passwordHash)} FROM military m WHERE m.rg = ${ADMIN_RG} AND NOT EXISTS (SELECT 1 FROM "user" u WHERE u.military_id = m.id);`,
    // Sempre atualiza a senha — re-rodar o seed ROTACIONA a senha do admin
    `UPDATE "user" SET password = ${sqlStr(passwordHash)} WHERE military_id = (SELECT id FROM military WHERE rg = ${ADMIN_RG});`,
  ];

  writeFileSync(GENERATED_FILE, statements.join("\n") + "\n", { mode: 0o600 });

  try {
    const result = spawnSync(
      "wrangler",
      ["d1", "execute", DB_NAME, target, "--file", GENERATED_FILE],
      { stdio: "inherit", shell: process.platform === "win32" },
    );
    if (result.status !== 0) {
      process.exit(result.status ?? 1);
    }
  } finally {
    try {
      unlinkSync(GENERATED_FILE);
    } catch {
      // arquivo já removido — ok
    }
  }

  console.log(
    `\nSeed aplicado (${target}). Admin: RG ${ADMIN_RG}. Arquivo temporário removido.`,
  );
}

main();
