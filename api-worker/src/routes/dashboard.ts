import type { Router } from "../router";
import type { Ctx } from "../types";
import { ok } from "../http";
import { requirePermission } from "../authMiddleware";

export function registerDashboardRoutes(router: Router) {
  router.get("/api/dashboard/stats", async (ctx: Ctx) => {
    requirePermission(ctx, "shipments.view");
    const url = new URL(ctx.request.url);
    const stagnantDays = Number(url.searchParams.get("stagnantDays") ?? "3") || 3;
    const stagnantCutoff = new Date(Date.now() - stagnantDays * 24 * 60 * 60 * 1000).toISOString();

    const [byStatus, total, stagnant, trucks, avgRating, recent] = await Promise.all([
      ctx.env.DB.prepare(`SELECT status, COUNT(*) as c FROM shipments GROUP BY status`).all<{
        status: string;
        c: number;
      }>(),
      ctx.env.DB.prepare(`SELECT COUNT(*) as c FROM shipments`).first<{ c: number }>(),
      ctx.env.DB.prepare(
        `SELECT COUNT(*) as c FROM shipments WHERE status != 'Selesai / Terkirim' AND updated_at < ?`,
      )
        .bind(stagnantCutoff)
        .first<{ c: number }>(),
      ctx.env.DB.prepare(
        `SELECT status, COUNT(*) as c FROM trucks GROUP BY status`,
      ).all<{ status: string; c: number }>(),
      ctx.env.DB.prepare(`SELECT AVG(rating) as avg FROM feedback`).first<{ avg: number | null }>(),
      ctx.env.DB.prepare(
        `SELECT awb, status, kota_asal, kota_tujuan, tanggal_dibuat FROM shipments ORDER BY tanggal_dibuat DESC, jam_dibuat DESC LIMIT 5`,
      ).all(),
    ]);

    const statusCounts: Record<string, number> = {};
    for (const row of byStatus.results ?? []) statusCounts[row.status] = row.c;

    const truckCounts: Record<string, number> = {};
    for (const row of trucks.results ?? []) truckCounts[row.status] = row.c;
    const totalTrucks = Object.values(truckCounts).reduce((a, b) => a + b, 0);

    return ok({
      totalShipments: total?.c ?? 0,
      statusCounts,
      stagnantCount: stagnant?.c ?? 0,
      totalTrucks,
      truckOnTrip: truckCounts["On Trip"] ?? 0,
      avgRating: avgRating?.avg ?? null,
      recentShipments: recent.results,
    });
  });
}
