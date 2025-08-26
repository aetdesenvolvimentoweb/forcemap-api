import { expressRouteAdapter } from "@infra/adapters/express.route.adapter";
import { makeCreateMilitaryRankControllerFactory } from "@main/factories/controllers";
import { Router } from "express";

const militaryRankRoutes = Router();

const controller = makeCreateMilitaryRankControllerFactory();

militaryRankRoutes.post("/", expressRouteAdapter(controller));

export default militaryRankRoutes;
