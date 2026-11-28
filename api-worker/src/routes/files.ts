import type { Router } from "../router";
import type { Ctx } from "../types";
import { ok, Errors } from "../http";
import { requirePermission, requireAuth } from "../authMiddleware";
import { newId } from "../crypto";
import { putObject, presignGet, validateUpload, deleteObject } from "../storage";
import { writeAuditLog } from "../audit";

const ALLOWED_ENTITY_TYPES = new Set([
  "user_avatar",
  "shipment_photo",
  "shipment_surat_jalan",
  "timeline_photo",
  "pod_barang",
  "pod_surat_jalan",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function registerFileRoutes(router: Router) {
  router.post("/api/files/upload", async (ctx: Ctx) => {
    const actor = requirePermission(ctx, "files.upload");

    const form = await ctx.request.formData().catch(() => null);
    if (!form) throw Errors.badRequest("Upload harus berupa multipart/form-data.");

    const file = form.get("file");
    const entityType = String(form.get("entityType") ?? "");
    const entityId = String(form.get("entityId") ?? "");

    if (!(file instanceof File)) throw Errors.badRequest('Field "file" wajib diisi.');
    if (!ALLOWED_ENTITY_TYPES.has(entityType)) throw Errors.badRequest("entityType tidak dikenali.");
    if (!entityId) throw Errors.badRequest('Field "entityId" wajib diisi.');
    // entityId becomes part of the storage object key: block path traversal / odd characters.
    if (!/^[A-Za-z0-9._-]{1,100}$/.test(entityId) || entityId.includes("..")) throw Errors.badRequest('Field "entityId" tidak valid.');

    const buffer = await file.arrayBuffer();
    const mime = validateUpload(file.type, buffer.byteLength, buffer);

    const ext = EXT_BY_MIME[mime] ?? "jpg";
    const objectKey = `${entityType}/${entityId}/${newId()}.${ext}`;

    await putObject(ctx.env, objectKey, buffer, mime);

    const id = newId();
    const now = new Date().toISOString();
    await ctx.env.DB.prepare(
      `INSERT INTO files (id, object_key, filename, mime_type, size_bytes, uploaded_by, entity_type, entity_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(id, objectKey, file.name || objectKey, mime, buffer.byteLength, actor.id, entityType, entityId, now)
      .run();

    await writeAuditLog(ctx.env, actor, {
      action: "FILE_UPLOADED",
      actionLabel: "FILE UPLOADED",
      module: "Files",
      description: `File "${file.name || objectKey}" (${entityType}) diunggah.`,
    });

    return ok({ id, url: await presignGet(ctx.env, objectKey) }, {}, 201);
  });

  router.get("/api/files/:id", async (ctx: Ctx, params) => {
    const actor = requireAuth(ctx);
    const row = await ctx.env.DB.prepare(`SELECT object_key, uploaded_by, entity_id FROM files WHERE id = ?`).bind(params.id).first<{
      object_key: string;
      uploaded_by: string | null;
      entity_id: string | null;
    }>();
    if (!row) throw Errors.notFound("File tidak ditemukan.");

    // Anti-IDOR: external roles (Client / customer-linked Viewer / Mitra) may only open their own
    // uploads or files attached to a shipment (entity_id = AWB) within their own scope.
    const scoped = actor.role === "Client" || actor.role === "Mitra" || (actor.role === "Viewer" && !!actor.customerId);
    if (scoped && row.uploaded_by !== actor.id) {
      const ship = row.entity_id
        ? await ctx.env.DB.prepare(`SELECT customer_id, mitra_id FROM shipments WHERE awb = ?`).bind(row.entity_id).first<{
            customer_id: string | null;
            mitra_id: string | null;
          }>()
        : null;
      const allowed = ship
        ? actor.role === "Mitra"
          ? ship.mitra_id === actor.mitraId
          : ship.customer_id === actor.customerId
        : false;
      if (!allowed) throw Errors.forbidden("Anda tidak punya akses ke file ini.");
    }

    const url = await presignGet(ctx.env, row.object_key);
    return ok({ url });
  });

  router.delete("/api/files/:id", async (ctx: Ctx, params) => {
    const actor = requirePermission(ctx, "files.upload");
    const row = await ctx.env.DB.prepare(`SELECT object_key FROM files WHERE id = ?`).bind(params.id).first<{
      object_key: string;
    }>();
    if (!row) throw Errors.notFound("File tidak ditemukan.");

    await deleteObject(ctx.env, row.object_key);
    await ctx.env.DB.prepare(`DELETE FROM files WHERE id = ?`).bind(params.id).run();

    await writeAuditLog(ctx.env, actor, {
      action: "FILE_DELETED",
      actionLabel: "FILE DELETED",
      module: "Files",
      description: `File (${params.id}) dihapus.`,
    });

    return ok({ deleted: true });
  });
}
