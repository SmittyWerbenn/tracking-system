import type { Router } from "../router";
import type { Ctx } from "../types";
import { ok } from "../http";
import { requirePermission } from "../authMiddleware";
import { parsePagination, pageMeta } from "../pagination";

export function registerAuditLogRoutes(router: Router) {
  router.get("/api/audit-logs", async (ctx: Ctx) => {
    requirePermission(ctx, "audit.view");
    const url = new URL(ctx.request.url);
    const { page, limit, offset } = parsePagination(url);
    const action = url.searchParams.get("action");
    const module = url.searchParams.get("module");
    const awb = url.searchParams.get("awb");
    const userName = url.searchParams.get("user");

    const where: string[] = [];
    const params: unknown[] = [];
    if (action) { where.push("action = ?"); params.push(action); }
    if (module) { where.push("module = ?"); params.push(module); }
    if (awb) { where.push("awb = ?"); params.push(awb); }
    if (userName) { where.push("user_name LIKE ?"); params.push(`%${userName}%`); }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const total = await ctx.env.DB.prepare(`SELECT COUNT(*) as c FROM audit_log ${whereSql}`)
      .bind(...params)
      .first<{ c: number }>();
    const rows = await ctx.env.DB.prepare(
      `SELECT * FROM audit_log ${whereSql} ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
    )
      .bind(...params, limit, offset)
      .all();

    return ok({ items: rows.results, meta: pageMeta(page, limit, total?.c ?? 0) });
  });
}
