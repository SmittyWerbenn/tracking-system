import type { Router } from "../router";
import type { Ctx } from "../types";
import { ok } from "../http";
import { requirePermission } from "../authMiddleware";
import { parsePagination, pageMeta } from "../pagination";

export function registerNotificationRoutes(router: Router) {
  router.get("/api/notifications", async (ctx: Ctx) => {
    requirePermission(ctx, "notifications.view");
    const url = new URL(ctx.request.url);
    const { page, limit, offset } = parsePagination(url);

    const total = await ctx.env.DB.prepare(`SELECT COUNT(*) as c FROM notifications`).first<{ c: number }>();
    const rows = await ctx.env.DB.prepare(
      `SELECT * FROM notifications ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    )
      .bind(limit, offset)
      .all();

    return ok({ items: rows.results, meta: pageMeta(page, limit, total?.c ?? 0) });
  });
}
