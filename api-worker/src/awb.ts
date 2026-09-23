// Mirrors src/utils/awb.ts (format GMSYYMMDD-NNN), but resolves the next
// sequence number against D1 instead of an in-memory shipment list.
export async function generateAwb(db: D1Database): Promise<string> {
  const today = new Date();
  const datePart = `${String(today.getUTCFullYear()).slice(-2)}${String(today.getUTCMonth() + 1).padStart(2, "0")}${String(
    today.getUTCDate(),
  ).padStart(2, "0")}`;
  const prefix = `GMS${datePart}-`;

  const rows = await db.prepare(`SELECT awb FROM shipments WHERE awb LIKE ? || '%'`).bind(prefix).all<{ awb: string }>();
  const numbers = (rows.results ?? [])
    .map((r) => Number(r.awb.slice(prefix.length)))
    .filter((n) => !Number.isNaN(n));
  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}
