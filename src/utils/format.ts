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
