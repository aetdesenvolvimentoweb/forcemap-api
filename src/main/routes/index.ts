import { Router } from "express";

import homeRoutes from "./home.route";
import militaryRankRoutes from "./military-rank/military-rank.routes";

const routes = Router();

routes.use("/", homeRoutes);
routes.use("/military-rank", militaryRankRoutes);

export default routes;
