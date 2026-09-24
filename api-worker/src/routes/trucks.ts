import type { Router } from "../router";
import type { Ctx } from "../types";
import { ok, Errors } from "../http";
import { parseJsonBody, reqString, reqEnum, optString } from "../validate";
import { newId } from "../crypto";
import { requirePermission } from "../authMiddleware";
import { writeAuditLog } from "../audit";
import { parsePagination, pageMeta } from "../pagination";

const STATUS = ["Available", "On Trip", "Maintenance", "Inactive"] as const;

export function registerTruckRoutes(router: Router) {
  router.get("/api/trucks", async (ctx: Ctx) => {
    requirePermission(ctx, "fleet.view");
    const url = new URL(ctx.request.url);
    const status = url.searchParams.get("status");

    const rows = status
      ? await ctx.env.DB.prepare(
          `SELECT t.*, d.nama as driver_nama, d.telepon as driver_telepon FROM trucks t
           LEFT JOIN drivers d ON d.id = t.driver_id WHERE t.status = ? ORDER BY t.nomor_unit`,
        )
          .bind(status)
          .all()
      : await ctx.env.DB.prepare(
          `SELECT t.*, d.nama as driver_nama, d.telepon as driver_telepon FROM trucks t
           LEFT JOIN drivers d ON d.id = t.driver_id ORDER BY t.nomor_unit`,
        ).all();

    return ok({ items: rows.results });
  });

  router.post("/api/trucks", async (ctx: Ctx) => {
    const actor = requirePermission(ctx, "fleet.manage");
    const body = await parseJsonBody(ctx.request);
    const nomorUnit = reqString(body, "nomorUnit", { max: 20 });
    const jenis = reqString(body, "jenis", { max: 30 });
    const kapasitas = reqString(body, "kapasitas", { max: 30 });
    const driverNama = reqString(body, "driverNama", { max: 80 });
    const driverTelepon = reqString(body, "driverTelepon", { max: 30 });
    const status = reqEnum(body, "status", STATUS);
    const keterangan = optString(body, "keterangan");

    const dupe = await ctx.env.DB.prepare(`SELECT id FROM trucks WHERE nomor_unit = ?`).bind(nomorUnit).first();
    if (dupe) throw Errors.conflict("Nomor unit truck sudah terdaftar.");

    const now = new Date().toISOString();
    const driverId = newId();
    await ctx.env.DB.prepare(`INSERT INTO drivers (id, nama, telepon, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`)
      .bind(driverId, driverNama, driverTelepon, now, now)
      .run();

    const truckId = newId();
    await ctx.env.DB.prepare(
      `INSERT INTO trucks (id, nomor_unit, jenis, kapasitas, driver_id, status, keterangan, created_at, updated_at, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(truckId, nomorUnit, jenis, kapasitas, driverId, status, keterangan ?? null, now, now, actor.id, actor.id)
      .run();

    await writeAuditLog(ctx.env, actor, {
      action: "CREATE_TRUCK",
      actionLabel: "CREATE TRUCK",
      module: "Master Armada",
      description: `Truck "${nomorUnit}" ditambahkan.`,
    });

    return ok({ id: truckId }, {}, 201);
  });

  router.patch("/api/trucks/:id", async (ctx: Ctx, params) => {
    const actor = requirePermission(ctx, "fleet.manage");
    const truck = await ctx.env.DB.prepare(`SELECT id, driver_id FROM trucks WHERE id = ?`).bind(params.id).first<{
      id: string;
      driver_id: string;
    }>();
    if (!truck) throw Errors.notFound("Truck tidak ditemukan.");

    const body = await parseJsonBody(ctx.request);
    const jenis = optString(body, "jenis");
    const kapasitas = optString(body, "kapasitas");
    const status = body.status !== undefined ? reqEnum(body, "status", STATUS) : undefined;
    const keterangan = optString(body, "keterangan");
    const driverNama = optString(body, "driverNama");
    const driverTelepon = optString(body, "driverTelepon");

    const now = new Date().toISOString();
    if (driverNama || driverTelepon) {
      const sets: string[] = [];
      const values: unknown[] = [];
      if (driverNama) { sets.push("nama = ?"); values.push(driverNama); }
      if (driverTelepon) { sets.push("telepon = ?"); values.push(driverTelepon); }
      sets.push("updated_at = ?");
      values.push(now, truck.driver_id);
      await ctx.env.DB.prepare(`UPDATE drivers SET ${sets.join(", ")} WHERE id = ?`).bind(...values).run();
    }

    const sets: string[] = [];
    const values: unknown[] = [];
    if (jenis) { sets.push("jenis = ?"); values.push(jenis); }
    if (kapasitas) { sets.push("kapasitas = ?"); values.push(kapasitas); }
    if (status) { sets.push("status = ?"); values.push(status); }
    if (keterangan !== undefined) { sets.push("keterangan = ?"); values.push(keterangan); }
    if (sets.length > 0) {
      sets.push("updated_at = ?", "updated_by = ?");
      values.push(now, actor.id, params.id);
      await ctx.env.DB.prepare(`UPDATE trucks SET ${sets.join(", ")} WHERE id = ?`).bind(...values).run();
    }

    await writeAuditLog(ctx.env, actor, {
      action: "UPDATE_TRUCK_MASTER",
      actionLabel: "UPDATE TRUCK",
      module: "Master Armada",
      description: `Data truck (${params.id}) diperbarui.`,
    });

    return ok({ updated: true });
  });

  router.get("/api/trucks/:id/history", async (ctx: Ctx, params) => {
    requirePermission(ctx, "fleet.view");
    const url = new URL(ctx.request.url);
    const { page, limit, offset } = parsePagination(url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    // Matches shipments currently assigned to this truck, plus ones that
    // used it at some earlier point in their timeline (e.g. before a
    // Transfer Unit moved them to a different truck).
    const matchClause = `(s.truck_id = ? OR EXISTS (SELECT 1 FROM shipment_timeline_events e WHERE e.awb = s.awb AND e.truck_id = ?))`;
    const params_: unknown[] = [params.id, params.id];
    let dateClause = "";
    if (from) { dateClause += " AND s.tanggal_dibuat >= ?"; params_.push(from); }
    if (to) { dateClause += " AND s.tanggal_dibuat <= ?"; params_.push(to); }

    const total = await ctx.env.DB.prepare(`SELECT COUNT(*) as c FROM shipments s WHERE ${matchClause}${dateClause}`)
      .bind(...params_)
      .first<{ c: number }>();
    const rows = await ctx.env.DB.prepare(
      `SELECT s.awb, s.status, s.kota_asal, s.kota_tujuan, s.tanggal_dibuat, s.truck_id FROM shipments s
       WHERE ${matchClause}${dateClause} ORDER BY s.tanggal_dibuat DESC LIMIT ? OFFSET ?`,
    )
      .bind(...params_, limit, offset)
      .all();

    return ok({ items: rows.results, meta: pageMeta(page, limit, total?.c ?? 0) });
  });
}
