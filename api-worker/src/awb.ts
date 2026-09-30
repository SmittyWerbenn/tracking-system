// Format: G + YYMMDD + NNN (e.g. "G260927001") - a single-letter prefix,
// no dash, resolving the next per-day sequence number against D1.
import { wibNow } from "./wib";

export async function generateAwb(db: D1Database): Promise<string> {
  // The date in the AWB is the WIB calendar day (not UTC), so a shipment made
  // at 00:30 WIB isn't numbered with yesterday's date.
  const datePart = wibNow().tanggal.slice(2).replace(/-/g, "");
  const prefix = `G${datePart}`;

  const rows = await db.prepare(`SELECT awb FROM shipments WHERE awb LIKE ? || '%'`).bind(prefix).all<{ awb: string }>();
  const numbers = (rows.results ?? [])
    .map((r) => Number(r.awb.slice(prefix.length)))
    .filter((n) => !Number.isNaN(n));
  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}
