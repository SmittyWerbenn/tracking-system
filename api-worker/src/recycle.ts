import type { Env } from "./types";
import { newId } from "./crypto";
import { deleteObject } from "./storage";
import { writeAuditLog } from "./audit";

/** Days a binned row is kept before the nightly job purges it. */
export const RETENTION_DAYS = 30;

export type RecycleEntity = "shipment" | "user" | "truck" | "location" | "layanan" | "mitra" | "client";

export interface EntityRow {
  id: string;
  label: string;
  sublabel: string;
  deletedAt: string | null;
  snapshot: Record<string, unknown>;
}

export interface RecycleActor {
  id: string | null;
  nama: string;
}

export interface EntityDef {
  type: RecycleEntity;
  /** Human name used in messages/audit ("Pengiriman", "User", ...). */
  title: string;
  /** Audit-log module name. */
  module: string;
  table: string;
  pk: string;
  load(env: Env, id: string): Promise<EntityRow | null>;
  /** Business rule check before the row may enter the bin; returns a message when blocked. */
  guardDelete?(env: Env, row: EntityRow, actor: RecycleActor): Promise<string | null>;
  /** Runs right after the row was marked deleted (e.g. revoke sessions). */
  afterDelete?(env: Env, row: EntityRow): Promise<void>;
  /** Blocks a restore that would collide with an active row. */
  guardRestore?(env: Env, row: EntityRow): Promise<string | null>;
  /** Blocks a permanent delete that would orphan other rows. */
  guardPurge?(env: Env, row: EntityRow): Promise<string | null>;
  /** Statements that remove the row (and what must go first). */
  purgeStatements(env: Env, row: EntityRow): Promise<D1PreparedStatement[]>;
  /** Value to record in audit_log.awb. */
  awb?(row: EntityRow): string | undefined;
}

const FINAL_STATUSES = ["Selesai / Terkirim", "Dibatalkan"];

async function count(env: Env, sql: string, ...binds: unknown[]): Promise<number> {
  const r = await env.DB.prepare(sql).bind(...binds).first<{ c: number }>();
  return r?.c ?? 0;
}

function blockedBy(rows: Array<[number, string]>, what: string): string | null {
  const parts = rows.filter(([n]) => n > 0).map(([n, label]) => `${n} ${label}`);
  return parts.length ? `${what} masih direferensikan oleh ${parts.join(", ")}.` : null;
}

const shipment: EntityDef = {
  type: "shipment",
  title: "Pengiriman",
  module: "Pengiriman",
  table: "shipments",
  pk: "awb",
  awb: (r) => r.id,
  async load(env, id) {
    const s = await env.DB.prepare(`SELECT * FROM shipments WHERE awb = ?`).bind(id).first<Record<string, unknown>>();
    if (!s) return null;
    return {
      id: String(s.awb),
      label: String(s.awb),
      sublabel: `${s.kota_asal} → ${s.kota_tujuan} · ${s.status}`,
      deletedAt: (s.deleted_at as string | null) ?? null,
      snapshot: s,
    };
  },
  async purgeStatements(env, row) {
    const db = env.DB;
    const a = row.id;
    return [
      db.prepare(`DELETE FROM files WHERE (entity_type IN ('shipment_photo','shipment_surat_jalan','pod_barang','pod_surat_jalan') AND entity_id = ?)
        OR (entity_type = 'timeline_photo' AND entity_id IN (SELECT id FROM shipment_timeline_events WHERE awb = ?))`).bind(a, a),
      db.prepare(`DELETE FROM driver_position_reports WHERE awb = ?`).bind(a),
      db.prepare(`DELETE FROM shipment_timeline_events WHERE awb = ?`).bind(a),
      db.prepare(`DELETE FROM shipment_pod WHERE awb = ?`).bind(a),
      db.prepare(`DELETE FROM notifications WHERE awb = ?`).bind(a),
      db.prepare(`DELETE FROM feedback WHERE awb = ?`).bind(a),
      db.prepare(`DELETE FROM order_recovery_requests WHERE awb = ?`).bind(a),
      db.prepare(`DELETE FROM shipments WHERE awb = ?`).bind(a),
    ];
  },
};

/** Object-storage keys of every file attached to a shipment, read before the purge removes the rows. */
export async function collectShipmentObjectKeys(env: Env, awb: string): Promise<string[]> {
  const r = await env.DB.prepare(
    `SELECT object_key FROM files WHERE (entity_type IN ('shipment_photo','shipment_surat_jalan','pod_barang','pod_surat_jalan') AND entity_id = ?)
       OR (entity_type = 'timeline_photo' AND entity_id IN (SELECT id FROM shipment_timeline_events WHERE awb = ?))`,
  )
    .bind(awb, awb)
    .all<{ object_key: string }>();
  return (r.results ?? []).map((x) => x.object_key);
}

export async function deleteObjectsQuietly(env: Env, keys: string[]): Promise<void> {
  for (const k of keys) {
    try {
      await deleteObject(env, k);
    } catch {
      // Orphaned object in storage is harmless; the DB row is already gone.
    }
  }
}

const user: EntityDef = {
  type: "user",
  title: "User",
  module: "Manajemen User",
  table: "users",
  pk: "id",
  async load(env, id) {
    const u = await env.DB.prepare(
      `SELECT id, nama, email, role, aktif, customer_id, mitra_id, deleted_at FROM users WHERE id = ?`,
    )
      .bind(id)
      .first<Record<string, unknown>>();
    if (!u) return null;
    return {
      id: String(u.id),
      label: String(u.nama),
      sublabel: `${u.email} · ${u.role}`,
      deletedAt: (u.deleted_at as string | null) ?? null,
      snapshot: u,
    };
  },
  async guardDelete(env, row, actor) {
    if (row.id === actor.id) return "Anda tidak dapat menghapus akun sendiri.";
    if (row.snapshot.role === "Superadmin") {
      const others = await count(
        env,
        `SELECT COUNT(*) AS c FROM users WHERE role = 'Superadmin' AND aktif = 1 AND deleted_at IS NULL AND id != ?`,
        row.id,
      );
      if (others === 0) return "Superadmin terakhir tidak dapat dihapus.";
    }
    return null;
  },
  async afterDelete(env, row) {
    await env.DB.prepare(`UPDATE sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL`)
      .bind(new Date().toISOString(), row.id)
      .run();
  },
  async guardRestore(env, row) {
    const dupe = await count(
      env,
      `SELECT COUNT(*) AS c FROM users WHERE email = ? COLLATE NOCASE AND id != ? AND deleted_at IS NULL`,
      String(row.snapshot.email),
      row.id,
    );
    return dupe > 0 ? "Data tidak dapat dipulihkan karena terdapat data aktif dengan identifier yang sama." : null;
  },
  async guardPurge(env, row) {
    const driver = await env.DB.prepare(`SELECT id FROM drivers WHERE user_id = ?`).bind(row.id).first<{ id: string }>();
    const rows: Array<[number, string]> = [
      [await count(env, `SELECT COUNT(*) AS c FROM driver_position_reports WHERE driver_user_id = ?`, row.id), "laporan posisi driver"],
    ];
    if (driver) {
      rows.push([await count(env, `SELECT COUNT(*) AS c FROM trucks WHERE driver_id = ?`, driver.id), "armada"]);
      rows.push([await count(env, `SELECT COUNT(*) AS c FROM shipments WHERE claim_driver_id = ?`, driver.id), "klaim pengiriman"]);
    }
    return blockedBy(rows, "User ini");
  },
  async purgeStatements(env, row) {
    const db = env.DB;
    const driver = await db.prepare(`SELECT id FROM drivers WHERE user_id = ?`).bind(row.id).first<{ id: string }>();
    const stmts = [
      // Names are denormalised onto these rows, so history stays readable without the FK.
      db.prepare(`UPDATE audit_log SET user_id = NULL WHERE user_id = ?`).bind(row.id),
      db.prepare(`UPDATE shipment_timeline_events SET input_by_user_id = NULL WHERE input_by_user_id = ?`).bind(row.id),
      db.prepare(`UPDATE files SET uploaded_by = NULL WHERE uploaded_by = ?`).bind(row.id),
      db.prepare(`DELETE FROM sessions WHERE user_id = ?`).bind(row.id),
    ];
    if (driver) stmts.push(db.prepare(`DELETE FROM drivers WHERE id = ?`).bind(driver.id));
    stmts.push(db.prepare(`DELETE FROM users WHERE id = ?`).bind(row.id));
    return stmts;
  },
};

const truck: EntityDef = {
  type: "truck",
  title: "Armada",
  module: "Armada",
  table: "trucks",
  pk: "id",
  async load(env, id) {
    const t = await env.DB.prepare(`SELECT * FROM trucks WHERE id = ?`).bind(id).first<Record<string, unknown>>();
    if (!t) return null;
    return {
      id: String(t.id),
      label: String(t.nomor_unit),
      sublabel: String(t.jenis ?? ""),
      deletedAt: (t.deleted_at as string | null) ?? null,
      snapshot: t,
    };
  },
  async guardDelete(env, row) {
    const n = await count(
      env,
      `SELECT COUNT(*) AS c FROM shipments WHERE truck_id = ? AND deleted_at IS NULL AND status NOT IN (?, ?)`,
      row.id,
      ...FINAL_STATUSES,
    );
    return n > 0 ? `Data tidak dapat dihapus karena masih digunakan oleh ${n} pengiriman aktif.` : null;
  },
  async guardPurge(env, row) {
    return blockedBy(
      [
        [await count(env, `SELECT COUNT(*) AS c FROM shipments WHERE truck_id = ?`, row.id), "pengiriman"],
        [
          await count(env, `SELECT COUNT(*) AS c FROM shipment_timeline_events WHERE truck_id = ? OR truck_sebelumnya_id = ?`, row.id, row.id),
          "riwayat tracking",
        ],
      ],
      "Armada ini",
    );
  },
  async purgeStatements(env, row) {
    return [env.DB.prepare(`DELETE FROM trucks WHERE id = ?`).bind(row.id)];
  },
};

const location: EntityDef = {
  type: "location",
  title: "Kota & Titik Transit",
  module: "Master Kota",
  table: "locations",
  pk: "id",
  async load(env, id) {
    const l = await env.DB.prepare(`SELECT * FROM locations WHERE id = ?`).bind(id).first<Record<string, unknown>>();
    if (!l) return null;
    const area = l.nama_area ? String(l.nama_area) : "";
    return {
      id: String(l.id),
      label: area || String(l.nama_kota),
      sublabel: [area ? String(l.nama_kota) : "", l.provinsi ? String(l.provinsi) : "", l.jenis ? String(l.jenis) : ""]
        .filter(Boolean)
        .join(" · "),
      deletedAt: (l.deleted_at as string | null) ?? null,
      snapshot: l,
    };
  },
  async guardPurge(env, row) {
    return blockedBy(
      [[await count(env, `SELECT COUNT(*) AS c FROM shipment_timeline_events WHERE titik_id = ?`, row.id), "riwayat tracking"]],
      "Titik ini",
    );
  },
  async purgeStatements(env, row) {
    return [env.DB.prepare(`DELETE FROM locations WHERE id = ?`).bind(row.id)];
  },
};

const layanan: EntityDef = {
  type: "layanan",
  title: "Layanan",
  module: "Layanan",
  table: "layanans",
  pk: "id",
  async load(env, id) {
    const l = await env.DB.prepare(`SELECT * FROM layanans WHERE id = ?`).bind(id).first<Record<string, unknown>>();
    if (!l) return null;
    return {
      id: String(l.id),
      label: String(l.nama),
      sublabel: String(l.deskripsi ?? ""),
      deletedAt: (l.deleted_at as string | null) ?? null,
      snapshot: l,
    };
  },
  async guardDelete(_env, row) {
    // Same rule as the old hard delete: LTL is the fallback service for orders.
    return String(row.snapshot.nama).trim().toUpperCase() === "LTL"
      ? "LTL adalah layanan fallback order dan tidak bisa dihapus."
      : null;
  },
  async guardPurge(env, row) {
    return blockedBy(
      [[await count(env, `SELECT COUNT(*) AS c FROM shipments WHERE layanan = ? COLLATE NOCASE`, String(row.snapshot.nama)), "pengiriman"]],
      "Layanan ini",
    );
  },
  async purgeStatements(env, row) {
    return [env.DB.prepare(`DELETE FROM layanans WHERE id = ?`).bind(row.id)];
  },
};

const mitra: EntityDef = {
  type: "mitra",
  title: "Mitra",
  module: "Mitra",
  table: "mitras",
  pk: "kode_mitra",
  async load(env, id) {
    const m = await env.DB.prepare(`SELECT * FROM mitras WHERE kode_mitra = ?`).bind(id).first<Record<string, unknown>>();
    if (!m) return null;
    return {
      id: String(m.kode_mitra),
      label: String(m.nama),
      sublabel: String(m.kode_mitra),
      deletedAt: (m.deleted_at as string | null) ?? null,
      snapshot: m,
    };
  },
  async guardDelete(env, row) {
    const users = await count(env, `SELECT COUNT(*) AS c FROM users WHERE mitra_id = ? AND deleted_at IS NULL`, row.id);
    const active = await count(
      env,
      `SELECT COUNT(*) AS c FROM shipments WHERE mitra_id = ? AND deleted_at IS NULL AND status NOT IN (?, ?)`,
      row.id,
      ...FINAL_STATUSES,
    );
    return blockedBy(
      [
        [users, "user aktif"],
        [active, "pengiriman aktif"],
      ],
      "Mitra ini",
    );
  },
  async guardPurge(env, row) {
    return blockedBy(
      [
        [await count(env, `SELECT COUNT(*) AS c FROM users WHERE mitra_id = ?`, row.id), "user"],
        [await count(env, `SELECT COUNT(*) AS c FROM shipments WHERE mitra_id = ?`, row.id), "pengiriman"],
      ],
      "Mitra ini",
    );
  },
  async purgeStatements(env, row) {
    return [env.DB.prepare(`DELETE FROM mitras WHERE kode_mitra = ?`).bind(row.id)];
  },
};

const client: EntityDef = {
  type: "client",
  title: "Client",
  module: "Clients",
  table: "clients",
  pk: "customer_id",
  async load(env, id) {
    const c = await env.DB.prepare(`SELECT * FROM clients WHERE customer_id = ?`).bind(id).first<Record<string, unknown>>();
    if (!c) return null;
    return {
      id: String(c.customer_id),
      label: String(c.nama),
      sublabel: String(c.customer_id),
      deletedAt: (c.deleted_at as string | null) ?? null,
      snapshot: c,
    };
  },
  async guardDelete(env, row) {
    const users = await count(env, `SELECT COUNT(*) AS c FROM users WHERE customer_id = ? COLLATE NOCASE AND deleted_at IS NULL`, row.id);
    const active = await count(
      env,
      `SELECT COUNT(*) AS c FROM shipments WHERE customer_id = ? COLLATE NOCASE AND deleted_at IS NULL AND status NOT IN (?, ?)`,
      row.id,
      ...FINAL_STATUSES,
    );
    return blockedBy(
      [
        [users, "user aktif (hapus atau pindahkan user-nya dulu)"],
        [active, "pengiriman aktif"],
      ],
      "Client ini",
    );
  },
  async guardPurge(env, row) {
    return blockedBy(
      [
        [await count(env, `SELECT COUNT(*) AS c FROM users WHERE customer_id = ? COLLATE NOCASE`, row.id), "user"],
        [await count(env, `SELECT COUNT(*) AS c FROM shipments WHERE customer_id = ? COLLATE NOCASE`, row.id), "pengiriman"],
      ],
      "Client ini",
    );
  },
  async purgeStatements(env, row) {
    return [env.DB.prepare(`DELETE FROM clients WHERE customer_id = ?`).bind(row.id)];
  },
};

export const ENTITIES: Record<RecycleEntity, EntityDef> = { shipment, user, truck, location, layanan, mitra, client };
export const ENTITY_TYPES = Object.keys(ENTITIES) as RecycleEntity[];

export function expiresAtFrom(deletedAtIso: string): string {
  return new Date(new Date(deletedAtIso).getTime() + RETENTION_DAYS * 86_400_000).toISOString();
}

export interface BinRow {
  id: string;
  entity_type: RecycleEntity;
  entity_id: string;
  label: string;
  sublabel: string | null;
  snapshot: string | null;
  status: "IN_BIN" | "RESTORED" | "PURGED";
  deleted_by: string | null;
  deleted_by_name: string;
  deleted_at: string;
  delete_reason: string;
  expires_at: string;
  purge_error: string | null;
}

export type ItemResult = { id: string; ok: boolean; message?: string };

/** Move one active row into the bin. Never throws for business reasons; returns the outcome. */
export async function softDelete(
  env: Env,
  def: EntityDef,
  id: string,
  reason: string,
  actor: RecycleActor,
): Promise<ItemResult & { row?: EntityRow }> {
  const row = await def.load(env, id);
  if (!row) return { id, ok: false, message: "Data tidak ditemukan." };
  if (row.deletedAt) return { id, ok: false, message: "Data sudah dipindahkan ke Recycle Bin." };
  const blocked = await def.guardDelete?.(env, row, actor);
  if (blocked) return { id, ok: false, message: blocked };

  const now = new Date().toISOString();
  // Atomic claim: only one concurrent caller sees changes = 1.
  const claim = await env.DB.prepare(`UPDATE ${def.table} SET deleted_at = ? WHERE ${def.pk} = ? AND deleted_at IS NULL`)
    .bind(now, id)
    .run();
  if ((claim.meta.changes ?? 0) === 0) return { id, ok: false, message: "Data sudah dipindahkan ke Recycle Bin." };

  try {
    await env.DB.prepare(
      `INSERT INTO recycle_bin (id, entity_type, entity_id, label, sublabel, snapshot, status, deleted_by, deleted_by_name, deleted_at, delete_reason, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, 'IN_BIN', ?, ?, ?, ?, ?)`,
    )
      .bind(newId(), def.type, id, row.label, row.sublabel, JSON.stringify(row.snapshot), actor.id, actor.nama, now, reason, expiresAtFrom(now))
      .run();
  } catch {
    await env.DB.prepare(`UPDATE ${def.table} SET deleted_at = NULL WHERE ${def.pk} = ?`).bind(id).run();
    return { id, ok: false, message: "Data sudah dipindahkan ke Recycle Bin." };
  }
  await def.afterDelete?.(env, row);
  return { id, ok: true, row };
}

/** Restore one bin record. */
export async function restoreItem(env: Env, binId: string, reason: string, actor: RecycleActor): Promise<ItemResult & { bin?: BinRow; row?: EntityRow }> {
  const bin = await env.DB.prepare(`SELECT * FROM recycle_bin WHERE id = ?`).bind(binId).first<BinRow>();
  if (!bin) return { id: binId, ok: false, message: "Data tidak ditemukan di Recycle Bin." };
  if (bin.status !== "IN_BIN") return { id: binId, ok: false, message: "Data ini sudah tidak berada di Recycle Bin." };
  const def = ENTITIES[bin.entity_type];
  const row = await def.load(env, bin.entity_id);
  if (!row) return { id: binId, ok: false, message: "Data asli sudah tidak ada." };
  const conflict = await def.guardRestore?.(env, row);
  if (conflict) return { id: binId, ok: false, message: conflict };

  const now = new Date().toISOString();
  const claim = await env.DB.prepare(
    `UPDATE recycle_bin SET status = 'RESTORED', restored_by = ?, restored_by_name = ?, restored_at = ?, restore_reason = ?
     WHERE id = ? AND status = 'IN_BIN'`,
  )
    .bind(actor.id, actor.nama, now, reason, binId)
    .run();
  if ((claim.meta.changes ?? 0) === 0) return { id: binId, ok: false, message: "Data ini sudah tidak berada di Recycle Bin." };

  await env.DB.prepare(`UPDATE ${def.table} SET deleted_at = NULL WHERE ${def.pk} = ?`).bind(bin.entity_id).run();
  return { id: binId, ok: true, bin, row };
}

/** Permanently delete one bin record (manual or from the nightly job). */
export async function purgeItem(
  env: Env,
  binId: string,
  reason: string,
  actor: RecycleActor | null,
): Promise<ItemResult & { bin?: BinRow; row?: EntityRow }> {
  const bin = await env.DB.prepare(`SELECT * FROM recycle_bin WHERE id = ?`).bind(binId).first<BinRow>();
  if (!bin) return { id: binId, ok: false, message: "Data tidak ditemukan di Recycle Bin." };
  if (bin.status !== "IN_BIN") return { id: binId, ok: false, message: "Data ini sudah tidak berada di Recycle Bin." };
  const def = ENTITIES[bin.entity_type];
  const row = await def.load(env, bin.entity_id);

  const fail = async (message: string) => {
    await env.DB.prepare(`UPDATE recycle_bin SET purge_error = ? WHERE id = ? AND status = 'IN_BIN'`).bind(message, binId).run();
    return { id: binId, ok: false, message, bin, row: row ?? undefined };
  };

  if (row) {
    const blocked = await def.guardPurge?.(env, row);
    if (blocked) return fail(blocked);
  }

  const now = new Date().toISOString();
  const claim = await env.DB.prepare(
    `UPDATE recycle_bin SET status = 'PURGED', purged_by = ?, purged_by_name = ?, purged_at = ?, purge_reason = ?, purge_error = NULL, snapshot = NULL
     WHERE id = ? AND status = 'IN_BIN'`,
  )
    .bind(actor?.id ?? null, actor?.nama ?? "System", now, reason, binId)
    .run();
  if ((claim.meta.changes ?? 0) === 0) return { id: binId, ok: false, message: "Data ini sudah tidak berada di Recycle Bin." };

  if (row) {
    const keys = bin.entity_type === "shipment" ? await collectShipmentObjectKeys(env, bin.entity_id) : [];
    try {
      const stmts = await def.purgeStatements(env, row);
      await env.DB.batch(stmts);
      if (keys.length) await deleteObjectsQuietly(env, keys);
    } catch (e) {
      // Database refused (constraint): put the record back untouched.
      await env.DB.prepare(
        `UPDATE recycle_bin SET status = 'IN_BIN', purged_by = NULL, purged_by_name = NULL, purged_at = NULL, purge_reason = NULL, snapshot = ?, purge_error = ?
         WHERE id = ?`,
      )
        .bind(bin.snapshot, `Gagal menghapus permanen: ${e instanceof Error ? e.message : "kesalahan database"}`, binId)
        .run();
      return { id: binId, ok: false, message: "Gagal menghapus permanen karena masih terkait data lain.", bin, row };
    }
  }
  return { id: binId, ok: true, bin, row: row ?? undefined };
}

/** Nightly job: permanently delete bin rows older than the retention window. */
export async function purgeExpired(env: Env): Promise<{ purged: number; blocked: number }> {
  const now = new Date().toISOString();
  const due = await env.DB.prepare(
    `SELECT id FROM recycle_bin WHERE status = 'IN_BIN' AND expires_at <= ? ORDER BY expires_at LIMIT 200`,
  )
    .bind(now)
    .all<{ id: string }>();
  let purged = 0;
  let blocked = 0;
  for (const { id } of due.results ?? []) {
    const r = await purgeItem(env, id, `Otomatis: melewati ${RETENTION_DAYS} hari di Recycle Bin`, null);
    const def = r.bin ? ENTITIES[r.bin.entity_type] : null;
    if (r.ok && r.bin && def) {
      purged++;
      await writeAuditLog(env, null, {
        action: "RECYCLE_AUTO_PURGE",
        actionLabel: "HAPUS PERMANEN OTOMATIS",
        module: "Recycle Bin",
        awb: r.bin.entity_type === "shipment" ? r.bin.entity_id : undefined,
        description: `${def.title} "${r.bin.label}" (${r.bin.entity_id}) dihapus permanen otomatis. Dihapus pada ${r.bin.deleted_at}, dihapus permanen pada ${new Date().toISOString()}.`,
      });
    } else if (r.bin && def) {
      blocked++;
      await writeAuditLog(env, null, {
        action: "RECYCLE_AUTO_PURGE_FAILED",
        actionLabel: "HAPUS OTOMATIS TERTAHAN",
        module: "Recycle Bin",
        awb: r.bin.entity_type === "shipment" ? r.bin.entity_id : undefined,
        description: `${def.title} "${r.bin.label}" (${r.bin.entity_id}) tidak dapat dihapus permanen otomatis: ${r.message}`,
      });
    }
  }
  return { purged, blocked };
}
