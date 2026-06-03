import type { Context, Next } from "hono";
import { AuthMiddleware } from "../../../presentation/middlewares";
import { getClientIp } from "../get-client-ip";

interface AuthHttpRequest {
  body?: unknown;
  params?: Record<string, string>;
  query?: Record<string, string>;
  headers?: { [key: string]: string | string[] | undefined };
  ip?: string;
  user?: {
    userId: string;
    sessionId: string;
    role: string;
    militaryId: string;
  };
}

const buildAuthHttpRequest = (c: Context): AuthHttpRequest => ({
  body: undefined,
  params: c.req.param(),
  query: c.req.query(),
  headers: c.req.header(),
  ip: getClientIp(c),
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: (c.req as any).user,
});

export const createHonoAuthMiddleware = (authMiddleware: AuthMiddleware) => {
  const requireAuth = async (c: Context, next: Next) => {
    try {
      const httpRequest = buildAuthHttpRequest(c);
      const result = await authMiddleware.authenticate(httpRequest);

      if ("statusCode" in result) {
        return c.json(
          result.body ?? { error: "Unauthorized" },
          result.statusCode as any,
        );
      }

      (c.req as any).user = result.user;
      await next();
      return c.res;
    } catch {
      return c.json({ error: "Falha na autenticação" }, 401 as any);
    }
  };

  const requireRoles = (allowedRoles: string[]) => {
    return async (c: Context, next: Next) => {
      const user = (c.req as any).user;

      if (!user) {
        return c.json({ error: "Usuário não autenticado" }, 401 as any);
      }

      const httpRequest = {
        ...buildAuthHttpRequest(c),
        user,
      };

      const result = authMiddleware.authorize(allowedRoles)(httpRequest);

      if ("statusCode" in result) {
        return c.json(
          result.body ?? { error: "Forbidden" },
          result.statusCode as any,
        );
      }

      await next();
      return c.res;
    };
  };

  const requireAuthWithRoles = (allowedRoles: string[]) => {
    return async (c: Context, next: Next) => {
      try {
        const httpRequest = buildAuthHttpRequest(c);
        const authResult = await authMiddleware.authenticate(httpRequest);

        if ("statusCode" in authResult) {
          return c.json(
            authResult.body ?? { error: "Unauthorized" },
            authResult.statusCode as any,
          );
        }

        (c.req as any).user = authResult.user;

        const authzResult = authMiddleware.authorize(allowedRoles)(authResult);

        if ("statusCode" in authzResult) {
          return c.json(
            authzResult.body ?? { error: "Forbidden" },
            authzResult.statusCode as any,
          );
        }

        await next();
        return c.res;
      } catch {
        return c.json(
          { error: "Falha na autenticação/autorização" },
          401 as any,
        );
      }
    };
  };

  return {
    requireAuth,
    requireRoles,
    requireAuthWithRoles,
  };
};
