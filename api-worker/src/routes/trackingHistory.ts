import type { Router } from "../router";
import type { Ctx } from "../types";
import { ok, Errors } from "../http";
import { parseJsonBody, reqString, optString } from "../validate";
import { requirePermission } from "../authMiddleware";
import { writeAuditLog } from "../audit";
import { addBusinessDays } from "../sla";
import { deleteObjectsQuietly } from "../recycle";
import { TIMELINE_EVENT_TYPES, eventTypeToShipmentStatus, pipelineRank, type TimelineEventType } from "../status";

/** Events that record a system milestone and may never be edited or removed here. */
const PROTECTED_TYPES = new Set<string>(["Barang Diterima", "Selesai / Terkirim", "Dibatalkan"]);
/** Types an admin may switch an event to (Selesai needs POD, Transfer Unit needs a truck, Barang Diterima is the initial event). */
const SELECTABLE_TYPES = TIMELINE_EVENT_TYPES.filter((t) => !PROTECTED_TYPES.has(t) && t !== "Transfer Unit");

interface EventRow {
  id: string;
  seq: number;
  type: string;
  lokasi: string;
  titik_id: string | null;
  tanggal: string;
  jam: string;
  keterangan: string;
  internal_notes: string | null;
}

async function loadShipment(ctx: Ctx, awb: string) {
  const s = await ctx.env.DB.prepare(`SELECT awb, status, tanggal_dibuat, sla_value, estimasi_tiba FROM shipments WHERE awb = ? AND deleted_at IS NULL`)
    .bind(awb)
    .first<{ awb: string; status: string; tanggal_dibuat: string; sla_value: number | null; estimasi_tiba: string | null }>();
  if (!s) throw Errors.notFound("AWB tidak ditemukan.");
  if (s.status === "Selesai / Terkirim" || s.status === "Dibatalkan") {
    throw Errors.unprocessable("Pengiriman ini sudah Selesai/Terkirim atau Dibatalkan, dan terkunci.");
  }
  if (s.status === "Hold") {
    throw Errors.unprocessable("Pengiriman ini sedang di-Hold. Lepas Hold terlebih dahulu.");
  }
  return s;
}

async function loadEvents(ctx: Ctx, awb: string): Promise<EventRow[]> {
  const r = await ctx.env.DB.prepare(
    `SELECT id, seq, type, lokasi, titik_id, tanggal, jam, keterangan, internal_notes FROM shipment_timeline_events WHERE awb = ? ORDER BY seq`,
  )
    .bind(awb)
    .all<EventRow>();
  return r.results ?? [];
}

/** Re-derives the shipment's current status (and ETA) from what is left in its timeline, so the
 * header badge, stepper and "TERBARU" marker always agree with the history. */
async function syncShipment(
  ctx: Ctx,
  s: { awb: string; status: string; tanggal_dibuat: string; sla_value: number | null; estimasi_tiba: string | null },
  actorId: string,
): Promise<{ status: string; estimasiTiba: string | null }> {
  const events = await loadEvents(ctx, s.awb);
  const last = events[events.length - 1];
  const status = last ? eventTypeToShipmentStatus(last.type as TimelineEventType) : "Dalam Persiapan";

  // ETA runs from the first departure; with no departure left it falls back to the creation date.
  let eta = s.estimasi_tiba;
  if (s.sla_value != null) {
    const departure = events.find((e) => e.type === "Berangkat");
    eta = addBusinessDays(departure ? departure.tanggal : s.tanggal_dibuat, s.sla_value);
  }

  if (status !== s.status || eta !== s.estimasi_tiba) {
    await ctx.env.DB.prepare(`UPDATE shipments SET status = ?, estimasi_tiba = ?, updated_at = ?, updated_by = ? WHERE awb = ?`)
      .bind(status, eta, new Date().toISOString(), actorId, s.awb)
      .run();
  }
  return { status, estimasiTiba: eta };
}

export function registerTrackingHistoryRoutes(router: Router) {
  router.patch("/api/shipments/:awb/timeline/:eventId", async (ctx: Ctx, params) => {
    const actor = requirePermission(ctx, "tracking.manage");
    const shipment = await loadShipment(ctx, params.awb);
    const events = await loadEvents(ctx, params.awb);
    const idx = events.findIndex((e) => e.id === params.eventId);
    if (idx < 0) throw Errors.notFound("Log tracking tidak ditemukan.");
    const ev = events[idx];
    if (PROTECTED_TYPES.has(ev.type)) {
      throw Errors.unprocessable(`Log "${ev.type}" tidak dapat diubah.`);
    }

    const body = await parseJsonBody(ctx.request);
    const requestedType = optString(body, "type") ?? ev.type;
    if (requestedType !== ev.type) {
      if (ev.type === "Transfer Unit") throw Errors.unprocessable("Status Transfer Unit tidak dapat diganti ke status lain.");
      if (!(SELECTABLE_TYPES as string[]).includes(requestedType)) {
        throw Errors.unprocessable(`Status "${requestedType}" tidak dapat dipilih.`);
      }
      // The edited log must stay between its neighbours so the pipeline still never goes backward.
      const prev = events[idx - 1];
      const next = events[idx + 1];
      const rank = pipelineRank(requestedType);
      if ((prev && rank < pipelineRank(prev.type)) || (next && rank > pipelineRank(next.type))) {
        throw Errors.unprocessable(`Status "${requestedType}" tidak sesuai urutan log sebelum/sesudahnya.`);
      }
    }
    const lokasi = reqString(body, "lokasi", { max: 150 });
    const tanggal = reqString(body, "tanggal");
    const jam = reqString(body, "jam");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) throw Errors.badRequest('Field "tanggal" harus berformat YYYY-MM-DD.');
    if (!/^\d{2}:\d{2}$/.test(jam)) throw Errors.badRequest('Field "jam" harus berformat HH:mm.');
    const keterangan = optString(body, "keterangan") ?? "";
    if (keterangan.length > 500) throw Errors.badRequest('Field "keterangan" maksimal 500 karakter.');

    // Keterangan Internal is only touched when the key is sent (tracking.manage is Superadmin/Admin only).
    let internalNotes = ev.internal_notes;
    if (Object.prototype.hasOwnProperty.call(body, "internalNotes")) {
      internalNotes = optString(body, "internalNotes") ?? null;
      if (internalNotes && internalNotes.length > 500) throw Errors.badRequest("Keterangan Internal maksimal 500 karakter.");
    }

    await ctx.env.DB.prepare(
      `UPDATE shipment_timeline_events SET type = ?, lokasi = ?, titik_id = CASE WHEN lokasi = ? THEN titik_id ELSE NULL END, tanggal = ?, jam = ?, keterangan = ?, internal_notes = ? WHERE id = ? AND awb = ?`,
    )
      .bind(requestedType, lokasi, lokasi, tanggal, jam, keterangan, internalNotes, ev.id, params.awb)
      .run();

    const synced = await syncShipment(ctx, shipment, actor.id);
    const changes: string[] = [];
    if (requestedType !== ev.type) changes.push(`status ${ev.type} -> ${requestedType}`);
    if (lokasi !== ev.lokasi) changes.push(`lokasi "${ev.lokasi}" -> "${lokasi}"`);
    if (tanggal !== ev.tanggal || jam !== ev.jam) changes.push(`waktu ${ev.tanggal} ${ev.jam} -> ${tanggal} ${jam}`);
    if (internalNotes !== ev.internal_notes) changes.push("keterangan internal diperbarui");
    if (keterangan !== ev.keterangan) changes.push(`keterangan "${ev.keterangan}" -> "${keterangan}"`);
    await writeAuditLog(ctx.env, actor, {
      action: "EDIT_TRACKING_EVENT",
      actionLabel: "EDIT TRACKING EVENT",
      module: "Shipment",
      awb: params.awb,
      description: `Log tracking #${ev.seq} (${ev.type}) diubah: ${changes.join("; ") || "tanpa perubahan"}. Status pengiriman: ${synced.status}.`,
    });
    return ok({ updated: true, status: synced.status, estimasiTiba: synced.estimasiTiba });
  });

  router.delete("/api/shipments/:awb/timeline/:eventId", async (ctx: Ctx, params) => {
    const actor = requirePermission(ctx, "tracking.manage");
    const shipment = await loadShipment(ctx, params.awb);
    const events = await loadEvents(ctx, params.awb);
    const ev = events.find((e) => e.id === params.eventId);
    if (!ev) throw Errors.notFound("Log tracking tidak ditemukan.");
    if (ev.type === "Barang Diterima") {
      throw Errors.unprocessable("Log awal pembuatan resi (Order Dibuat) tidak dapat dihapus.");
    }
    if (PROTECTED_TYPES.has(ev.type)) throw Errors.unprocessable(`Log "${ev.type}" tidak dapat dihapus.`);
    if (ev.type === "Transfer Unit") {
      throw Errors.unprocessable("Log Transfer Unit tidak dapat dihapus karena sudah mengubah unit truck pengiriman.");
    }

    const files = await ctx.env.DB.prepare(`SELECT object_key FROM files WHERE entity_type = 'timeline_photo' AND entity_id = ?`)
      .bind(ev.id)
      .all<{ object_key: string }>();
    await ctx.env.DB.batch([
      ctx.env.DB.prepare(`DELETE FROM files WHERE entity_type = 'timeline_photo' AND entity_id = ?`).bind(ev.id),
      ctx.env.DB.prepare(`DELETE FROM shipment_timeline_events WHERE id = ? AND awb = ?`).bind(ev.id, params.awb),
    ]);
    await deleteObjectsQuietly(ctx.env, (files.results ?? []).map((f) => f.object_key));

    const synced = await syncShipment(ctx, shipment, actor.id);
    await writeAuditLog(ctx.env, actor, {
      action: "DELETE_TRACKING_EVENT",
      actionLabel: "DELETE TRACKING EVENT",
      module: "Shipment",
      awb: params.awb,
      description: `Log tracking #${ev.seq} (${ev.type}, ${ev.lokasi}, ${ev.tanggal} ${ev.jam}) dihapus. Status pengiriman: ${shipment.status} -> ${synced.status}.`,
    });
    return ok({ deleted: true, status: synced.status, estimasiTiba: synced.estimasiTiba });
  });
}
