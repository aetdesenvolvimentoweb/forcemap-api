import { AppError } from "@domain/errors";
import { responseMock } from "@mocks/response.mock";
import { HttpResponseFactory } from "@presentation/factories";

describe("HttpResponseFactory", () => {
  let response: typeof responseMock;
  let factory: HttpResponseFactory;

  beforeEach(() => {
    response = responseMock;
    factory = new HttpResponseFactory();
  });

  it("should send badRequest with correct status and payload", () => {
    const error = new AppError("Erro", 400);
    factory.badRequest(response, error);
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ error: "Erro" });
  });

  it("should send serverError with status 500 and default message", () => {
    factory.serverError(response);
    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      error: "Erro interno no servidor.",
    });
  });

  it("should send created with status 201 and null payload", () => {
    factory.created(response);
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.send).toHaveBeenCalledWith(null);
  });

  it("should send badRequest with default status 400 if error.statusCode is undefined", () => {
    const errorMock = new AppError("Erro sem status", undefined);
    factory.badRequest(response, errorMock);
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ error: "Erro sem status" });
  });
});
