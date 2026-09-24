import type { Router } from "../router";
import type { Ctx } from "../types";
import { ok, Errors } from "../http";
import { parseJsonBody, reqString, reqEnum, reqNumber, reqEmail, optString } from "../validate";
import { newId } from "../crypto";
import { requirePermission } from "../authMiddleware";
import { writeAuditLog } from "../audit";
import { parsePagination, pageMeta } from "../pagination";
import { generateAwb } from "../awb";
import { TIMELINE_EVENT_TYPES, eventTypeToShipmentStatus, isForwardTransition, type TimelineEventType } from "../status";

const LAYANAN = ["Darat", "Express", "Kargo", "Regular", "Charter"] as const;

const POD_EDIT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

function shipmentSummary(row: Record<string, unknown>) {
  return {
    awb: row.awb,
    tanggalDibuat: row.tanggal_dibuat,
    jamDibuat: row.jam_dibuat,
    status: row.status,
    pengirim: { nama: row.pengirim_nama, telepon: row.pengirim_telepon, email: row.pengirim_email },
    penerima: { nama: row.penerima_nama, telepon: row.penerima_telepon, email: row.penerima_email },
    alamatAsal: row.alamat_asal,
    kotaAsal: row.kota_asal,
    alamatTujuan: row.alamat_tujuan,
    kotaTujuan: row.kota_tujuan,
    deskripsiBarang: row.deskripsi_barang,
    layanan: row.layanan,
    beratKg: row.berat_kg,
    jumlahKoli: row.jumlah_koli,
    truckId: row.truck_id,
    truckNomorUnit: row.truck_nomor_unit ?? null,
    truckJenis: row.truck_jenis ?? null,
    truckDriverNama: row.truck_driver_nama ?? null,
    emailTerkirim: !!row.email_terkirim,
    emailTerkirimAt: row.email_terkirim_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    pod: row.pod_tanggal
      ? { tanggal: row.pod_tanggal, jam: row.pod_jam, namaPenerima: row.pod_nama_penerima }
      : null,
    lastUpdate: row.last_tanggal ? { tanggal: row.last_tanggal, jam: row.last_jam } : null,
  };
}

export function registerShipmentRoutes(router: Router) {
  router.get("/api/shipments", async (ctx: Ctx) => {
    requirePermission(ctx, "shipments.view");
    const url = new URL(ctx.request.url);
    const { page, limit, offset } = parsePagination(url);
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("q")?.trim();

    const where: string[] = [];
    const params: unknown[] = [];
    if (status) { where.push("s.status = ?"); params.push(status); }
    if (search) {
      where.push("(s.awb LIKE ? OR s.pengirim_nama LIKE ? OR s.penerima_nama LIKE ?)");
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const total = await ctx.env.DB.prepare(`SELECT COUNT(*) as c FROM shipments s ${whereSql}`)
      .bind(...params)
      .first<{ c: number }>();

    const rows = await ctx.env.DB.prepare(
      `SELECT s.*, t.nomor_unit as truck_nomor_unit, d.nama as truck_driver_nama,
              p.tanggal as pod_tanggal, p.jam as pod_jam, p.nama_penerima as pod_nama_penerima,
              le.tanggal as last_tanggal, le.jam as last_jam
       FROM shipments s
       LEFT JOIN trucks t ON t.id = s.truck_id
       LEFT JOIN drivers d ON d.id = t.driver_id
       LEFT JOIN shipment_pod p ON p.awb = s.awb
       LEFT JOIN (
         SELECT e1.awb, e1.tanggal, e1.jam FROM shipment_timeline_events e1
         WHERE e1.seq = (SELECT MAX(e2.seq) FROM shipment_timeline_events e2 WHERE e2.awb = e1.awb)
       ) le ON le.awb = s.awb
       ${whereSql}
       ORDER BY s.tanggal_dibuat DESC, s.jam_dibuat DESC
       LIMIT ? OFFSET ?`,
    )
      .bind(...params, limit, offset)
      .all();

    return ok({
      items: (rows.results ?? []).map(shipmentSummary),
      meta: pageMeta(page, limit, total?.c ?? 0),
    });
  });

  router.post("/api/shipments", async (ctx: Ctx) => {
    const actor = requirePermission(ctx, "shipments.create");
    const body = await parseJsonBody(ctx.request);

    const pengirimNama = reqString(body, "pengirimNama", { max: 100 });
    const pengirimTelepon = reqString(body, "pengirimTelepon", { max: 30 });
    const pengirimEmail = reqEmail(body, "pengirimEmail");
    const penerimaNama = reqString(body, "penerimaNama", { max: 100 });
    const penerimaTelepon = reqString(body, "penerimaTelepon", { max: 30 });
    const penerimaEmail = reqEmail(body, "penerimaEmail");
    const alamatAsal = reqString(body, "alamatAsal", { max: 300 });
    const kotaAsal = reqString(body, "kotaAsal", { max: 80 });
    const alamatTujuan = reqString(body, "alamatTujuan", { max: 300 });
    const kotaTujuan = reqString(body, "kotaTujuan", { max: 80 });
    const deskripsiBarang = optString(body, "deskripsiBarang") ?? "";
    const layanan = reqEnum(body, "layanan", LAYANAN);
    const beratKg = reqNumber(body, "beratKg", { min: 0.01, max: 100000 });
    const jumlahKoli = reqNumber(body, "jumlahKoli", { min: 1, max: 100000 });
    const truckId = optString(body, "truckId");

    if (truckId) {
      const truck = await ctx.env.DB.prepare(`SELECT id FROM trucks WHERE id = ?`).bind(truckId).first();
      if (!truck) throw Errors.badRequest("Truck yang dipilih tidak ditemukan.");
    }

    const awb = await generateAwb(ctx.env.DB);
    const now = new Date();
    const nowIso = now.toISOString();
    const tanggalDibuat = nowIso.slice(0, 10);
    const jamDibuat = nowIso.slice(11, 16);

    await ctx.env.DB.prepare(
      `INSERT INTO shipments (
        awb, tanggal_dibuat, jam_dibuat, status,
        pengirim_nama, pengirim_telepon, pengirim_email,
        penerima_nama, penerima_telepon, penerima_email,
        alamat_asal, kota_asal, alamat_tujuan, kota_tujuan,
        deskripsi_barang, layanan, berat_kg, jumlah_koli, truck_id,
        email_terkirim, created_at, updated_at, created_by, updated_by
      ) VALUES (?, ?, ?, 'Dalam Persiapan', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
    )
      .bind(
        awb, tanggalDibuat, jamDibuat,
        pengirimNama, pengirimTelepon, pengirimEmail,
        penerimaNama, penerimaTelepon, penerimaEmail,
        alamatAsal, kotaAsal, alamatTujuan, kotaTujuan,
        deskripsiBarang, layanan, beratKg, jumlahKoli, truckId ?? null,
        nowIso, nowIso, actor.id, actor.id,
      )
      .run();

    await ctx.env.DB.prepare(
      `INSERT INTO shipment_timeline_events (id, awb, seq, type, lokasi, tanggal, jam, keterangan, truck_id, input_by_user_id, input_by_name, input_at, created_at)
       VALUES (?, ?, 1, 'Barang Diterima', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(newId(), awb, `Gudang ${kotaAsal}`, tanggalDibuat, jamDibuat, "Barang diterima dan siap dikirim.", truckId ?? null, actor.id, actor.nama, nowIso, nowIso)
      .run();

    await writeAuditLog(ctx.env, actor, {
      action: "CREATE_AWB",
      actionLabel: "CREATE AWB",
      module: "Shipment",
      awb,
      description: `Resi diterbitkan untuk pengiriman ${kotaAsal} -> ${kotaTujuan}.`,
    });

    return ok({ awb }, {}, 201);
  });

  router.get("/api/shipments/:awb", async (ctx: Ctx, params) => {
    requirePermission(ctx, "shipments.view");
    const row = await ctx.env.DB.prepare(
      `SELECT s.*, t.nomor_unit as truck_nomor_unit, t.jenis as truck_jenis, d.nama as truck_driver_nama
       FROM shipments s LEFT JOIN trucks t ON t.id = s.truck_id LEFT JOIN drivers d ON d.id = t.driver_id
       WHERE s.awb = ?`,
    )
      .bind(params.awb)
      .first();
    if (!row) throw Errors.notFound("AWB tidak ditemukan.");

    const timeline = await ctx.env.DB.prepare(
      `SELECT e.*, t.nomor_unit as truck_nomor_unit, d.nama as truck_driver_nama,
              pt.nomor_unit as truck_sebelumnya_nomor_unit
       FROM shipment_timeline_events e
       LEFT JOIN trucks t ON t.id = e.truck_id
       LEFT JOIN drivers d ON d.id = t.driver_id
       LEFT JOIN trucks pt ON pt.id = e.truck_sebelumnya_id
       WHERE e.awb = ? ORDER BY e.seq ASC`,
    )
      .bind(params.awb)
      .all();

    const pod = await ctx.env.DB.prepare(`SELECT * FROM shipment_pod WHERE awb = ?`).bind(params.awb).first();

    const files = await ctx.env.DB.prepare(
      `SELECT id, entity_type, entity_id FROM files WHERE (entity_type IN ('shipment_photo','pod_barang','pod_surat_jalan') AND entity_id = ?)
         OR (entity_type = 'timeline_photo' AND entity_id IN (SELECT id FROM shipment_timeline_events WHERE awb = ?))
         ORDER BY created_at DESC`,
    )
      .bind(params.awb, params.awb)
      .all();

    return ok({ shipment: shipmentSummary(row), timeline: timeline.results, pod: pod ?? null, files: files.results ?? [] });
  });

  router.patch("/api/shipments/:awb", async (ctx: Ctx, params) => {
    const actor = requirePermission(ctx, "shipments.update_info");
    const shipment = await ctx.env.DB.prepare(`SELECT status FROM shipments WHERE awb = ?`).bind(params.awb).first<{
      status: string;
    }>();
    if (!shipment) throw Errors.notFound("AWB tidak ditemukan.");
    if (shipment.status === "Selesai / Terkirim") {
      throw Errors.unprocessable("Pengiriman yang sudah Selesai/Terkirim tidak bisa diubah lagi.");
    }

    const body = await parseJsonBody(ctx.request);
    const pengirimNama = reqString(body, "pengirimNama", { max: 100 });
    const pengirimTelepon = reqString(body, "pengirimTelepon", { max: 30 });
    const pengirimEmail = reqEmail(body, "pengirimEmail");
    const penerimaNama = reqString(body, "penerimaNama", { max: 100 });
    const penerimaTelepon = reqString(body, "penerimaTelepon", { max: 30 });
    const penerimaEmail = reqEmail(body, "penerimaEmail");
    const alamatAsal = reqString(body, "alamatAsal", { max: 300 });
    const kotaAsal = reqString(body, "kotaAsal", { max: 80 });
    const alamatTujuan = reqString(body, "alamatTujuan", { max: 300 });
    const kotaTujuan = reqString(body, "kotaTujuan", { max: 80 });

    await ctx.env.DB.prepare(
      `UPDATE shipments SET pengirim_nama=?, pengirim_telepon=?, pengirim_email=?, penerima_nama=?, penerima_telepon=?, penerima_email=?,
        alamat_asal=?, kota_asal=?, alamat_tujuan=?, kota_tujuan=?, updated_at=?, updated_by=? WHERE awb=?`,
    )
      .bind(
        pengirimNama, pengirimTelepon, pengirimEmail, penerimaNama, penerimaTelepon, penerimaEmail,
        alamatAsal, kotaAsal, alamatTujuan, kotaTujuan, new Date().toISOString(), actor.id, params.awb,
      )
      .run();

    await writeAuditLog(ctx.env, actor, {
      action: "UPDATE_SHIPMENT_INFO",
      actionLabel: "UPDATE SHIPMENT INFO",
      module: "Shipment",
      awb: params.awb,
      description: "Data pengiriman diperbarui.",
    });

    return ok({ updated: true });
  });

  router.post("/api/shipments/:awb/timeline", async (ctx: Ctx, params) => {
    const actor = requirePermission(ctx, "tracking.update");
    const shipment = await ctx.env.DB.prepare(`SELECT * FROM shipments WHERE awb = ?`).bind(params.awb).first<
      Record<string, unknown>
    >();
    if (!shipment) throw Errors.notFound("AWB tidak ditemukan.");
    if (shipment.status === "Selesai / Terkirim") {
      throw Errors.unprocessable("Pengiriman ini sudah Selesai/Terkirim dan terkunci.");
    }

    const body = await parseJsonBody(ctx.request);
    const type = reqEnum(body, "type", TIMELINE_EVENT_TYPES.filter((t) => t !== "Barang Diterima") as readonly TimelineEventType[]);
    const tanggal = reqString(body, "tanggal");
    const jam = reqString(body, "jam");
    const keterangan = reqString(body, "keterangan", { max: 500 });
    const truckId = optString(body, "truckId");
    const titikId = optString(body, "titikId");
    const isSelesai = type === "Selesai / Terkirim";
    const lokasi = isSelesai ? String(shipment.kota_tujuan) : reqString(body, "lokasi", { max: 150 });
    const namaPenerima = isSelesai ? reqString(body, "namaPenerima", { max: 100 }) : undefined;

    if (!isForwardTransition(String(shipment.status), type)) {
      throw Errors.unprocessable(
        `Status "${type}" tidak bisa dipilih dari status saat ini ("${shipment.status}") - pipeline tidak bisa dibuat mundur.`,
      );
    }
    if (truckId) {
      const truck = await ctx.env.DB.prepare(`SELECT id FROM trucks WHERE id = ?`).bind(truckId).first();
      if (!truck) throw Errors.badRequest("Truck yang dipilih tidak ditemukan.");
    }

    const newStatus = eventTypeToShipmentStatus(type);
    const nowIso = new Date().toISOString();
    const seqRow = await ctx.env.DB.prepare(`SELECT COALESCE(MAX(seq), 0) + 1 as next FROM shipment_timeline_events WHERE awb = ?`)
      .bind(params.awb)
      .first<{ next: number }>();
    const seq = seqRow?.next ?? 1;
    const isTransfer = type === "Transfer Unit";
    const previousTruckId = isTransfer ? (shipment.truck_id as string | null) : null;
    const eventId = newId();

    await ctx.env.DB.prepare(
      `INSERT INTO shipment_timeline_events (id, awb, seq, type, lokasi, titik_id, tanggal, jam, keterangan, truck_id, truck_sebelumnya_id, input_by_user_id, input_by_name, input_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(eventId, params.awb, seq, type, lokasi, titikId ?? null, tanggal, jam, keterangan, truckId ?? shipment.truck_id ?? null, previousTruckId, actor.id, actor.nama, nowIso, nowIso)
      .run();

    await ctx.env.DB.prepare(`UPDATE shipments SET status = ?, truck_id = COALESCE(?, truck_id), updated_at = ?, updated_by = ? WHERE awb = ?`)
      .bind(newStatus, truckId ?? null, nowIso, actor.id, params.awb)
      .run();

    if (isSelesai) {
      await ctx.env.DB.prepare(
        `INSERT INTO shipment_pod (awb, tanggal, jam, lokasi, nama_penerima, catatan, delivered_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(params.awb, tanggal, jam, lokasi, namaPenerima, keterangan, nowIso, nowIso)
        .run();
    }

    const actionMap: Record<string, { action: string; label: string; description: string }> = {
      "Transfer Unit": { action: "TRANSFER_TRUCK", label: "TRANSFER TRUCK", description: `Truck dipindahkan di ${lokasi}.` },
      Kendala: { action: "ADD_ISSUE", label: "ADD ISSUE", description: `Kendala dicatat: ${keterangan}` },
    };
    if (isSelesai) {
      await writeAuditLog(ctx.env, actor, { action: "UPLOAD_POD", actionLabel: "UPLOAD POD", module: "Shipment", awb: params.awb, description: "Bukti serah terima dicatat." });
      await writeAuditLog(ctx.env, actor, { action: "CLOSE_SHIPMENT", actionLabel: "CLOSE SHIPMENT", module: "Shipment", awb: params.awb, description: `Status berubah: ${shipment.status} -> Selesai / Terkirim. Data dikunci.` });
    } else if (actionMap[type]) {
      const a = actionMap[type];
      await writeAuditLog(ctx.env, actor, { action: a.action, actionLabel: a.label, module: "Shipment", awb: params.awb, description: a.description });
    } else {
      await writeAuditLog(ctx.env, actor, { action: "UPDATE_STATUS", actionLabel: "UPDATE STATUS", module: "Shipment", awb: params.awb, description: `Status berubah: ${shipment.status} -> ${newStatus} (${lokasi}).` });
    }

    if (type === "Kendala" || isSelesai) {
      const trigger = type === "Kendala" ? "KENDALA" : "SELESAI";
      const subject = type === "Kendala"
        ? `Update Pengiriman - Terdapat Kendala (AWB ${params.awb})`
        : `Pengiriman Anda Telah Selesai (AWB ${params.awb})`;
      await ctx.env.DB.prepare(
        `INSERT INTO notifications (id, awb, trigger_type, subject, to_email, to_name, recipient_role, created_at) VALUES (?, ?, ?, ?, ?, ?, 'penerima', ?)`,
      )
        .bind(newId(), params.awb, trigger, subject, shipment.penerima_email, shipment.penerima_nama, nowIso)
        .run();
      await writeAuditLog(ctx.env, null, {
        action: "SEND_NOTIFICATION",
        actionLabel: "SEND NOTIFICATION",
        module: "Notification",
        awb: params.awb,
        description: `Notifikasi "${subject}" dibuat untuk customer.`,
      });
    }

    return ok({ updated: true, status: newStatus, eventId }, {}, 201);
  });

  router.patch("/api/shipments/:awb/pod-photo", async (ctx: Ctx, params) => {
    const actor = requirePermission(ctx, "tracking.update");
    const pod = await ctx.env.DB.prepare(`SELECT delivered_at FROM shipment_pod WHERE awb = ?`).bind(params.awb).first<{
      delivered_at: string;
    }>();
    if (!pod) throw Errors.notFound("POD untuk AWB ini belum ada.");

    const deliveredAtMs = new Date(pod.delivered_at).getTime();
    if (Date.now() - deliveredAtMs > POD_EDIT_WINDOW_MS) {
      throw Errors.unprocessable("Batas waktu 30 hari untuk mengganti foto POD sudah lewat.");
    }

    const body = await parseJsonBody(ctx.request);
    const fotoFileId = optString(body, "fotoFileId");

    await ctx.env.DB.prepare(`UPDATE shipment_pod SET updated_at = ? WHERE awb = ?`)
      .bind(new Date().toISOString(), params.awb)
      .run();

    if (fotoFileId) {
      await ctx.env.DB.prepare(`UPDATE files SET entity_id = ? WHERE id = ?`).bind(params.awb, fotoFileId).run();
    }

    await writeAuditLog(ctx.env, actor, {
      action: "UPDATE_POD_PHOTO",
      actionLabel: "UPDATE POD PHOTO",
      module: "Shipment",
      awb: params.awb,
      description: "Foto barang diterima (bukti serah terima) diganti.",
    });

    return ok({ updated: true });
  });
}
