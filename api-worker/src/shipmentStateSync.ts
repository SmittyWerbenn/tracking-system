import type { Env } from "./types";
import { etaFromPickup, firstPickupDate } from "./sla";
import { loadHolidays } from "./holidays";
import { deleteObjectsQuietly } from "./recycle";
import { eventTypeToShipmentStatus, timelineOrderSql, type TimelineEventType } from "./status";
import { isLtlLayanan } from "./ltl";

const DELIVERED = "Selesai / Terkirim";

export interface SyncResult {
  awb: string;
  status: string;
  estimasiTiba: string | null;
  doBalikStatus: "pending" | "returned" | null;
  podCleared: boolean;
  /** Human-readable list of what changed (empty when the row was already in sync). */
  changes: string[];
}

interface ShipmentRow {
  awb: string;
  status: string;
  layanan: string;
  tanggal_dibuat: string;
  sla_value: number | null;
  estimasi_tiba: string | null;
  requires_do_balik: number;
  do_balik_status: string | null;
  do_balik_returned_at: string | null;
}

interface EventRow {
  type: string;
  tanggal: string;
  jam: string;
  lokasi: string;
  keterangan: string;
  ltl_stage: string | null;
  input_at: string | null;
}

/**
 * ShipmentStateSyncService: the single place that re-derives every derived field of a shipment from its
 * (remaining) tracking log (shipment_timeline_events, oldest first). Call it after ANY add / edit / delete of a log:
 *   - status            <- newest log (Dibatalkan logs of a restored order are ignored)
 *   - DO Balik          <- an active "POD Kembali" log means returned; none left means pending again
 *                          (non-LTL has no POD Kembali step: its manual confirmation is kept, but only while Terkirim stands)
 *   - Proof of Delivery <- follows the newest "Terkirim" log; none left clears shipment_pod and its photos
 *   - Estimasi Tiba     <- first Di-Pickup log + SLA days (Sundays and holidays skipped); none left falls back to the creation date
 * Idempotent: running it on an already-consistent shipment writes nothing.
 */
export async function recalculateFromHistories(env: Env, awb: string, actorId: string | null): Promise<SyncResult | null> {
  const db = env.DB;
  const s = await db
    .prepare(
      `SELECT awb, status, layanan, tanggal_dibuat, sla_value, estimasi_tiba, requires_do_balik, do_balik_status, do_balik_returned_at
       FROM shipments WHERE awb = ? AND deleted_at IS NULL`,
    )
    .bind(awb)
    .first<ShipmentRow>();
  if (!s) return null;
  // Cancelled / held shipments are locked; their status is not derived from the log.
  if (s.status === "Dibatalkan" || s.status === "Hold") return null;

  const events = (
    await db
      .prepare(`SELECT type, tanggal, jam, lokasi, keterangan, ltl_stage, input_at FROM shipment_timeline_events WHERE awb = ? ORDER BY ${timelineOrderSql("ASC")}`)
      .bind(awb)
      .all<EventRow>()
  ).results ?? [];
  const live = events.filter((e) => e.type !== "Dibatalkan");
  const last = live[live.length - 1];
  const changes: string[] = [];
  const nowIso = new Date().toISOString();
  const sets: string[] = [];
  const binds: unknown[] = [];

  // 1. Status
  const status = last ? eventTypeToShipmentStatus(last.type as TimelineEventType) : "Dalam Persiapan";
  if (status !== s.status) {
    sets.push("status = ?");
    binds.push(status);
    changes.push(`status ${s.status} -> ${status}`);
  }

  // 2. Estimasi Tiba
  let eta = s.estimasi_tiba;
  if (s.sla_value != null) {
    eta = etaFromPickup(firstPickupDate(events.map((e) => ({ type: e.type, tanggal: e.tanggal, ltlStage: e.ltl_stage }))), s.tanggal_dibuat, s.sla_value, await loadHolidays(db));
    if (eta !== s.estimasi_tiba) {
      sets.push("estimasi_tiba = ?");
      binds.push(eta);
      changes.push(`estimasi tiba ${s.estimasi_tiba ?? "-"} -> ${eta}`);
    }
  }

  // 3. DO Balik
  const podReturnedLog = live.find((e) => e.ltl_stage === "POD_RETURNED");
  const hasDelivered = live.some((e) => e.type === DELIVERED);
  let doBalik: "pending" | "returned" | null = null;
  if (s.requires_do_balik) {
    const returned = isLtlLayanan(s.layanan) ? !!podReturnedLog : s.do_balik_status === "returned" && hasDelivered;
    doBalik = returned ? "returned" : "pending";
    if (doBalik !== (s.do_balik_status === "returned" ? "returned" : "pending")) {
      changes.push(`DO Balik ${s.do_balik_status ?? "-"} -> ${doBalik}`);
    }
    if (doBalik === "returned") {
      if (s.do_balik_status !== "returned" || !s.do_balik_returned_at) {
        sets.push("do_balik_status = 'returned'", "do_balik_returned_at = ?");
        binds.push(podReturnedLog?.input_at ?? nowIso);
      }
    } else if (s.do_balik_status !== "pending" || s.do_balik_returned_at) {
      sets.push("do_balik_status = 'pending'", "do_balik_returned_at = NULL");
    }
  }

  // 4. Proof of Delivery card
  let podCleared = false;
  const pod = await db.prepare(`SELECT tanggal, jam, lokasi, catatan FROM shipment_pod WHERE awb = ?`).bind(awb).first<{ tanggal: string; jam: string; lokasi: string; catatan: string | null }>();
  if (pod) {
    const delivered = [...live].reverse().find((e) => e.type === DELIVERED);
    if (!delivered) {
      const files = await db.prepare(`SELECT object_key FROM files WHERE entity_type IN ('pod_barang','pod_surat_jalan') AND entity_id = ?`).bind(awb).all<{ object_key: string }>();
      await db.batch([
        db.prepare(`DELETE FROM files WHERE entity_type IN ('pod_barang','pod_surat_jalan') AND entity_id = ?`).bind(awb),
        db.prepare(`DELETE FROM shipment_pod WHERE awb = ?`).bind(awb),
      ]);
      await deleteObjectsQuietly(env, (files.results ?? []).map((f) => f.object_key));
      podCleared = true;
      changes.push("Proof of Delivery dikosongkan (log Terkirim tidak ada)");
    } else if (pod.tanggal !== delivered.tanggal || pod.jam !== delivered.jam || pod.lokasi !== delivered.lokasi || (pod.catatan ?? "") !== delivered.keterangan) {
      await db
        .prepare(`UPDATE shipment_pod SET tanggal = ?, jam = ?, lokasi = ?, catatan = ?, updated_at = ? WHERE awb = ?`)
        .bind(delivered.tanggal, delivered.jam, delivered.lokasi, delivered.keterangan, nowIso, awb)
        .run();
      changes.push("Proof of Delivery disamakan dengan log Terkirim terbaru");
    }
  }

  if (sets.length) {
    await db
      .prepare(`UPDATE shipments SET ${sets.join(", ")}, updated_at = ?, updated_by = COALESCE(?, updated_by) WHERE awb = ?`)
      .bind(...binds, nowIso, actorId, awb)
      .run();
  }
  return { awb, status, estimasiTiba: eta, doBalikStatus: doBalik, podCleared, changes };
}

/** One-time / maintenance reconcile of every live shipment; returns only the ones that changed. */
export async function reconcileAllShipments(env: Env, actorId: string | null): Promise<SyncResult[]> {
  const rows = (await env.DB.prepare(`SELECT awb FROM shipments WHERE deleted_at IS NULL AND status NOT IN ('Dibatalkan','Hold')`).all<{ awb: string }>()).results ?? [];
  const out: SyncResult[] = [];
  for (const { awb } of rows) {
    const r = await recalculateFromHistories(env, awb, actorId);
    if (r && r.changes.length) out.push(r);
  }
  return out;
}
