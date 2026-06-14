// Nome do binding D1 — deve coincidir com o campo `binding` em wrangler.jsonc.
// Ao renomear o banco: atualize wrangler.jsonc + package.json config.db, rode
// `npm run cf-typegen` e então corrija o valor abaixo (o TypeScript avisará).
export const DB_BINDING = "forcemap" as keyof CloudflareBindings;
