import { Building2, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { PublicLayout } from "../../components/layout/PublicLayout";
import { useDocumentTitle } from "../../utils/useDocumentTitle";

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Transparan",
    desc: "Setiap pengiriman dapat dipantau customer secara mandiri melalui resi digital dan tracking real-time.",
  },
  {
    icon: PackageCheck,
    title: "Terpercaya",
    desc: "Setiap update status divalidasi oleh tim internal kami, mulai dari penerimaan hingga serah terima barang.",
  },
  {
    icon: Truck,
    title: "Handal",
    desc: "Didukung armada dan mitra transportasi di berbagai kota untuk menjangkau tujuan pengiriman Anda.",
  },
];

export default function About() {
  useDocumentTitle("Tentang Kami");
  return (
    <PublicLayout>
      <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-900 text-white">
          <Building2 size={22} />
        </div>
        <h1 className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl">Tentang Kami</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          <strong>PT Gangsar Mitra Sautama</strong> adalah perusahaan jasa logistik dan pengiriman
          barang yang melayani rute antar kota di Indonesia. Kami berkomitmen menghadirkan layanan
          pengiriman yang transparan dan mudah dipantau, sehingga customer tidak perlu lagi
          menghubungi tim secara manual untuk mengetahui posisi barangnya.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Melalui Sistem Tracking &amp; Resi Digital, setiap pengiriman kini memiliki nomor resi
          (AWB) unik yang dapat dilacak kapan saja — lengkap dengan status, lokasi, foto
          dokumentasi, informasi unit truck yang membawa barang, hingga bukti serah terima (Proof
          of Delivery) saat barang sampai di tangan penerima.
        </p>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {VALUES.map((v) => (
          <div key={v.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
              <v.icon size={18} />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900">{v.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{v.desc}</p>
          </div>
        ))}
      </section>
    </PublicLayout>
  );
}
