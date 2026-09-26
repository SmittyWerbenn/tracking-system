import type { Router } from "../router";
import type { Ctx } from "../types";
import { ok, Errors } from "../http";
import { parseJsonBody, reqString, reqEmail, reqEnum, optString, optBool } from "../validate";
import { hashPassword, newId } from "../crypto";
import { requirePermission } from "../authMiddleware";
import { writeAuditLog } from "../audit";
import { parsePagination, pageMeta } from "../pagination";

const ROLES = ["Admin", "Driver", "Viewer"] as const;

export function registerUserRoutes(router: Router) {
  // Driver master data (drivers table, keyed by truck assignment) is
  // separate from login accounts - this lists it so Manajemen User can
  // link a Driver-role account to the shipments it should see.
  router.get("/api/drivers", async (ctx: Ctx) => {
    requirePermission(ctx, "users.manage");
    const rows = await ctx.env.DB.prepare(
      `SELECT d.id, d.nama, d.telepon, d.user_id, u.nama as linked_user_nama, t.nomor_unit
       FROM drivers d
       LEFT JOIN users u ON u.id = d.user_id
       LEFT JOIN trucks t ON t.driver_id = d.id
       ORDER BY d.nama`,
    ).all();
    return ok({ items: rows.results });
  });

  router.get("/api/users", async (ctx: Ctx) => {
    requirePermission(ctx, "users.manage");
    const url = new URL(ctx.request.url);
    const { page, limit, offset } = parsePagination(url);

    const total = await ctx.env.DB.prepare(`SELECT COUNT(*) as c FROM users`).first<{ c: number }>();
    const rows = await ctx.env.DB.prepare(
      `SELECT id, nama, email, role, aktif, foto_file_id, last_login_at, created_at
       FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    )
      .bind(limit, offset)
      .all();

    return ok({ items: rows.results, meta: pageMeta(page, limit, total?.c ?? 0) });
  });

  router.post("/api/users", async (ctx: Ctx) => {
    const actor = requirePermission(ctx, "users.manage");
    const body = await parseJsonBody(ctx.request);
    const nama = reqString(body, "nama", { max: 100 });
    const email = reqEmail(body, "email");
    const role = reqEnum(body, "role", ROLES);
    const password = reqString(body, "password", { min: 8 });
    const fotoFileId = optString(body, "fotoFileId");
    const driverId = optString(body, "driverId");

    if (driverId && role !== "Driver") {
      throw Errors.badRequest("driverId hanya berlaku untuk role Driver.");
    }
    if (driverId) {
      const driver = await ctx.env.DB.prepare(`SELECT id, user_id FROM drivers WHERE id = ?`)
        .bind(driverId)
        .first<{ id: string; user_id: string | null }>();
      if (!driver) throw Errors.badRequest("Data driver tidak ditemukan.");
      if (driver.user_id) throw Errors.conflict("Data driver ini sudah ditautkan ke akun lain.");
    }

    const existing = await ctx.env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(email).first();
    if (existing) throw Errors.conflict("Email sudah terdaftar.");

    const id = newId();
    const now = new Date().toISOString();
    const passwordHash = await hashPassword(password);

    await ctx.env.DB.prepare(
      `INSERT INTO users (id, nama, email, password_hash, role, aktif, foto_file_id, created_at, updated_at, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)`,
    )
      .bind(id, nama, email, passwordHash, role, fotoFileId ?? null, now, now, actor.id, actor.id)
      .run();

    if (driverId) {
      await ctx.env.DB.prepare(`UPDATE drivers SET user_id = ?, updated_at = ? WHERE id = ? AND user_id IS NULL`)
        .bind(id, now, driverId)
        .run();
    }

    await writeAuditLog(ctx.env, actor, {
      action: "CREATE_USER",
      actionLabel: "CREATE USER",
      module: "User",
      description: `User "${nama}" (${role}) ditambahkan.`,
    });

    return ok({ id, nama, email, role, aktif: 1 }, {}, 201);
  });

  router.patch("/api/users/:id", async (ctx: Ctx, params) => {
    const actor = requirePermission(ctx, "users.manage");
    const target = await ctx.env.DB.prepare(`SELECT id, role FROM users WHERE id = ?`).bind(params.id).first<{
      id: string;
      role: string;
    }>();
    if (!target) throw Errors.notFound("User tidak ditemukan.");
    if (target.role === "Superadmin") {
      throw Errors.forbidden("Role atau data Superadmin tidak bisa diubah lewat Manajemen User.");
    }

    const body = await parseJsonBody(ctx.request);
    const nama = optString(body, "nama");
    const email = body.email !== undefined ? reqEmail(body, "email") : undefined;
    const role = body.role !== undefined ? reqEnum(body, "role", ROLES) : undefined;
    const password = optString(body, "password");
    const aktif = optBool(body, "aktif");
    const fotoFileId = optString(body, "fotoFileId");
    const driverIdProvided = Object.prototype.hasOwnProperty.call(body, "driverId");
    const driverId = driverIdProvided ? optString(body, "driverId") ?? null : undefined;
    const effectiveRole = role ?? target.role;

    if (driverId && effectiveRole !== "Driver") {
      throw Errors.badRequest("driverId hanya berlaku untuk role Driver.");
    }
    if (driverId) {
      const driver = await ctx.env.DB.prepare(`SELECT id, user_id FROM drivers WHERE id = ?`)
        .bind(driverId)
        .first<{ id: string; user_id: string | null }>();
      if (!driver) throw Errors.badRequest("Data driver tidak ditemukan.");
      if (driver.user_id && driver.user_id !== params.id) {
        throw Errors.conflict("Data driver ini sudah ditautkan ke akun lain.");
      }
    }

    if (email) {
      const dupe = await ctx.env.DB.prepare(`SELECT id FROM users WHERE email = ? AND id != ?`)
        .bind(email, params.id)
        .first();
      if (dupe) throw Errors.conflict("Email sudah dipakai user lain.");
    }

    const sets: string[] = [];
    const values: unknown[] = [];
    if (nama) { sets.push("nama = ?"); values.push(nama); }
    if (email) { sets.push("email = ?"); values.push(email); }
    if (role) { sets.push("role = ?"); values.push(role); }
    if (aktif !== undefined) { sets.push("aktif = ?"); values.push(aktif ? 1 : 0); }
    if (fotoFileId) { sets.push("foto_file_id = ?"); values.push(fotoFileId); }
    if (password) { sets.push("password_hash = ?"); values.push(await hashPassword(password)); }

    if (sets.length === 0 && !driverIdProvided) throw Errors.badRequest("Tidak ada perubahan yang dikirim.");

    const now = new Date().toISOString();
    if (sets.length > 0) {
      sets.push("updated_at = ?", "updated_by = ?");
      values.push(now, actor.id, params.id);
      await ctx.env.DB.prepare(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`).bind(...values).run();
    }

    if (password) {
      await ctx.env.DB.prepare(`UPDATE sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL`)
        .bind(new Date().toISOString(), params.id)
        .run();
    }

    // Sync drivers.user_id: unlink whatever this account currently holds,
    // then link the requested one (if any) - keeps a driver login always
    // pointing at exactly one drivers-table record.
    if (driverIdProvided || (role && role !== "Driver")) {
      await ctx.env.DB.prepare(`UPDATE drivers SET user_id = NULL, updated_at = ? WHERE user_id = ?`)
        .bind(now, params.id)
        .run();
    }
    if (driverId) {
      await ctx.env.DB.prepare(`UPDATE drivers SET user_id = ?, updated_at = ? WHERE id = ? AND user_id IS NULL`)
        .bind(params.id, now, driverId)
        .run();
    }

    await writeAuditLog(ctx.env, actor, {
      action: aktif !== undefined ? "UPDATE_USER" : "UPDATE_USER",
      actionLabel: aktif === false ? "DEACTIVATE USER" : aktif === true ? "ACTIVATE USER" : "UPDATE USER",
      module: "User",
      description: `Data user (${params.id}) diperbarui oleh ${actor.nama}.`,
    });

    return ok({ updated: true });
  });
}
