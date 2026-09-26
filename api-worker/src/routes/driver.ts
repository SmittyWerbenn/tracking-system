import type { Router } from "../router";
import type { Ctx } from "../types";
import { ok, Errors } from "../http";
import { parseJsonBody, reqNumber } from "../validate";
import { newId } from "../crypto";
import { requireAuth } from "../authMiddleware";
import { writeAuditLog } from "../audit";

/** Resolves the drivers.id linked to the logged-in user, or throws 403 if
 * this account isn't a Driver or isn't linked to a driver record yet. */
async function requireDriverId(ctx: Ctx): Promise<string> {
  const user = requireAuth(ctx);
  if (user.role !== "Driver") throw Errors.forbidden("Halaman ini khusus untuk akun Driver.");
  const row = await ctx.env.DB.prepare(`SELECT id FROM drivers WHERE user_id = ?`).bind(user.id).first<{ id: string }>();
  if (!row) throw Errors.forbidden("Akun Driver ini belum dihubungkan ke data driver. Hubungi admin.");
  return row.id;
}

function shipmentSummary(row: Record<string, unknown>) {
  return {
    awb: row.awb,
    status: row.status,
    penerima: { nama: row.penerima_nama, telepon: row.penerima_telepon },
    alamatAsal: row.alamat_asal,
    kotaAsal: row.kota_asal,
    alamatTujuan: row.alamat_tujuan,
    kotaTujuan: row.kota_tujuan,
    deskripsiBarang: row.deskripsi_barang,
    layanan: row.layanan,
    beratKg: row.berat_kg,
    jumlahKoli: row.jumlah_koli,
    truckNomorUnit: row.truck_nomor_unit ?? null,
  };
}

export function registerDriverRoutes(router: Router) {
  // Assigned shipments only - joined through drivers -> trucks -> shipments,
  // never a raw "all shipments" list like the admin endpoint.
  router.get("/api/driver/shipments", async (ctx: Ctx) => {
    const driverId = await requireDriverId(ctx);
    const rows = await ctx.env.DB.prepare(
      `SELECT s.*, t.nomor_unit as truck_nomor_unit
       FROM shipments s
       JOIN trucks t ON t.id = s.truck_id
       WHERE t.driver_id = ?
       ORDER BY s.created_at DESC`,
    )
      .bind(driverId)
      .all();
    return ok({ items: (rows.results ?? []).map(shipmentSummary) });
  });

  router.get("/api/driver/shipments/:awb", async (ctx: Ctx, params) => {
    const driverId = await requireDriverId(ctx);
    const row = await ctx.env.DB.prepare(
      `SELECT s.*, t.nomor_unit as truck_nomor_unit, t.driver_id as truck_driver_id
       FROM shipments s LEFT JOIN trucks t ON t.id = s.truck_id
       WHERE s.awb = ?`,
    )
      .bind(params.awb)
      .first<Record<string, unknown>>();
    if (!row) throw Errors.notFound("AWB tidak ditemukan.");
    if (row.truck_driver_id !== driverId) throw Errors.forbidden("Pengiriman ini bukan tugas Anda.");

    const timeline = await ctx.env.DB.prepare(
      `SELECT id, type, lokasi, tanggal, jam, keterangan, input_at
       FROM shipment_timeline_events WHERE awb = ? ORDER BY seq ASC`,
    )
      .bind(params.awb)
      .all();

    return ok({ shipment: shipmentSummary(row), timeline: timeline.results ?? [] });
  });

  // Manual, button-press position report - not polled/continuous.
  router.post("/api/driver/shipments/:awb/position", async (ctx: Ctx, params) => {
    const user = requireAuth(ctx);
    const driverId = await requireDriverId(ctx);
    const owns = await ctx.env.DB.prepare(
      `SELECT 1 FROM shipments s JOIN trucks t ON t.id = s.truck_id WHERE s.awb = ? AND t.driver_id = ?`,
    )
      .bind(params.awb, driverId)
      .first();
    if (!owns) throw Errors.forbidden("Pengiriman ini bukan tugas Anda.");

    const body = await parseJsonBody(ctx.request);
    const latitude = reqNumber(body, "latitude", { min: -90, max: 90 });
    const longitude = reqNumber(body, "longitude", { min: -180, max: 180 });
    const accuracyRaw = body.accuracy;
    const accuracy = typeof accuracyRaw === "number" && Number.isFinite(accuracyRaw) ? accuracyRaw : null;

    const id = newId();
    const now = new Date().toISOString();
    await ctx.env.DB.prepare(
      `INSERT INTO driver_position_reports (id, awb, driver_user_id, latitude, longitude, accuracy, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(id, params.awb, user.id, latitude, longitude, accuracy, now)
      .run();

    await writeAuditLog(ctx.env, user, {
      action: "DRIVER_POSITION_REPORT",
      actionLabel: "DRIVER POSITION REPORT",
      module: "Driver",
      awb: params.awb,
      description: `Driver melaporkan posisi (${latitude.toFixed(5)}, ${longitude.toFixed(5)}).`,
    });

    return ok({ id, createdAt: now }, {}, 201);
  });

  // Last reported position for a shipment, so a shipment detail page (or
  // future admin view) can show "last known location" without polling.
  router.get("/api/driver/shipments/:awb/position", async (ctx: Ctx, params) => {
    const driverId = await requireDriverId(ctx);
    const owns = await ctx.env.DB.prepare(
      `SELECT 1 FROM shipments s JOIN trucks t ON t.id = s.truck_id WHERE s.awb = ? AND t.driver_id = ?`,
    )
      .bind(params.awb, driverId)
      .first();
    if (!owns) throw Errors.forbidden("Pengiriman ini bukan tugas Anda.");

    const row = await ctx.env.DB.prepare(
      `SELECT latitude, longitude, accuracy, created_at FROM driver_position_reports
       WHERE awb = ? ORDER BY created_at DESC LIMIT 1`,
    )
      .bind(params.awb)
      .first();
    return ok({ lastPosition: row ?? null });
  });
}
