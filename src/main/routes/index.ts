import { Hono } from "hono";
import acaRoutes from "./aca.routes";
import authRoutes from "./auth.routes";
import garrisonRoutes from "./garrison.routes";
import healthDocs from "./health-docs.routes";
import militaryRankRoutes from "./military-rank.routes";
import militaryRoutes from "./military.routes";
import officerRoutes from "./officer.routes";
import publicRoutes from "./public.routes";
import serviceDateRoutes from "./service-date.routes";
import serviceSwapRoutes from "./service-swap.routes";
import telephonistRoutes from "./telephonist.routes";
import userRoutes from "./user.routes";
import vehicleRoutes from "./vehicle.routes";

const routes = new Hono();

routes.route("/", healthDocs);
routes.route("/api/v1", authRoutes);
routes.route("/api/v1/aca", acaRoutes);
routes.route("/api/v1/garrison", garrisonRoutes);
routes.route("/api/v1/military", militaryRoutes);
routes.route("/api/v1/military-rank", militaryRankRoutes);
routes.route("/api/v1/officer", officerRoutes);
routes.route("/api/v1/public", publicRoutes);
routes.route("/api/v1/service-date", serviceDateRoutes);
routes.route("/api/v1/service-swap", serviceSwapRoutes);
routes.route("/api/v1/telephonist", telephonistRoutes);
routes.route("/api/v1/user", userRoutes);
routes.route("/api/v1/vehicle", vehicleRoutes);

routes.notFound((c) => {
  return c.json({ error: "Not Found" }, 404);
});

export default routes;
