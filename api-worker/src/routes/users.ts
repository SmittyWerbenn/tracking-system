import type { Router } from "../router";
import type { Ctx } from "../types";
import { ok, Errors } from "../http";
import { parseJsonBody, reqString, reqEmail, reqEnum, optString, optBool } from "../validate";
import { hashPassword, newId } from "../crypto";
import { requireAuth, requirePermission } from "../authMiddleware";
import { writeAuditLog } from "../audit";
import { parsePagination, pageMeta } from "../pagination";

const ROLES = ["Admin", "Driver", "Viewer", "Client", "Mitra"] as const;

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

  // Minimal, low-privilege lookup (name + email of active Admin accounts
  // only - Superadmin deliberately excluded) - any authenticated role may
  // call this, unlike GET /api/users, so a Driver session can find out who
  // to notify without needing users.manage. Used for the "package
  // selesai/terkirim" email.
  router.get("/api/admin-emails", async (ctx: Ctx) => {
    requireAuth(ctx);
    const rows = await ctx.env.DB.prepare(`SELECT nama, email FROM users WHERE role = 'Admin' AND aktif = 1`).all();
    return ok({ items: rows.results });
  });

  router.get("/api/users", async (ctx: Ctx) => {
    requirePermission(ctx, "users.manage");
    const url = new URL(ctx.request.url);
    const { page, limit, offset } = parsePagination(url);

    const total = await ctx.env.DB.prepare(`SELECT COUNT(*) as c FROM users`).first<{ c: number }>();
    const rows = await ctx.env.DB.prepare(
      `SELECT id, nama, email, role, aktif, foto_file_id, last_login_at, created_at, customer_id, mitra_id
       FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    )
      .bind(limit, offset)
      .all();

    return ok({ items: rows.results, meta: pageMeta(page, limit, total?.c ?? 0) });
  });

  // Client IDs for dropdowns (Tambah User, Buat Pengiriman). Comes from the
  // clients master table; ids that only exist on old users/shipments are
  // included too so a dropdown never hides a Client ID that is in use.
  // Deactivated Clients are left out - nothing new should be tied to them.
  router.get("/api/customer-ids", async (ctx: Ctx) => {
    requireAuth(ctx);
    const rows = await ctx.env.DB.prepare(
      `SELECT ids.customer_id, c.nama, c.kota FROM (
         SELECT customer_id FROM clients
         UNION SELECT customer_id FROM users WHERE customer_id IS NOT NULL
         UNION SELECT customer_id FROM shipments WHERE customer_id IS NOT NULL
       ) ids LEFT JOIN clients c ON c.customer_id = ids.customer_id
       WHERE COALESCE(c.aktif, 1) = 1
       ORDER BY ids.customer_id`,
    ).all<{ customer_id: string; nama: string | null; kota: string | null }>();
    const list = rows.results ?? [];
    return ok({
      items: list.map((r) => r.customer_id),
      clients: list.map((r) => ({ customerId: r.customer_id, nama: r.nama, kota: r.kota })),
    });
  });

  // "Kontrak Kerja Sama / No. Pelanggan" is Superadmin-only. Any attempt to
  // set it by another role is refused here (server-side), so hiding the input
  // in the UI is not what protects it.
  function readKontrak(actor: { role: string }, body: Record<string, unknown>): { provided: boolean; value: string | null } {
    const provided = Object.prototype.hasOwnProperty.call(body, "kontrakNoPelanggan");
    if (!provided) return { provided: false, value: null };
    const raw = (optString(body, "kontrakNoPelanggan") ?? "").trim().slice(0, 100);
    if (actor.role !== "Superadmin") {
      throw Errors.forbidden("Hanya Superadmin yang dapat mengubah Kontrak Kerja Sama / No. Pelanggan.");
    }
    return { provided: true, value: raw || null };
  }

  // Master Data Clients: every Client ID with its name, the accounts linked
  // to it and its shipment count. Superadmin/Admin only.
  router.get("/api/customers", async (ctx: Ctx) => {
    requirePermission(ctx, "users.manage");
    const [clients, accounts, shipmentCounts] = await Promise.all([
      ctx.env.DB.prepare(`SELECT customer_id, nama, kota, kontrak_no_pelanggan, aktif, created_at FROM clients`).all<{ customer_id: string; nama: string; kota: string | null; kontrak_no_pelanggan: string | null; aktif: number; created_at: string }>(),
      ctx.env.DB.prepare(
        `SELECT id, nama, email, aktif, created_at, customer_id, role
         FROM users WHERE customer_id IS NOT NULL ORDER BY created_at ASC`,
      ).all<{ id: string; nama: string; email: string; aktif: number; created_at: string; customer_id: string; role: string }>(),
      ctx.env.DB.prepare(
        `SELECT customer_id, COUNT(*) as c FROM shipments WHERE customer_id IS NOT NULL GROUP BY customer_id`,
      ).all<{ customer_id: string; c: number }>(),
    ]);

    const key = (id: string) => id.toLowerCase();
    const shipmentCountByClient = new Map<string, number>();
    for (const row of shipmentCounts.results ?? []) shipmentCountByClient.set(key(row.customer_id), row.c);

    type Row = {
      customerId: string; nama: string | null; kota: string | null; kontrakNoPelanggan: string | null; aktif: boolean; createdAt: string | null; shipmentCount: number;
      accounts: { id: string; nama: string; email: string; aktif: boolean; role: string; createdAt: string }[];
    };
    const byClient = new Map<string, Row>();
    const ensure = (id: string, nama: string | null, kota: string | null, kontrakNoPelanggan: string | null, createdAt: string | null, aktif = true) => {
      if (!byClient.has(key(id))) {
        byClient.set(key(id), { customerId: id, nama, kota, kontrakNoPelanggan, aktif, createdAt, shipmentCount: shipmentCountByClient.get(key(id)) ?? 0, accounts: [] });
      }
      return byClient.get(key(id))!;
    };
    for (const r of clients.results ?? []) ensure(r.customer_id, r.nama, r.kota, r.kontrak_no_pelanggan, r.created_at, r.aktif === 1);
    for (const a of accounts.results ?? []) {
      ensure(a.customer_id, null, null, null, null).accounts.push({
        id: a.id, nama: a.nama, email: a.email, aktif: a.aktif === 1, role: a.role, createdAt: a.created_at,
      });
    }
    for (const id of shipmentCountByClient.keys()) {
      if (!byClient.has(id)) {
        const orig = (shipmentCounts.results ?? []).find((r) => key(r.customer_id) === id)!.customer_id;
        ensure(orig, null, null, null, null);
      }
    }

    return ok({ items: Array.from(byClient.values()).sort((a, b) => a.customerId.localeCompare(b.customerId)) });
  });

  // Add a Client. The Client ID is what later gets picked in Tambah User.
  router.post("/api/customers", async (ctx: Ctx) => {
    const actor = requirePermission(ctx, "users.manage");
    const body = await parseJsonBody(ctx.request);
    const customerId = reqString(body, "customerId", { max: 50 }).trim().toUpperCase();
    const nama = reqString(body, "nama", { max: 100 }).trim();
    if (!/^[A-Z0-9][A-Z0-9._-]*$/.test(customerId)) {
      throw Errors.badRequest("Client ID hanya boleh berisi huruf, angka, titik, minus, dan garis bawah (tanpa spasi).");
    }
    if (!nama) throw Errors.badRequest("Nama Client wajib diisi.");
    const kota = (optString(body, "kota") ?? "").trim().slice(0, 100) || null;
    const kontrak = readKontrak(actor, body);

    // Also reject an ID already used by old users/shipments that never got
    // a clients row, so the same Client can't be created twice.
    const exists = await ctx.env.DB.prepare(
      `SELECT 1 FROM clients WHERE customer_id = ?
       UNION SELECT 1 FROM users WHERE customer_id = ? COLLATE NOCASE
       UNION SELECT 1 FROM shipments WHERE customer_id = ? COLLATE NOCASE LIMIT 1`,
    ).bind(customerId, customerId, customerId).first();
    if (exists) throw Errors.conflict(`Client ID "${customerId}" sudah terdaftar.`);

    await ctx.env.DB.prepare(`INSERT INTO clients (customer_id, nama, kota, kontrak_no_pelanggan, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(customerId, nama, kota, kontrak.value, new Date().toISOString(), actor.id)
      .run();

    await writeAuditLog(ctx.env, actor, {
      action: "CREATE_CLIENT",
      actionLabel: "CREATE CLIENT",
      module: "Client",
      description: `Client "${nama}" (${customerId})${kota ? ` di ${kota}` : ""} ditambahkan${kontrak.value ? ` · Kontrak/No. Pelanggan: ${kontrak.value}` : ""}.`,
    });

    return ok({ customerId, nama, kota, kontrakNoPelanggan: kontrak.value }, {}, 201);
  });

  // Edit a Client (name / city) and/or switch it on/off. The Client ID itself
  // is never changed. Deactivating freezes every linked account: login is
  // refused and live sessions stop working (see authMiddleware/auth).
  router.patch("/api/customers/:id", async (ctx: Ctx, params) => {
    const actor = requirePermission(ctx, "users.manage");
    const body = await parseJsonBody(ctx.request);
    const client = await ctx.env.DB.prepare(`SELECT customer_id, nama, kota, kontrak_no_pelanggan, aktif FROM clients WHERE customer_id = ?`)
      .bind(params.id)
      .first<{ customer_id: string; nama: string; kota: string | null; kontrak_no_pelanggan: string | null; aktif: number }>();
    if (!client) throw Errors.notFound("Client tidak ditemukan.");

    const sets: string[] = [];
    const values: unknown[] = [];
    let nama: string | undefined;
    if (body.nama !== undefined) {
      nama = reqString(body, "nama", { max: 100 }).trim();
      if (!nama) throw Errors.badRequest("Nama Client wajib diisi.");
      sets.push("nama = ?"); values.push(nama);
    }
    let kota: string | null | undefined;
    if (Object.prototype.hasOwnProperty.call(body, "kota")) {
      kota = (optString(body, "kota") ?? "").trim().slice(0, 100) || null;
      sets.push("kota = ?"); values.push(kota);
    }
    const kontrak = readKontrak(actor, body);
    if (kontrak.provided) { sets.push("kontrak_no_pelanggan = ?"); values.push(kontrak.value); }
    const aktif = optBool(body, "aktif");
    if (aktif !== undefined) { sets.push("aktif = ?"); values.push(aktif ? 1 : 0); }
    if (sets.length === 0) throw Errors.badRequest("Tidak ada perubahan yang dikirim.");

    await ctx.env.DB.prepare(`UPDATE clients SET ${sets.join(", ")} WHERE customer_id = ?`)
      .bind(...values, client.customer_id)
      .run();

    // Kill live sessions of a just-deactivated Client so nobody stays logged in.
    if (aktif === false && client.aktif === 1) {
      await ctx.env.DB.prepare(
        `UPDATE sessions SET revoked_at = ? WHERE revoked_at IS NULL
         AND user_id IN (SELECT id FROM users WHERE customer_id = ?)`,
      ).bind(new Date().toISOString(), client.customer_id).run();
    }

    // The contract number is sensitive enough to deserve its own audit entry
    // that spells out the previous and the new value.
    if (kontrak.provided && kontrak.value !== client.kontrak_no_pelanggan) {
      await writeAuditLog(ctx.env, actor, {
        action: "UPDATE_CLIENT_KONTRAK",
        actionLabel: "UPDATE CLIENT KONTRAK",
        module: "Client",
        description: `Kontrak Kerja Sama / No. Pelanggan Client ${client.customer_id} diubah dari "${client.kontrak_no_pelanggan ?? "-"}" menjadi "${kontrak.value ?? "-"}".`,
      });
    }

    const toggled = aktif !== undefined && (aktif ? 1 : 0) !== client.aktif;
    // When the only change was the contract number, the entry above already
    // describes it - no need for a second, vaguer "data diperbarui" line.
    const onlyKontrak = kontrak.provided && sets.length === 1;
    if (!onlyKontrak) {
      await writeAuditLog(ctx.env, actor, {
        action: toggled ? (aktif ? "ACTIVATE_CLIENT" : "DEACTIVATE_CLIENT") : "UPDATE_CLIENT",
        actionLabel: toggled ? (aktif ? "ACTIVATE CLIENT" : "DEACTIVATE CLIENT") : "UPDATE CLIENT",
        module: "Client",
        description: toggled
          ? `Client ${client.customer_id} ${aktif ? "diaktifkan" : "dinonaktifkan"}.`
          : `Data Client ${client.customer_id} diperbarui.`,
      });
    }

    return ok({
      customerId: client.customer_id,
      nama: nama ?? client.nama,
      kota: kota === undefined ? client.kota : kota,
      kontrakNoPelanggan: kontrak.provided ? kontrak.value : client.kontrak_no_pelanggan,
      aktif: aktif === undefined ? client.aktif === 1 : aktif,
    });
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
    let customerId = optString(body, "customerId");
    let mitraId = optString(body, "mitraId");

    if (actor.role === "Admin" && role === "Admin") {
      throw Errors.forbidden("Admin tidak dapat menambah akun dengan role Admin. Hubungi Superadmin.");
    }

    if ((role === "Client" || role === "Viewer") && !customerId) {
      throw Errors.badRequest(`Client ID wajib diisi untuk role ${role}.`);
    }
    if (customerId && role !== "Client" && role !== "Viewer") {
      throw Errors.badRequest("Client ID hanya berlaku untuk role Client dan Viewer.");
    }
    if (customerId) {
      const known = await ctx.env.DB.prepare(`SELECT customer_id, aktif FROM clients WHERE customer_id = ?`)
        .bind(customerId)
        .first<{ customer_id: string; aktif: number }>();
      if (!known) throw Errors.badRequest("Client ID belum terdaftar. Tambahkan dulu di menu Clients.");
      if (known.aktif !== 1) throw Errors.badRequest("Client nonaktif. Aktifkan dulu di menu Clients.");
      customerId = known.customer_id; // canonical spelling from the master table
    }

    if (role === "Mitra" && !mitraId) {
      throw Errors.badRequest("Mitra wajib dipilih untuk role Mitra.");
    }
    if (mitraId && role !== "Mitra") {
      throw Errors.badRequest("Mitra hanya berlaku untuk role Mitra.");
    }
    if (mitraId) {
      const known = await ctx.env.DB.prepare(`SELECT kode_mitra, aktif FROM mitras WHERE kode_mitra = ?`)
        .bind(mitraId)
        .first<{ kode_mitra: string; aktif: number }>();
      if (!known) throw Errors.badRequest("Mitra belum terdaftar. Tambahkan dulu di menu Master Mitra.");
      if (known.aktif !== 1) throw Errors.badRequest("Mitra nonaktif. Aktifkan dulu di menu Master Mitra.");
      mitraId = known.kode_mitra;
    }

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
      `INSERT INTO users (id, nama, email, password_hash, role, aktif, foto_file_id, created_at, updated_at, created_by, updated_by, customer_id, mitra_id)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(id, nama, email, passwordHash, role, fotoFileId ?? null, now, now, actor.id, actor.id, customerId ?? null, mitraId ?? null)
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

    return ok({ id, nama, email, role, aktif: 1, customerId: customerId ?? null, mitraId: mitraId ?? null }, {}, 201);
  });

  router.patch("/api/users/:id", async (ctx: Ctx, params) => {
    const actor = requirePermission(ctx, "users.manage");
    const target = await ctx.env.DB.prepare(`SELECT id, role, customer_id, mitra_id FROM users WHERE id = ?`).bind(params.id).first<{
      id: string;
      role: string;
      customer_id: string | null;
      mitra_id: string | null;
    }>();
    if (!target) throw Errors.notFound("User tidak ditemukan.");
    if (target.role === "Superadmin") {
      throw Errors.forbidden("Role atau data Superadmin tidak bisa diubah lewat Manajemen User.");
    }
    if (actor.role === "Admin" && target.role === "Admin") {
      throw Errors.forbidden("Admin tidak dapat mengubah akun Admin lain (termasuk menonaktifkan). Hubungi Superadmin.");
    }

    const body = await parseJsonBody(ctx.request);
    const nama = optString(body, "nama");
    const email = body.email !== undefined ? reqEmail(body, "email") : undefined;
    const role = body.role !== undefined ? reqEnum(body, "role", ROLES) : undefined;
    if (actor.role === "Admin" && role === "Admin") {
      throw Errors.forbidden("Admin tidak dapat menaikkan role akun menjadi Admin. Hubungi Superadmin.");
    }
    const password = optString(body, "password");
    const aktif = optBool(body, "aktif");
    const fotoFileId = optString(body, "fotoFileId");
    const driverIdProvided = Object.prototype.hasOwnProperty.call(body, "driverId");
    const driverId = driverIdProvided ? optString(body, "driverId") ?? null : undefined;
    const customerIdProvided = Object.prototype.hasOwnProperty.call(body, "customerId");
    let customerId = customerIdProvided ? optString(body, "customerId") ?? null : undefined;
    if (customerId && customerId !== target.customer_id) {
      const known = await ctx.env.DB.prepare(`SELECT customer_id FROM clients WHERE customer_id = ?`)
        .bind(customerId)
        .first<{ customer_id: string }>();
      if (!known) throw Errors.badRequest("Client ID belum terdaftar. Tambahkan dulu di menu Clients.");
      customerId = known.customer_id;
    }
    const mitraIdProvided = Object.prototype.hasOwnProperty.call(body, "mitraId");
    let mitraId = mitraIdProvided ? optString(body, "mitraId") ?? null : undefined;
    if (mitraId && mitraId !== target.mitra_id) {
      const known = await ctx.env.DB.prepare(`SELECT kode_mitra FROM mitras WHERE kode_mitra = ?`)
        .bind(mitraId)
        .first<{ kode_mitra: string }>();
      if (!known) throw Errors.badRequest("Mitra belum terdaftar. Tambahkan dulu di menu Master Mitra.");
      mitraId = known.kode_mitra;
    }
    const effectiveRole = role ?? target.role;
    const effectiveCustomerId = customerIdProvided ? customerId : target.customer_id;
    const effectiveMitraId = mitraIdProvided ? mitraId : target.mitra_id;

    if (driverId && effectiveRole !== "Driver") {
      throw Errors.badRequest("driverId hanya berlaku untuk role Driver.");
    }
    // Client always needs a Client ID. Viewer needs one when the account is
    // being turned into a Viewer; older Viewer accounts (internal, no Client
    // ID) can still be edited without one.
    if (effectiveRole === "Client" && !effectiveCustomerId) {
      throw Errors.badRequest("Client ID wajib diisi untuk role Client.");
    }
    if (effectiveRole === "Viewer" && !effectiveCustomerId && role && role !== target.role) {
      throw Errors.badRequest("Client ID wajib diisi untuk role Viewer.");
    }
    if (effectiveCustomerId && effectiveRole !== "Client" && effectiveRole !== "Viewer") {
      throw Errors.badRequest("Client ID hanya berlaku untuk role Client dan Viewer.");
    }
    if (effectiveRole === "Mitra" && !effectiveMitraId) {
      throw Errors.badRequest("Mitra wajib dipilih untuk role Mitra.");
    }
    if (effectiveMitraId && effectiveRole !== "Mitra") {
      throw Errors.badRequest("Mitra hanya berlaku untuk role Mitra.");
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
    if (customerIdProvided) {
      sets.push("customer_id = ?");
      values.push(customerId);
    } else if (role && role !== "Client" && role !== "Viewer" && (target.role === "Client" || target.role === "Viewer")) {
      // Role moved away from Client without explicitly clearing the
      // Client ID - clear it so a re-promotion later doesn't inherit
      // a stale customer scope.
      sets.push("customer_id = ?");
      values.push(null);
    }
    if (mitraIdProvided) {
      sets.push("mitra_id = ?");
      values.push(mitraId);
    } else if (role && role !== "Mitra" && target.role === "Mitra") {
      // Role moved away from Mitra without explicitly clearing it - clear
      // so a re-promotion later doesn't inherit a stale mitra scope.
      sets.push("mitra_id = ?");
      values.push(null);
    }

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
