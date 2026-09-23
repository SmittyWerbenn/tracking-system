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

    if (sets.length === 0) throw Errors.badRequest("Tidak ada perubahan yang dikirim.");

    sets.push("updated_at = ?", "updated_by = ?");
    values.push(new Date().toISOString(), actor.id, params.id);

    await ctx.env.DB.prepare(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`).bind(...values).run();

    if (password) {
      await ctx.env.DB.prepare(`UPDATE sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL`)
        .bind(new Date().toISOString(), params.id)
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
