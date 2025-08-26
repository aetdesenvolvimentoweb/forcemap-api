import type { Response as ExpressResponse } from "express";

declare global {
  // Faz com que o tipo HttpResponse seja tratado como o Response do Express
  type HttpResponse = ExpressResponse;
}
