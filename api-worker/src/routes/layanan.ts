import type { Router } from "../router";
import type { Ctx } from "../types";
import { ok, Errors } from "../http";
import { parseJsonBody, reqString, optBool } from "../validate";
import { newId } from "../crypto";
import { requireAuth, requirePermission } from "../authMiddleware";
import { hasPermission } from "../rbac";
import { writeAuditLog } from "../audit";
import { FALLBACK_LAYANAN, STANDARD_LAYANAN, canonicalLayananName, isFallbackLayanan } from "../layanan";

const FALLBACK_PROTECTED =
  `${FALLBACK_LAYANAN} adalah layanan fallback order dan tidak bisa dinonaktifkan, dihapus, atau diganti namanya.`;

const DESKRIPSI_MAX = 300;

/** Optional description: trimmed, empty -> null, capped at DESKRIPSI_MAX. */
function readDeskripsi(body: Record<string, unknown>): string | null {
  const raw = body.deskripsi;
  if (raw === undefined || raw === null) return null;
  if (typeof raw !== "string") throw Errors.badRequest("Deskripsi harus berupa teks.");
  const v = raw.trim();
  if (v.length > DESKRIPSI_MAX) throw Errors.badRequest(`Deskripsi maksimal ${DESKRIPSI_MAX} karakter.`);
  return v || null;
}

/** Master Layanan (shipment services) CRUD - Superadmin/Admin only, same
 * gate as Master Mitra / Clients. GET is readable by every signed-in role
 * (order forms, incl. the Client portal, need the dropdown list) but
 * non-managers only ever receive ACTIVE entries. */
export function registerLayananRoutes(router: Router) {
  router.get("/api/layanan", async (ctx: Ctx) => {
    const actor = requireAuth(ctx);
    const canManage = hasPermission(actor.role, "users.manage");
    const onlyActive = !canManage || new URL(ctx.request.url).searchParams.get("active") === "true";

    const rows = await ctx.env.DB.prepare(
      `SELECT l.id, l.nama, l.deskripsi, l.aktif, l.created_at,
              (SELECT COUNT(*) FROM shipments s WHERE s.layanan = l.nama COLLATE NOCASE) AS jumlah_order
       FROM layanans l ${onlyActive ? "WHERE l.aktif = 1" : ""}
       ORDER BY l.nama`,
    ).all<{ id: string; nama: string; deskripsi: string | null; aktif: number; created_at: string; jumlah_order: number }>();
    const items = (rows.results ?? []).map((r) => ({
      id: r.id,
      nama: r.nama,
      deskripsi: r.deskripsi ?? null,
      aktif: r.aktif === 1,
      jumlahOrder: r.jumlah_order,
      fallback: isFallbackLayanan(r.nama),
      createdAt: r.created_at,
    }));

    return ok({
      items,
      standard: STANDARD_LAYANAN,
      // Lets the admin UI warn when order fallback can't work.
      fallback: {
        nama: FALLBACK_LAYANAN,
        ready: items.some((i) => i.fallback && i.aktif),
      },
    });
  });

  router.post("/api/layanan", async (ctx: Ctx) => {
    const actor = requirePermission(ctx, "users.manage");
    const body = await parseJsonBody(ctx.request);
    const nama = canonicalLayananName(reqString(body, "nama", { max: 50 }));
    if (!nama) throw Errors.badRequest("Nama layanan wajib diisi.");
    const deskripsi = readDeskripsi(body);

    const dupe = await ctx.env.DB.prepare(`SELECT nama FROM layanans WHERE nama = ?`).bind(nama).first<{ nama: string }>();
    if (dupe) throw Errors.conflict(`Layanan "${dupe.nama}" sudah ada di Master Layanan.`);

    const id = newId();
    const now = new Date().toISOString();
    await ctx.env.DB.prepare(
      `INSERT INTO layanans (id, nama, deskripsi, aktif, created_at, created_by, updated_at, updated_by) VALUES (?, ?, ?, 1, ?, ?, ?, ?)`,
    )
      .bind(id, nama, deskripsi, now, actor.id, now, actor.id)
      .run();

    await writeAuditLog(ctx.env, actor, {
      action: "CREATE_LAYANAN",
      actionLabel: "CREATE LAYANAN",
      module: "Layanan",
      description: `Layanan "${nama}" ditambahkan.`,
    });

    return ok({ id, nama, deskripsi, aktif: true }, {}, 201);
  });

  router.patch("/api/layanan/:id", async (ctx: Ctx, params) => {
    const actor = requirePermission(ctx, "users.manage");
    const layanan = await ctx.env.DB.prepare(`SELECT id, nama, aktif, deskripsi FROM layanans WHERE id = ?`)
      .bind(params.id)
      .first<{ id: string; nama: string; aktif: number; deskripsi: string | null }>();
    if (!layanan) throw Errors.notFound("Layanan tidak ditemukan.");

    const body = await parseJsonBody(ctx.request);
    const protectedFallback = isFallbackLayanan(layanan.nama);
    const now = new Date().toISOString();
    const statements: D1PreparedStatement[] = [];
    const sets: string[] = [];
    const values: unknown[] = [];
    let newName: string | null = null;

    if (body.nama !== undefined) {
      const nama = canonicalLayananName(reqString(body, "nama", { max: 50 }));
      if (!nama) throw Errors.badRequest("Nama layanan wajib diisi.");
      if (nama !== layanan.nama) {
        if (protectedFallback) throw Errors.conflict(FALLBACK_PROTECTED);
        const dupe = await ctx.env.DB.prepare(`SELECT 1 FROM layanans WHERE nama = ? AND id != ?`)
          .bind(nama, layanan.id)
          .first();
        if (dupe) throw Errors.conflict(`Layanan "${nama}" sudah ada di Master Layanan.`);
        newName = nama;
        sets.push("nama = ?");
        values.push(nama);
      }
    }

    // Description is editable for every layanan, including the protected LTL
    // (only its name/status are locked).
    let deskripsiChanged = false;
    if (Object.prototype.hasOwnProperty.call(body, "deskripsi")) {
      const deskripsi = readDeskripsi(body);
      if (deskripsi !== (layanan.deskripsi ?? null)) {
        deskripsiChanged = true;
        sets.push("deskripsi = ?");
        values.push(deskripsi);
      }
    }

    const aktif = optBool(body, "aktif");
    if (aktif !== undefined && (aktif ? 1 : 0) !== layanan.aktif) {
      if (!aktif && protectedFallback) throw Errors.conflict(FALLBACK_PROTECTED);
      sets.push("aktif = ?");
      values.push(aktif ? 1 : 0);
    }
    if (sets.length === 0) {
      if (body.nama === undefined && aktif === undefined && !Object.prototype.hasOwnProperty.call(body, "deskripsi")) {
        throw Errors.badRequest("Tidak ada perubahan yang dikirim.");
      }
      return ok({ updated: false });
    }

    sets.push("updated_at = ?", "updated_by = ?");
    values.push(now, actor.id, layanan.id);
    statements.push(ctx.env.DB.prepare(`UPDATE layanans SET ${sets.join(", ")} WHERE id = ?`).bind(...values));
    // Orders store the layanan by name, so a rename carries existing orders
    // along in the same atomic batch - no order is left pointing at a name
    // that no longer exists.
    if (newName) {
      statements.push(ctx.env.DB.prepare(`UPDATE shipments SET layanan = ? WHERE layanan = ? COLLATE NOCASE`).bind(newName, layanan.nama));
    }
    await ctx.env.DB.batch(statements);

    const toggled = aktif !== undefined && (aktif ? 1 : 0) !== layanan.aktif;
    await writeAuditLog(ctx.env, actor, {
      action: toggled && !newName ? (aktif ? "ACTIVATE_LAYANAN" : "DEACTIVATE_LAYANAN") : "UPDATE_LAYANAN",
      actionLabel: toggled && !newName ? (aktif ? "ACTIVATE LAYANAN" : "DEACTIVATE LAYANAN") : "UPDATE LAYANAN",
      module: "Layanan",
      description: newName
        ? `Layanan "${layanan.nama}" diganti namanya menjadi "${newName}".`
        : toggled
          ? `Layanan "${layanan.nama}" ${aktif ? "diaktifkan" : "dinonaktifkan"}.`
          : deskripsiChanged
            ? `Deskripsi layanan "${layanan.nama}" diperbarui.`
            : `Layanan "${layanan.nama}" diperbarui.`,
    });

    return ok({ updated: true });
  });

  router.delete("/api/layanan/:id", async (ctx: Ctx, params) => {
    const actor = requirePermission(ctx, "users.manage");
    const layanan = await ctx.env.DB.prepare(`SELECT id, nama FROM layanans WHERE id = ?`)
      .bind(params.id)
      .first<{ id: string; nama: string }>();
    if (!layanan) throw Errors.notFound("Layanan tidak ditemukan.");
    if (isFallbackLayanan(layanan.nama)) throw Errors.conflict(FALLBACK_PROTECTED);

    const used = await ctx.env.DB.prepare(`SELECT COUNT(*) AS c FROM shipments WHERE layanan = ? COLLATE NOCASE`)
      .bind(layanan.nama)
      .first<{ c: number }>();
    if ((used?.c ?? 0) > 0) {
      throw Errors.conflict(
        `Layanan "${layanan.nama}" sudah dipakai ${used!.c} order sehingga tidak bisa dihapus. Nonaktifkan saja agar tidak muncul untuk order baru.`,
      );
    }

    await ctx.env.DB.prepare(`DELETE FROM layanans WHERE id = ?`).bind(layanan.id).run();
    await writeAuditLog(ctx.env, actor, {
      action: "DELETE_LAYANAN",
      actionLabel: "DELETE LAYANAN",
      module: "Layanan",
      description: `Layanan "${layanan.nama}" dihapus.`,
    });

    return ok({ deleted: true });
  });
}
