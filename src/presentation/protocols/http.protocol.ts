export interface HttpRequest {
  body?: unknown;
  params?: unknown;
  query?: unknown;
  headers?: unknown;
}

export interface HttpResponse {
  status(code: number): this;
  json(data: unknown): this;
  send(data: unknown): this;
}

export interface HttpHandler {
  (
    req: HttpRequest,
    res: HttpResponse,
    next?: NextFunction,
  ): Promise<void> | void;
}

export interface HttpServerProtocol {
  get(path: string, handler: HttpHandler): void;
  post(path: string, handler: HttpHandler): void;
  put(path: string, handler: HttpHandler): void;
  patch(path: string, handler: HttpHandler): void;
  delete(path: string, handler: HttpHandler): void;
  use(middleware: HttpHandler): void;
  listen(port: number, callback?: () => void): void;
}

export type NextFunction = () => void | Promise<void>;
