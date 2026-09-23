const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/** tanggal: "2026-09-11" -> "11 September 2026" */
export function formatTanggalPanjang(tanggal: string): string {
  const [y, m, d] = tanggal.split("-").map(Number);
  if (!y || !m || !d) return tanggal;
  return `${d} ${BULAN[m - 1]} ${y}`;
}

/** tanggal: "2026-09-11" -> "11 Sep 2026" */
export function formatTanggalPendek(tanggal: string): string {
  const [y, m, d] = tanggal.split("-").map(Number);
  if (!y || !m || !d) return tanggal;
  return `${d} ${BULAN[m - 1].slice(0, 3)} ${y}`;
}

export function formatJam(jam: string): string {
  return `${jam} WIB`;
}

export function formatTanggalJam(tanggal: string, jam: string): string {
  return `${formatTanggalPanjang(tanggal)} · ${formatJam(jam)}`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function nowHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}

/** deskripsiBarang embeds its koli count/weight for the auto-fill parser
 * (deriveBeratKg/deriveJumlahKoli in mockData.ts), e.g.
 * "Spare part mesin industri, 3 dus (total 85kg)". Wherever Berat/Koli
 * already have their own column (reports, exports), showing that clause
 * again in Keterangan is redundant - this strips it back down to
 * "Spare part mesin industri". Falls back to the original string if the
 * pattern isn't found (free text some shipments may not follow it). */
export function stripKeteranganMeta(deskripsiBarang: string): string {
  const stripped = deskripsiBarang.replace(
    /,\s*\d+\s*(?:dus|box|palet|item|unit|koli|drum)\s*\([^)]*\)\s*$/i,
    "",
  );
  return stripped.trim() || deskripsiBarang;
}
