import type { Router } from "../router";
import type { Ctx } from "../types";
import { ok, Errors } from "../http";
import { parseJsonBody, reqString, reqNumber, optString } from "../validate";
import { newId } from "../crypto";
import { presignGet } from "../storage";

const PUBLIC_ENTITY_TYPES = new Set(["shipment_photo", "timeline_photo", "pod_barang", "pod_surat_jalan"]);

function shipmentSummary(row: Record<string, unknown>) {
  return {
    awb: row.awb,
    tanggalDibuat: row.tanggal_dibuat,
    status: row.status,
    penerima: { nama: row.penerima_nama },
    alamatTujuan: row.alamat_tujuan,
    kotaAsal: row.kota_asal,
    kotaTujuan: row.kota_tujuan,
    layanan: row.layanan,
    beratKg: row.berat_kg,
    jumlahKoli: row.jumlah_koli,
    deskripsiBarang: row.deskripsi_barang,
    truckNomorUnit: row.truck_nomor_unit ?? null,
    truckJenis: row.truck_jenis ?? null,
    truckDriverNama: row.truck_driver_nama ?? null,
    estimasiTiba: row.estimasi_tiba,
  };
}

export function registerPublicRoutes(router: Router) {
  // Public tracking lookup - no auth, but only ever returns fields already
  // shown on the public tracking page (never internal notes/pengirim contact).
  router.get("/api/public/shipments/:awb", async (ctx: Ctx, params) => {
    const row = await ctx.env.DB.prepare(
      `SELECT s.*, t.nomor_unit as truck_nomor_unit, t.jenis as truck_jenis, d.nama as truck_driver_nama
       FROM shipments s LEFT JOIN trucks t ON t.id = s.truck_id LEFT JOIN drivers d ON d.id = t.driver_id
       WHERE s.awb = ?`,
    )
      .bind(params.awb)
      .first();
    if (!row) throw Errors.notFound("AWB tidak ditemukan.");

    const timeline = await ctx.env.DB.prepare(
      `SELECT e.id, e.type, e.lokasi, e.tanggal, e.jam, e.keterangan, t.nomor_unit as truck_nomor_unit, d.nama as truck_driver_nama
       FROM shipment_timeline_events e
       LEFT JOIN trucks t ON t.id = e.truck_id
       LEFT JOIN drivers d ON d.id = t.driver_id
       WHERE e.awb = ? ORDER BY e.seq ASC`,
    )
      .bind(params.awb)
      .all();

    const pod = await ctx.env.DB.prepare(
      `SELECT tanggal, jam, lokasi, nama_penerima, catatan FROM shipment_pod WHERE awb = ?`,
    )
      .bind(params.awb)
      .first();

    const feedbackExists = await ctx.env.DB.prepare(`SELECT id FROM feedback WHERE awb = ?`).bind(params.awb).first();

    const files = await ctx.env.DB.prepare(
      `SELECT id, entity_type, entity_id FROM files WHERE (entity_type IN ('shipment_photo','pod_barang','pod_surat_jalan') AND entity_id = ?)
         OR (entity_type = 'timeline_photo' AND entity_id IN (SELECT id FROM shipment_timeline_events WHERE awb = ?))
         ORDER BY created_at DESC`,
    )
      .bind(params.awb, params.awb)
      .all<{ id: string; entity_type: string; entity_id: string }>();

    return ok({
      shipment: shipmentSummary(row),
      timeline: timeline.results,
      pod: pod ?? null,
      files: files.results ?? [],
      hasFeedback: !!feedbackExists,
    });
  });

  router.get("/api/public/locations", async (ctx: Ctx) => {
    const rows = await ctx.env.DB.prepare(
      `SELECT id, nama_kota, kode_kota, provinsi, jenis FROM locations WHERE aktif = 1 ORDER BY nama_kota`,
    ).all();
    return ok({ items: rows.results });
  });

  router.post("/api/public/feedback", async (ctx: Ctx) => {
    const body = await parseJsonBody(ctx.request);
    const awb = reqString(body, "awb");
    const customerName = reqString(body, "customerName", { max: 100 });
    const rating = reqNumber(body, "rating", { min: 1, max: 5 });
    const comment = optString(body, "comment");

    const shipment = await ctx.env.DB.prepare(`SELECT status FROM shipments WHERE awb = ?`).bind(awb).first<{
      status: string;
    }>();
    if (!shipment) throw Errors.notFound("AWB tidak ditemukan.");
    if (shipment.status !== "Selesai / Terkirim") {
      throw Errors.unprocessable("Feedback hanya bisa diisi setelah pengiriman selesai.");
    }

    const existing = await ctx.env.DB.prepare(`SELECT id FROM feedback WHERE awb = ?`).bind(awb).first();
    if (existing) throw Errors.conflict("Feedback untuk AWB ini sudah pernah dikirim.");

    await ctx.env.DB.prepare(
      `INSERT INTO feedback (id, awb, customer_name, rating, comment, submitted_at) VALUES (?, ?, ?, ?, ?, ?)`,
    )
      .bind(newId(), awb, customerName, Math.round(rating), comment ?? null, new Date().toISOString())
      .run();

    return ok({ submitted: true }, {}, 201);
  });

  router.get("/api/public/files/:id", async (ctx: Ctx, params) => {
    const row = await ctx.env.DB.prepare(`SELECT object_key, entity_type FROM files WHERE id = ?`)
      .bind(params.id)
      .first<{ object_key: string; entity_type: string }>();
    if (!row || !PUBLIC_ENTITY_TYPES.has(row.entity_type)) throw Errors.notFound("File tidak ditemukan.");
    const url = await presignGet(ctx.env, row.object_key);
    return ok({ url });
  });
}
