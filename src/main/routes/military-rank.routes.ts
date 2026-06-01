import { Hono } from "hono";
import { honoRouteAdapter } from "../../infra/adapters";
import {
  makeCreateMilitaryRankController,
  makeDeleteMilitaryRankController,
  makeFindByIdMilitaryRankController,
  makeListAllMilitaryRankController,
  makeUpdateMilitaryRankController,
} from "../factories/controllers";
import { makeGlobalLogger } from "../factories/logger";
import { makeHonoAuthMiddleware } from "../factories/middlewares";

const militaryRankRoutes = new Hono();
const { requireAuthWithRoles } = makeHonoAuthMiddleware();
const logger = makeGlobalLogger();

// Operações de gerenciamento (criar/editar/excluir) - apenas ADMIN
militaryRankRoutes.post(
  "/",
  requireAuthWithRoles(["Admin"]),
  honoRouteAdapter(makeCreateMilitaryRankController(), logger),
);
// Operações de consulta - ADMIN, CHEFE e ACA (necessárias para cadastrar militares)
militaryRankRoutes.get(
  "/",
  requireAuthWithRoles(["Admin", "Chefe", "ACA"]),
  honoRouteAdapter(makeListAllMilitaryRankController(), logger),
);
militaryRankRoutes.get(
  "/:id",
  requireAuthWithRoles(["Admin", "Chefe", "ACA"]),
  honoRouteAdapter(makeFindByIdMilitaryRankController(), logger),
);
militaryRankRoutes.delete(
  "/:id",
  requireAuthWithRoles(["Admin"]),
  honoRouteAdapter(makeDeleteMilitaryRankController(), logger),
);
militaryRankRoutes.put(
  "/:id",
  requireAuthWithRoles(["Admin"]),
  honoRouteAdapter(makeUpdateMilitaryRankController(), logger),
);

export default militaryRankRoutes;
