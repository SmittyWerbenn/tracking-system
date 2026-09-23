import type { Router } from "../router";
import type { Ctx } from "../types";
import { ok } from "../http";
import { requirePermission } from "../authMiddleware";
import { parsePagination, pageMeta } from "../pagination";

export function registerFeedbackRoutes(router: Router) {
  router.get("/api/feedback", async (ctx: Ctx) => {
    requirePermission(ctx, "feedback.view");
    const url = new URL(ctx.request.url);
    const { page, limit, offset } = parsePagination(url);

    const total = await ctx.env.DB.prepare(`SELECT COUNT(*) as c FROM feedback`).first<{ c: number }>();
    const rows = await ctx.env.DB.prepare(
      `SELECT * FROM feedback ORDER BY submitted_at DESC LIMIT ? OFFSET ?`,
    )
      .bind(limit, offset)
      .all();
    const summary = await ctx.env.DB.prepare(
      `SELECT COUNT(*) as count, AVG(rating) as avg_rating,
        SUM(CASE WHEN rating=5 THEN 1 ELSE 0 END) as r5,
        SUM(CASE WHEN rating=4 THEN 1 ELSE 0 END) as r4,
        SUM(CASE WHEN rating=3 THEN 1 ELSE 0 END) as r3,
        SUM(CASE WHEN rating=2 THEN 1 ELSE 0 END) as r2,
        SUM(CASE WHEN rating=1 THEN 1 ELSE 0 END) as r1
       FROM feedback`,
    ).first();

    return ok({ items: rows.results, meta: pageMeta(page, limit, total?.c ?? 0), summary });
  });
}
