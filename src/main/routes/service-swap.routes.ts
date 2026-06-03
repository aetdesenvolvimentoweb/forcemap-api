import { Hono } from "hono";

import { honoRouteAdapter } from "../../infra/adapters";
import {
  makeCreateServiceSwapController,
  makeDeleteServiceSwapController,
  makeFindByIdServiceSwapController,
  makeListAllServiceSwapController,
  makeUpdateServiceSwapController,
} from "../factories/controllers";
import { makeGlobalLogger } from "../factories/logger";
import { makeHonoAuthMiddleware } from "../factories/middlewares";

const serviceSwapRoutes = new Hono();
const { requireAuthWithRoles } = makeHonoAuthMiddleware();
const logger = makeGlobalLogger();

serviceSwapRoutes.post(
  "/",
  requireAuthWithRoles(["Admin", "Chefe", "ACA"]),
  honoRouteAdapter(makeCreateServiceSwapController(), logger),
);

serviceSwapRoutes.delete(
  "/:id",
  requireAuthWithRoles(["Admin", "Chefe", "ACA"]),
  honoRouteAdapter(makeDeleteServiceSwapController(), logger),
);

serviceSwapRoutes.put(
  "/:id",
  requireAuthWithRoles(["Admin", "Chefe", "ACA"]),
  honoRouteAdapter(makeUpdateServiceSwapController(), logger),
);

serviceSwapRoutes.get(
  "/",
  requireAuthWithRoles(["Admin", "Chefe", "ACA"]),
  honoRouteAdapter(makeListAllServiceSwapController(), logger),
);

serviceSwapRoutes.get(
  "/:id",
  requireAuthWithRoles(["Admin", "Chefe", "ACA"]),
  honoRouteAdapter(makeFindByIdServiceSwapController(), logger),
);

export default serviceSwapRoutes;
