import type { Env, Ctx } from "./types";
import { Router } from "./router";
import { ok, errorResponse, Errors } from "./http";
import { loadUserFromRequest } from "./authMiddleware";
import { registerAuthRoutes } from "./routes/auth";
import { registerUserRoutes } from "./routes/users";
import { registerLocationRoutes } from "./routes/locations";
import { registerTruckRoutes } from "./routes/trucks";
import { registerShipmentRoutes } from "./routes/shipments";
import { registerFeedbackRoutes } from "./routes/feedback";
import { registerNotificationRoutes } from "./routes/notifications";
import { registerAuditLogRoutes } from "./routes/auditlog";
import { registerSettingsRoutes } from "./routes/settings";
import { registerFileRoutes } from "./routes/files";
import { registerPublicRoutes } from "./routes/public";
import { registerDashboardRoutes } from "./routes/dashboard";

const router = new Router();
registerAuthRoutes(router);
registerUserRoutes(router);
registerLocationRoutes(router);
registerTruckRoutes(router);
registerShipmentRoutes(router);
registerFeedbackRoutes(router);
registerNotificationRoutes(router);
registerAuditLogRoutes(router);
registerSettingsRoutes(router);
registerFileRoutes(router);
registerPublicRoutes(router);
registerDashboardRoutes(router);

router.get("/api/health", async () => ok({ status: "ok", time: new Date().toISOString() }));

function corsHeaders(origin: string | null, allowedOrigins: string[]): HeadersInit {
  const allowOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-ID",
    Vary: "Origin",
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const allowedOrigins = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
    const origin = request.headers.get("Origin");
    const cors = corsHeaders(origin, allowedOrigins);
    const requestId = request.headers.get("X-Request-ID") || crypto.randomUUID();
    const startedAt = Date.now();

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    const ctx: Ctx = { env, request, user: null, requestId };

    try {
      ctx.user = await loadUserFromRequest(ctx);
      const response = await router.handle(ctx, url.pathname);
      const finalResponse = response ?? errorResponse(Errors.notFound("Endpoint tidak ditemukan."), requestId, cors);
      const headers = new Headers(finalResponse.headers);
      for (const [k, v] of Object.entries(cors)) headers.set(k, v as string);
      headers.set("X-Request-ID", requestId);

      console.log(
        JSON.stringify({
          requestId,
          method: request.method,
          path: url.pathname,
          status: response ? finalResponse.status : 404,
          durationMs: Date.now() - startedAt,
          userId: ctx.user?.id ?? null,
        }),
      );

      return new Response(finalResponse.body, { status: finalResponse.status, headers });
    } catch (err) {
      const resp = errorResponse(err, requestId, cors);
      const headers = new Headers(resp.headers);
      headers.set("X-Request-ID", requestId);
      console.log(
        JSON.stringify({
          requestId,
          method: request.method,
          path: url.pathname,
          status: resp.status,
          durationMs: Date.now() - startedAt,
          userId: ctx.user?.id ?? null,
          error: err instanceof Error ? err.message : String(err),
        }),
      );
      return new Response(resp.body, { status: resp.status, headers });
    }
  },
};
