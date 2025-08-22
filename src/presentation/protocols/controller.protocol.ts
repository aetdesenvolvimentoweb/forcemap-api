import { HttpRequest, HttpResponse } from "./http.protocol";

export interface ControllerProtocol {
  handle(request: HttpRequest, response: HttpResponse): Promise<void> | void;
}
