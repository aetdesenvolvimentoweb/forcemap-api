import type { Context } from "hono";

/**
 * Resolve o IP real do cliente.
 *
 * No Cloudflare Workers, apenas `CF-Connecting-IP` é confiável — é definido pela
 * edge e não pode ser forjado pelo cliente. Cabeçalhos como `X-Forwarded-For` e
 * `X-Real-IP` são controlados pelo cliente e NÃO devem ser usados para rate
 * limiting ou auditoria de segurança (permitiriam burlar o throttling por IP
 * rotacionando o header).
 */
export const getClientIp = (c: Context): string | undefined =>
  c.req.header("CF-Connecting-IP") ?? undefined;
