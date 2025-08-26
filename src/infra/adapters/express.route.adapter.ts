// src/main/adapters/expressRouteAdapter.ts
import type { ControllerProtocol } from "@presentation/protocols";
import { Request, Response } from "express";

export const expressRouteAdapter = (controller: ControllerProtocol) => {
  return async (req: Request, res: Response): Promise<void> => {
    const httpRequest = {
      body: req.body,
      params: req.params,
      query: req.query,
      headers: req.headers,
    };

    await controller.handle(httpRequest, res);
  };
};
