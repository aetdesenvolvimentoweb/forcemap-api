import { Hono } from "hono";
import { honoRouteAdapter } from "../../infra/adapters";
import {
  makeCreateVehicleController,
  makeDeleteVehicleController,
  makeFindByIdVehicleController,
  makeListAllVehicleController,
  makeUpdateVehicleController,
} from "../factories/controllers";
import { makeGlobalLogger } from "../factories/logger";
import { makeHonoAuthMiddleware } from "../factories/middlewares";

const vehicleRoutes = new Hono();
const { requireAuthWithRoles } = makeHonoAuthMiddleware();
const logger = makeGlobalLogger();

// Operações de viaturas - ADMIN, CHEFE e ACA
vehicleRoutes.post(
  "/",
  requireAuthWithRoles(["Admin", "Chefe", "ACA"]),
  honoRouteAdapter(makeCreateVehicleController(), logger),
);
vehicleRoutes.get(
  "/",
  requireAuthWithRoles(["Admin", "Chefe", "ACA"]),
  honoRouteAdapter(makeListAllVehicleController(), logger),
);
vehicleRoutes.get(
  "/:id",
  requireAuthWithRoles(["Admin", "Chefe", "ACA"]),
  honoRouteAdapter(makeFindByIdVehicleController(), logger),
);
vehicleRoutes.delete(
  "/:id",
  requireAuthWithRoles(["Admin", "Chefe", "ACA"]),
  honoRouteAdapter(makeDeleteVehicleController(), logger),
);
vehicleRoutes.put(
  "/:id",
  requireAuthWithRoles(["Admin", "Chefe", "ACA"]),
  honoRouteAdapter(makeUpdateVehicleController(), logger),
);

export default vehicleRoutes;
