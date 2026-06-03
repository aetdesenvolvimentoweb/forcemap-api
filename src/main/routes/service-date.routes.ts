import { Hono } from "hono";

import { honoRouteAdapter } from "../../infra/adapters";
import { makeSetServiceDateController } from "../factories/controllers";
import { makeGlobalLogger } from "../factories/logger";
import { makeHonoAuthMiddleware } from "../factories/middlewares";

const serviceDateRoutes = new Hono();
const { requireAuthWithRoles } = makeHonoAuthMiddleware();
const logger = makeGlobalLogger();

// Define a data do serviço como "hoje" (disparado pelo "Novo resumo").
serviceDateRoutes.put(
  "/",
  requireAuthWithRoles(["Admin", "Chefe", "ACA"]),
  honoRouteAdapter(makeSetServiceDateController(), logger),
);

export default serviceDateRoutes;
