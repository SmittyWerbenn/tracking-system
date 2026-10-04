import type { Router } from "../router";
import type { Ctx } from "../types";
import { ok, Errors } from "../http";
import { parseJsonBody, optBool } from "../validate";
import { newId } from "../crypto";
import { requirePermission } from "../authMiddleware";
import { writeAuditLog } from "../audit";

const JENIS = ["Gudang", "Hub", "Transit", "Cabang", "Tujuan"] as const;
type Jenis = (typeof JENIS)[number];
const DEFAULT_JENIS: Jenis = "Transit";
const BULK_MAX_ROWS = 2000;
const BULK_CHUNK = 50;

/** Trim + collapse inner whitespace, so "Aceh  Barat " and "Aceh Barat" are one value. */
function clean(v: unknown): string {
  return typeof v === "string" ? v.trim().replace(/\s+/g, " ") : "";
}

/** Case-insensitive identity of a location: Kota / Kabupaten + Provinsi + Nama Titik Transit. */
function identity(kota: string, provinsi: string, titik: string): string {
  return [kota, provinsi, titik].map((s) => s.toLowerCase()).join("\u0001");
}

interface LocationInput {
  namaKota: string;
  provinsi: string;
  namaTitik: string;
  kodeKota: string;
  jenis: Jenis;
  aktif: boolean;
}

/** Validates one location payload (used by single create and by every bulk
 * row) and returns either the cleaned values or the list of problems. Kota /
 * Kabupaten and Nama Titik Transit are mandatory; Provinsi, Kode and Jenis
 * are optional (Jenis defaults to Transit). */
function validateLocation(raw: Record<string, unknown>): { value?: LocationInput; errors: string[] } {
  const errors: string[] = [];
  const namaKota = clean(raw.namaKota);
  const provinsi = clean(raw.provinsi);
  const namaTitik = clean(raw.namaTitik);
  const kodeKota = clean(raw.kodeKota).toUpperCase();
  const jenisRaw = clean(raw.jenis);

  if (!namaKota) errors.push("Kota / Kabupaten wajib diisi");
  else if (namaKota.length > 80) errors.push("Kota / Kabupaten maksimal 80 karakter");
  if (provinsi.length > 80) errors.push("Provinsi maksimal 80 karakter");
  if (!namaTitik) errors.push("Nama Titik Transit wajib diisi");
  else if (namaTitik.length > 120) errors.push("Nama Titik Transit maksimal 120 karakter");
  if (kodeKota.length > 10) errors.push("Kode maksimal 10 karakter");

  let jenis: Jenis = DEFAULT_JENIS;
  if (jenisRaw) {
    const match = JENIS.find((j) => j.toLowerCase() === jenisRaw.toLowerCase());
    if (!match) errors.push(`Jenis "${jenisRaw}" tidak valid (pilih: ${JENIS.join(", ")})`);
    else jenis = match;
  }
  const aktif = raw.aktif === undefined || raw.aktif === null ? true : Boolean(raw.aktif);

  if (errors.length > 0) return { errors };
  return { value: { namaKota, provinsi, namaTitik, kodeKota, jenis, aktif }, errors };
}

function insertStatement(db: D1Database, v: LocationInput, actorId: string, now: string, id: string = newId()) {
  // provinsi is its own field now (NOT NULL in the schema, so "" when not given).
  return db
    .prepare(
      `INSERT INTO locations (id, nama_kota, nama_titik, kode_kota, provinsi, jenis, aktif, created_at, updated_at, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, v.namaKota, v.namaTitik, v.kodeKota, v.provinsi, v.jenis, v.aktif ? 1 : 0, now, now, actorId, actorId);
}

function isUniqueViolation(err: unknown): boolean {
  return err instanceof Error && /UNIQUE constraint failed/i.test(err.message);
}

export function registerLocationRoutes(router: Router) {
  router.get("/api/locations", async (ctx: Ctx) => {
    requirePermission(ctx, "locations.view");
    const url = new URL(ctx.request.url);
    const onlyActive = url.searchParams.get("active") === "true";
    const query = onlyActive
      ? `SELECT * FROM locations WHERE aktif = 1 ORDER BY nama_kota`
      : `SELECT * FROM locations ORDER BY nama_kota`;
    const rows = await ctx.env.DB.prepare(query).all();
    return ok({ items: rows.results });
  });

  router.post("/api/locations", async (ctx: Ctx) => {
    const actor = requirePermission(ctx, "locations.manage");
    const body = await parseJsonBody(ctx.request);
    const { value, errors } = validateLocation(body);
    if (!value) throw Errors.badRequest(errors.join(". ") + ".");

    const dupe = await ctx.env.DB.prepare(
      `SELECT id FROM locations WHERE nama_kota = ? COLLATE NOCASE AND provinsi = ? COLLATE NOCASE AND nama_titik = ? COLLATE NOCASE`,
    )
      .bind(value.namaKota, value.provinsi, value.namaTitik)
      .first();
    if (dupe) {
      throw Errors.conflict(`Data "${value.namaKota} / ${value.provinsi || "-"} / ${value.namaTitik}" sudah ada.`);
    }

    const id = newId();
    try {
      await insertStatement(ctx.env.DB, value, actor.id, new Date().toISOString(), id).run();
    } catch (err) {
      if (isUniqueViolation(err)) throw Errors.conflict("Data dengan Kota / Kabupaten, Provinsi, dan Nama Titik Transit yang sama sudah ada.");
      throw err;
    }

    await writeAuditLog(ctx.env, actor, {
      action: "CREATE_LOCATION",
      actionLabel: "CREATE LOCATION",
      module: "Master Kota",
      description: `Titik transit "${value.namaTitik}" (${value.namaKota}${value.provinsi ? ", " + value.provinsi : ""}) ditambahkan.`,
    });

    return ok({ id }, {}, 201);
  });

  // Bulk import (Kota | Kabupaten | Nama Titik Transit [+ Kode, Jenis, Aktif]).
  // Every row is validated first; valid rows are inserted, invalid/duplicate
  // ones are reported back with their row number so the admin can fix just
  // those. Never replaces or deletes existing data.
  router.post("/api/locations/bulk", async (ctx: Ctx) => {
    const actor = requirePermission(ctx, "locations.manage");
    const body = await parseJsonBody(ctx.request);
    const items = body.items;
    if (!Array.isArray(items) || items.length === 0) throw Errors.badRequest("Tidak ada baris data untuk diimport.");
    if (items.length > BULK_MAX_ROWS) throw Errors.badRequest(`Maksimal ${BULK_MAX_ROWS} baris per import.`);

    const existing = await ctx.env.DB.prepare(
      `SELECT nama_kota, provinsi, nama_titik FROM locations WHERE nama_titik IS NOT NULL`,
    ).all<{ nama_kota: string; provinsi: string; nama_titik: string }>();
    const seen = new Set((existing.results ?? []).map((r) => identity(r.nama_kota, r.provinsi ?? "", r.nama_titik)));

    type Failure = { row: number; kota: string; provinsi: string; titik: string; message: string };
    const failed: Failure[] = [];
    const valid: { row: number; value: LocationInput }[] = [];

    items.forEach((item, index) => {
      const obj = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
      const row = typeof obj.row === "number" && Number.isFinite(obj.row) ? obj.row : index + 2; // +2: header is row 1
      const { value, errors } = validateLocation(obj);
      if (!value) {
        failed.push({ row, kota: clean(obj.namaKota), provinsi: clean(obj.provinsi), titik: clean(obj.namaTitik), message: errors.join("; ") });
        return;
      }
      const id = identity(value.namaKota, value.provinsi, value.namaTitik);
      if (seen.has(id)) {
        failed.push({ row, kota: value.namaKota, provinsi: value.provinsi, titik: value.namaTitik, message: "Duplikat (sudah ada di master data atau di baris sebelumnya)" });
        return;
      }
      seen.add(id);
      valid.push({ row, value });
    });

    const now = new Date().toISOString();
    let created = 0;
    for (let i = 0; i < valid.length; i += BULK_CHUNK) {
      const chunk = valid.slice(i, i + BULK_CHUNK);
      try {
        await ctx.env.DB.batch(chunk.map((c) => insertStatement(ctx.env.DB, c.value, actor.id, now)));
        created += chunk.length;
      } catch {
        // The chunk is atomic; if anything in it failed (e.g. a concurrent
        // insert tripped the unique index) retry row by row to isolate it.
        for (const c of chunk) {
          try {
            await insertStatement(ctx.env.DB, c.value, actor.id, now).run();
            created += 1;
          } catch (err) {
            failed.push({
              row: c.row,
              kota: c.value.namaKota,
              provinsi: c.value.provinsi,
              titik: c.value.namaTitik,
              message: isUniqueViolation(err) ? "Duplikat (sudah ada di master data)" : "Gagal menyimpan",
            });
          }
        }
      }
    }
    failed.sort((a, b) => a.row - b.row);

    await writeAuditLog(ctx.env, actor, {
      action: "IMPORT_LOCATION",
      actionLabel: "IMPORT LOCATION",
      module: "Master Kota",
      description: `Import Kota & Titik Transit: ${created} baris berhasil, ${failed.length} baris gagal dari ${items.length} baris.`,
    });

    return ok({ total: items.length, created, failed });
  });

  router.patch("/api/locations/:id", async (ctx: Ctx, params) => {
    const actor = requirePermission(ctx, "locations.manage");
    const existing = await ctx.env.DB.prepare(
      `SELECT id, nama_kota, nama_titik, provinsi FROM locations WHERE id = ?`,
    )
      .bind(params.id)
      .first<{ id: string; nama_kota: string; nama_titik: string | null; provinsi: string }>();
    if (!existing) throw Errors.notFound("Lokasi tidak ditemukan.");

    const body = await parseJsonBody(ctx.request);
    const has = (k: string) => Object.prototype.hasOwnProperty.call(body, k);

    const sets: string[] = [];
    const values: unknown[] = [];
    let kota = existing.nama_kota;
    let prov = existing.provinsi ?? "";
    let titik = existing.nama_titik;

    if (has("namaKota")) {
      const v = clean(body.namaKota);
      if (!v) throw Errors.badRequest("Kota / Kabupaten wajib diisi.");
      if (v.length > 80) throw Errors.badRequest("Kota / Kabupaten maksimal 80 karakter.");
      kota = v; sets.push("nama_kota = ?"); values.push(v);
    }
    if (has("provinsi")) {
      const v = clean(body.provinsi);
      if (v.length > 80) throw Errors.badRequest("Provinsi maksimal 80 karakter.");
      prov = v; sets.push("provinsi = ?"); values.push(v);
    }
    if (has("namaTitik")) {
      const v = clean(body.namaTitik);
      if (v.length > 120) throw Errors.badRequest("Nama Titik Transit maksimal 120 karakter.");
      // Legacy rows may still have no titik name; it can be left empty only
      // while it already is empty.
      if (!v && existing.nama_titik) throw Errors.badRequest("Nama Titik Transit wajib diisi.");
      titik = v || null; sets.push("nama_titik = ?"); values.push(v || null);
    }
    if (has("kodeKota")) {
      const v = clean(body.kodeKota).toUpperCase();
      if (v.length > 10) throw Errors.badRequest("Kode maksimal 10 karakter.");
      sets.push("kode_kota = ?"); values.push(v);
    }
    if (has("jenis") && clean(body.jenis)) {
      const match = JENIS.find((j) => j.toLowerCase() === clean(body.jenis).toLowerCase());
      if (!match) throw Errors.badRequest(`Jenis tidak valid (pilih: ${JENIS.join(", ")}).`);
      sets.push("jenis = ?"); values.push(match);
    }
    const aktif = optBool(body, "aktif");
    if (aktif !== undefined) { sets.push("aktif = ?"); values.push(aktif ? 1 : 0); }
    if (sets.length === 0) throw Errors.badRequest("Tidak ada perubahan yang dikirim.");

    if (titik && (has("namaKota") || has("provinsi") || has("namaTitik"))) {
      const dupe = await ctx.env.DB.prepare(
        `SELECT id FROM locations WHERE nama_kota = ? COLLATE NOCASE AND provinsi = ? COLLATE NOCASE AND nama_titik = ? COLLATE NOCASE AND id != ?`,
      )
        .bind(kota, prov, titik, params.id)
        .first();
      if (dupe) throw Errors.conflict(`Data "${kota} / ${prov || "-"} / ${titik}" sudah ada.`);
    }

    sets.push("updated_at = ?", "updated_by = ?");
    values.push(new Date().toISOString(), actor.id, params.id);
    try {
      await ctx.env.DB.prepare(`UPDATE locations SET ${sets.join(", ")} WHERE id = ?`).bind(...values).run();
    } catch (err) {
      if (isUniqueViolation(err)) throw Errors.conflict("Data dengan Kota / Kabupaten, Provinsi, dan Nama Titik Transit yang sama sudah ada.");
      throw err;
    }

    await writeAuditLog(ctx.env, actor, {
      action: "UPDATE_LOCATION",
      actionLabel: "UPDATE LOCATION",
      module: "Master Kota",
      description: `Titik lokasi (${params.id}) diperbarui.`,
    });

    return ok({ updated: true });
  });

  router.delete("/api/locations/:id", async (ctx: Ctx, params) => {
    const actor = requirePermission(ctx, "locations.manage");
    const existing = await ctx.env.DB.prepare(`SELECT id, nama_kota FROM locations WHERE id = ?`)
      .bind(params.id)
      .first<{ id: string; nama_kota: string }>();
    if (!existing) throw Errors.notFound("Lokasi tidak ditemukan.");

    // Tracking history points at locations by id. Refuse (instead of letting the
    // foreign key blow up) when a titik is referenced; deactivating it keeps
    // the history intact.
    const used = await ctx.env.DB.prepare(`SELECT COUNT(*) AS c FROM shipment_timeline_events WHERE titik_id = ?`)
      .bind(params.id)
      .first<{ c: number }>();
    if ((used?.c ?? 0) > 0) {
      throw Errors.conflict(
        `Titik "${existing.nama_kota}" dipakai oleh ${used!.c} riwayat tracking sehingga tidak bisa dihapus. Nonaktifkan saja.`,
      );
    }

    await ctx.env.DB.prepare(`DELETE FROM locations WHERE id = ?`).bind(params.id).run();

    await writeAuditLog(ctx.env, actor, {
      action: "DELETE_LOCATION",
      actionLabel: "DELETE LOCATION",
      module: "Master Kota",
      description: `Titik lokasi "${existing.nama_kota}" (${params.id}) dihapus.`,
    });

    return ok({ deleted: true });
  });
}
