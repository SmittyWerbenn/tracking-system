import { ArrowLeft, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PublicLayout } from "../../components/layout/PublicLayout";
import { COMPANY_VALUES } from "../../data/companyValues";
import { useDocumentTitle } from "../../utils/useDocumentTitle";

export default function About() {
  useDocumentTitle("Tentang Kami");
  const navigate = useNavigate();
  return (
    <PublicLayout>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={15} /> Kembali
      </button>

      <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-900 text-white">
          <Building2 size={22} />
        </div>
        <h1 className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl">Tentang Kami</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          <strong>PT Gangsar Mitra Suatama</strong> adalah perusahaan jasa logistik dan pengiriman
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
        {COMPANY_VALUES.map((v) => (
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
