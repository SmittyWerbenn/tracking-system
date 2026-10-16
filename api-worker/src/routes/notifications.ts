import type { Router } from "../router";
import type { Ctx } from "../types";
import { ok } from "../http";
import { requirePermission } from "../authMiddleware";
import { parsePagination, pageMeta } from "../pagination";

export function registerNotificationRoutes(router: Router) {
  router.get("/api/notifications", async (ctx: Ctx) => {
    const actor = requirePermission(ctx, "notifications.view");
    const url = new URL(ctx.request.url);
    const { page, limit, offset } = parsePagination(url);

    // A Mitra account only sees notifications for AWB/resi assigned to its own
    // mitra (shipments.mitra_id). The scope comes from the authenticated user
    // (actor.mitraId), never from the client. All other roles keep the global
    // feed unchanged.
    const mitraScope = actor.role === "Mitra";
    const where = mitraScope ? "WHERE n.awb IN (SELECT awb FROM shipments WHERE mitra_id = ?)" : "";
    const bind = mitraScope ? [actor.mitraId] : [];

    const total = await ctx.env.DB.prepare(
      `SELECT COUNT(*) as c FROM notifications n ${where}`,
    )
      .bind(...bind)
      .first<{ c: number }>();
    const rows = await ctx.env.DB.prepare(
      `SELECT n.* FROM notifications n ${where} ORDER BY n.created_at DESC LIMIT ? OFFSET ?`,
    )
      .bind(...bind, limit, offset)
      .all();

    return ok({ items: rows.results, meta: pageMeta(page, limit, total?.c ?? 0) });
  });

  // Marks every still-unread notification as read - fired when the admin
  // opens the notification bell/center, so the unread badge clears once
  // they've actually seen the list (shared read state, not per-user).
  // For a Mitra, only notifications belonging to its own assigned AWB are
  // marked - it must never touch other mitras'/clients' notifications.
  router.post("/api/notifications/read-all", async (ctx: Ctx) => {
    const actor = requirePermission(ctx, "notifications.view");
    if (actor.role === "Mitra") {
      await ctx.env.DB.prepare(
        `UPDATE notifications SET is_read = 1, read_at = ?
         WHERE is_read = 0 AND awb IN (SELECT awb FROM shipments WHERE mitra_id = ?)`,
      )
        .bind(new Date().toISOString(), actor.mitraId)
        .run();
    } else {
      await ctx.env.DB.prepare(`UPDATE notifications SET is_read = 1, read_at = ? WHERE is_read = 0`)
        .bind(new Date().toISOString())
        .run();
    }
    return ok({ updated: true });
  });
}