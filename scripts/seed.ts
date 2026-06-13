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
 * - Idempotência via UUIDs fixos: postos/graduações e o militar admin usam
 *   `INSERT OR IGNORE` (conflito de PK vira no-op). Já o usuário admin usa
 *   upsert (`ON CONFLICT(id) DO UPDATE`) na senha, então re-rodar o seed rotaciona
 *   a senha do admin — é o caminho suportado para resetar o login em produção.
 */
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { unlinkSync, writeFileSync } from "node:fs";

import { WebCryptoPasswordHasherAdapter } from "../src/infra/adapters/webcrypto.password.hasher.adapter";

const DB_NAME = "forcemap";
const GENERATED_FILE = "drizzle/seed.generated.sql";
const ADMIN_RG = 9999;

// UUIDs fixos: garantem idempotência por PK em re-execuções.
const RANKS: ReadonlyArray<{ id: string; abbreviation: string; order: number }> =
  [
    { id: "acd818ba-d788-49ec-8790-0322ec5addf7", abbreviation: "Cel", order: 1 },
    { id: "9f3dea5d-e0b0-48ce-8ea3-3a63537ffe39", abbreviation: "TC", order: 2 },
    { id: "f50a4434-cfbe-41b6-8c81-b7bcae3c5d83", abbreviation: "Maj", order: 3 },
    { id: "90446b7d-0581-4283-a71c-6e695bae3cb5", abbreviation: "Cap", order: 4 },
    { id: "0b8e212f-c75b-4338-b137-da3732d72ddb", abbreviation: "1º Ten", order: 5 },
    { id: "486cdaed-f59f-4bcb-987d-342b31723663", abbreviation: "2º Ten", order: 6 },
    { id: "d8a8c32a-a325-43dc-b6d6-36595b1add39", abbreviation: "Asp Of", order: 7 },
    { id: "50ad1574-ba7c-45a8-a78f-b8742e1fe152", abbreviation: "ST", order: 8 },
    { id: "8a921625-4e5f-4783-8d09-b59cd0d02bda", abbreviation: "1º Sgt", order: 9 },
    { id: "7bee440d-c044-469a-852d-bac6a3f3b220", abbreviation: "2º Sgt", order: 10 },
    { id: "4a88907c-4873-4ded-a0e1-8062bba47fac", abbreviation: "3º Sgt", order: 11 },
    { id: "e69c204e-320b-49b5-a481-3b1e420c0085", abbreviation: "Cb", order: 12 },
    { id: "208c7b8d-99a5-46b3-9c61-3a8e22ccf023", abbreviation: "Sd 1ª Classe", order: 13 },
    { id: "27fee55b-bda5-4265-b754-c9a01f4ed7cb", abbreviation: "Sd 2ª Classe", order: 14 },
  ];

const ADMIN_MILITARY_ID = "37131643-c2a9-4f78-a757-ff3d0bc851a7";
const ADMIN_USER_ID = "4f56e3a4-48ed-4ed2-aa23-f6f311ee91f4";
const ADMIN_RANK_ID = RANKS[0].id; // Cel

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
    ...RANKS.map(
      (r) =>
        `INSERT OR IGNORE INTO military_rank (id, abbreviation, "order") VALUES (${sqlStr(r.id)}, ${sqlStr(r.abbreviation)}, ${r.order});`,
    ),
    `INSERT OR IGNORE INTO military (id, military_rank_id, rg, name) VALUES (${sqlStr(ADMIN_MILITARY_ID)}, ${sqlStr(ADMIN_RANK_ID)}, ${ADMIN_RG}, ${sqlStr("Administrador")});`,
    // Upsert por PK: re-rodar o seed ROTACIONA a senha do admin para o valor de
    // SEED_ADMIN_PASSWORD (diferente de INSERT OR IGNORE, que ignoraria a colisão
    // e manteria a senha antiga). Permite resetar a senha do admin em produção.
    `INSERT INTO "user" (id, military_id, role, password) VALUES (${sqlStr(ADMIN_USER_ID)}, ${sqlStr(ADMIN_MILITARY_ID)}, ${sqlStr("Admin")}, ${sqlStr(passwordHash)}) ON CONFLICT(id) DO UPDATE SET password = excluded.password;`,
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
