// Format: G + YYMMDD + NNN (e.g. "G260927001") - a single-letter prefix,
// no dash, resolving the next per-day sequence number against D1.
export async function generateAwb(db: D1Database): Promise<string> {
  const today = new Date();
  const datePart = `${String(today.getUTCFullYear()).slice(-2)}${String(today.getUTCMonth() + 1).padStart(2, "0")}${String(
    today.getUTCDate(),
  ).padStart(2, "0")}`;
  const prefix = `G${datePart}`;

  const rows = await db.prepare(`SELECT awb FROM shipments WHERE awb LIKE ? || '%'`).bind(prefix).all<{ awb: string }>();
  const numbers = (rows.results ?? [])
    .map((r) => Number(r.awb.slice(prefix.length)))
    .filter((n) => !Number.isNaN(n));
  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}
