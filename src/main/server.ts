import { Hono } from "hono";

import { securityHeadersDev, securityHeadersProd } from "../infra/adapters";
import { runWithEnv } from "../infra/config";
import { runWithDb } from "../infra/db";
import {
  makeHonoCorsMiddleware,
  makeHonoInternalSecretMiddleware,
  makeHonoSecurityLoggingMiddleware,
} from "./factories/middlewares";
import routes from "./routes";

const app = new Hono();

// Middlewares compostos via factories (Main)
const securityLoggingMiddleware = makeHonoSecurityLoggingMiddleware();

// Middleware de banco/ambiente - abre os contextos request-scoped do D1 e das
// variáveis/secrets (deve rodar antes de qualquer middleware/handler que acesse
// repositórios ou segredos). No Workers, vars e secrets só existem no binding
// `c.env` da request — nunca em `globalThis`.
app.use("*", async (c, next) => {
  const env = (c.env as Record<string, string | undefined>) ?? {};
  return runWithEnv(env, () =>
    runWithDb((c.env as Env).forcemap, () => next()),
  );
});

// Middleware de segredo interno - roda antes do CORS para fazer bypass quando válido
app.use("*", async (c, next) => {
  const env = (c.env as Record<string, string | undefined>) ?? {};
  return makeHonoInternalSecretMiddleware(env)(c, next);
});

// Middleware de CORS - bypassa validação de origin quando bypassCors está definido
app.use("*", async (c, next) => {
  const env = (c.env as Record<string, string | undefined>) ?? {};
  const { corsAuto } = makeHonoCorsMiddleware(env);
  return corsAuto()(c, next);
});

// Middleware de segurança - aplica headers de segurança
app.use("*", async (c, next) => {
  const env = (c.env as Record<string, string | undefined>) ?? {};
  const isDevelopment = env.BUN_ENV === "development";
  return isDevelopment
    ? securityHeadersDev()(c, next)
    : securityHeadersProd()(c, next);
});

// Middleware de logging de segurança - monitora eventos
app.use("*", securityLoggingMiddleware);

app.route("/", routes);

export default app;
