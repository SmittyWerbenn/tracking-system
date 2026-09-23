import type { Router } from "../router";
import type { Ctx } from "../types";
import { ok, Errors } from "../http";
import { parseJsonBody, reqString, reqEnum, optString, optBool } from "../validate";
import { newId } from "../crypto";
import { requirePermission } from "../authMiddleware";
import { writeAuditLog } from "../audit";

const JENIS = ["Gudang", "Hub", "Transit", "Cabang", "Tujuan"] as const;

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
    const namaKota = reqString(body, "namaKota", { max: 80 });
    const kodeKota = reqString(body, "kodeKota", { max: 10 });
    const provinsi = reqString(body, "provinsi", { max: 80 });
    const jenis = reqEnum(body, "jenis", JENIS);

    const id = newId();
    const now = new Date().toISOString();
    await ctx.env.DB.prepare(
      `INSERT INTO locations (id, nama_kota, kode_kota, provinsi, jenis, aktif, created_at, updated_at, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?)`,
    )
      .bind(id, namaKota, kodeKota, provinsi, jenis, now, now, actor.id, actor.id)
      .run();

    await writeAuditLog(ctx.env, actor, {
      action: "CREATE_LOCATION",
      actionLabel: "CREATE LOCATION",
      module: "Master Kota",
      description: `Titik lokasi "${namaKota}" (${jenis}) ditambahkan.`,
    });

    return ok({ id }, {}, 201);
  });

  router.patch("/api/locations/:id", async (ctx: Ctx, params) => {
    const actor = requirePermission(ctx, "locations.manage");
    const existing = await ctx.env.DB.prepare(`SELECT id FROM locations WHERE id = ?`).bind(params.id).first();
    if (!existing) throw Errors.notFound("Lokasi tidak ditemukan.");

    const body = await parseJsonBody(ctx.request);
    const namaKota = optString(body, "namaKota");
    const kodeKota = optString(body, "kodeKota");
    const provinsi = optString(body, "provinsi");
    const jenis = body.jenis !== undefined ? reqEnum(body, "jenis", JENIS) : undefined;
    const aktif = optBool(body, "aktif");

    const sets: string[] = [];
    const values: unknown[] = [];
    if (namaKota) { sets.push("nama_kota = ?"); values.push(namaKota); }
    if (kodeKota) { sets.push("kode_kota = ?"); values.push(kodeKota); }
    if (provinsi) { sets.push("provinsi = ?"); values.push(provinsi); }
    if (jenis) { sets.push("jenis = ?"); values.push(jenis); }
    if (aktif !== undefined) { sets.push("aktif = ?"); values.push(aktif ? 1 : 0); }
    if (sets.length === 0) throw Errors.badRequest("Tidak ada perubahan yang dikirim.");

    sets.push("updated_at = ?", "updated_by = ?");
    values.push(new Date().toISOString(), actor.id, params.id);
    await ctx.env.DB.prepare(`UPDATE locations SET ${sets.join(", ")} WHERE id = ?`).bind(...values).run();

    await writeAuditLog(ctx.env, actor, {
      action: "UPDATE_LOCATION",
      actionLabel: "UPDATE LOCATION",
      module: "Master Kota",
      description: `Titik lokasi (${params.id}) diperbarui.`,
    });

    return ok({ updated: true });
  });
}
