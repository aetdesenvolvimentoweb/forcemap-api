import { Hono } from "hono";

import { honoRouteAdapter } from "../../infra/adapters";
import {
  makeGetServiceDateController,
  makeListAllACAController,
  makeListAllGarrisonController,
  makeListAllOfficerController,
  makeListAllServiceSwapController,
  makeListAllTelephonistController,
  makeListAllVehicleController,
} from "../factories/controllers";
import { makeGlobalLogger } from "../factories/logger";

/**
 * Rotas PÚBLICAS de leitura do resumo do dia (Mapa Força).
 * Prefixo: /api/v1/public
 *
 * Diferente das demais rotas, NÃO exigem autenticação: alimentam a página
 * inicial pública, que apenas exibe o resumo do serviço (o mesmo conteúdo já
 * divulgado abertamente). Apenas leitura — nenhuma operação de escrita aqui.
 * A proteção de origin continua a cargo do middleware global de CORS.
 */
const publicRoutes = new Hono();
const logger = makeGlobalLogger();

publicRoutes.get(
  "/vehicle",
  honoRouteAdapter(makeListAllVehicleController(), logger),
);

publicRoutes.get(
  "/officer",
  honoRouteAdapter(makeListAllOfficerController(), logger),
);

publicRoutes.get(
  "/aca",
  honoRouteAdapter(makeListAllACAController(), logger),
);

publicRoutes.get(
  "/telephonist",
  honoRouteAdapter(makeListAllTelephonistController(), logger),
);

publicRoutes.get(
  "/garrison",
  honoRouteAdapter(makeListAllGarrisonController(), logger),
);

publicRoutes.get(
  "/service-swap",
  honoRouteAdapter(makeListAllServiceSwapController(), logger),
);

publicRoutes.get(
  "/service-date",
  honoRouteAdapter(makeGetServiceDateController(), logger),
);

export default publicRoutes;
