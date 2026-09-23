import {
  ArrowRight,
  Building2,
  Calculator,
  Camera,
  FileText,
  Gauge,
  Headset,
  Layers,
  LayoutDashboard,
  Mail,
  MapPinned,
  Monitor,
  Package,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  Truck,
} from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import heroImage from "../../assets/hero-package-handoff.jpg";
import { PublicLayout } from "../../components/layout/PublicLayout";
import { StatCard } from "../../components/StatCard";
import { COMPANY_VALUES } from "../../data/companyValues";
import { useDocumentTitle } from "../../utils/useDocumentTitle";

// Figures provided by the business (includes pre-digitization manual
// operations, not just what's seeded in this prototype's demo dataset).
const COMPANY_STATS = {
  totalPengiriman: "9.355+",
  kotaTerjangkau: "50+",
  armadaTruck: "70+",
};

const SERVICES = [
  {
    icon: Truck,
    title: "Pengiriman Antar Kota",
    desc: "Layanan pengiriman darat ke berbagai kota tujuan, didukung armada truck sesuai kebutuhan muatan Anda.",
    benefit: "Jangkauan luas, armada bervariasi",
  },
  {
    icon: Headset,
    title: "Dukungan Tim Operasional",
    desc: "Tim internal kami mengelola setiap pengiriman secara aktif, mulai dari koordinasi driver hingga penanganan kendala di perjalanan.",
    benefit: "Terkoordinasi & responsif",
  },
  {
    icon: FileText,
    title: "Resi & Tracking Digital",
    desc: "Setiap pengiriman mendapat resi digital (AWB) yang dapat dipantau statusnya kapan saja untuk kebutuhan dokumentasi Anda.",
    benefit: "Transparan & mudah diakses",
  },
  {
    icon: Camera,
    title: "Proof of Delivery",
    desc: "Foto barang diterima dan surat jalan yang telah ditandatangani tersimpan digital sebagai bukti serah terima.",
    benefit: "Validitas & kepercayaan terjaga",
  },
];

const TECHNOLOGY = [
  {
    number: "01",
    icon: Monitor,
    title: "Website Pelacakan",
    desc: "Pelanggan dapat melacak status pengiriman kapan saja hanya dengan nomor AWB, tanpa perlu menghubungi tim secara manual.",
  },
  {
    number: "02",
    icon: LayoutDashboard,
    title: "Dashboard Admin",
    desc: "Tim operasional mengelola pengiriman, armada, dan lokasi transit dalam satu panel kerja yang terpusat.",
  },
  {
    number: "03",
    icon: Smartphone,
    title: "Akses Mobile",
    desc: "Tampilan tracking dan panel admin dioptimalkan agar tetap nyaman digunakan dari perangkat mobile.",
  },
  {
    number: "04",
    icon: Mail,
    title: "Notifikasi Otomatis",
    desc: "Pelanggan mendapat notifikasi email saat resi diterbitkan, ada kendala, hingga pengiriman selesai.",
  },
];

const TRUST_STRIP = [
  { icon: ShieldCheck, label: "Keamanan Data Pelanggan" },
  { icon: Gauge, label: "Proses Pengiriman Efisien" },
  { icon: Headset, label: "Layanan Pelanggan Responsif" },
  { icon: TrendingUp, label: "Siap Mendukung Pertumbuhan Bisnis Anda" },
];

const WHY_CHOOSE_US = [
  {
    icon: ShieldCheck,
    title: "Data Tervalidasi",
    desc: "Setiap update status diinput dan diverifikasi oleh tim internal kami, sehingga informasi yang Anda terima akurat.",
  },
  {
    icon: Camera,
    title: "Dokumentasi Lengkap",
    desc: "Setiap tahap pengiriman didokumentasikan dengan foto, sehingga riwayat proses dapat ditelusuri kembali.",
  },
  {
    icon: Layers,
    title: "Sistem Terintegrasi",
    desc: "Operasional lapangan dan layanan pelanggan berjalan dalam satu sistem terpadu, menjaga konsistensi informasi.",
  },
  {
    icon: MapPinned,
    title: "Update Berkala",
    desc: "Kami menginformasikan perkembangan status pengiriman secara berkala di setiap tahap perjalanan.",
  },
];

export default function Home() {
  useDocumentTitle("Beranda");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    if (state?.scrollTo) {
      const el = document.getElementById(state.scrollTo);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <PublicLayout wide>
      {/* Hero */}
      <section className="relative grid grid-cols-1 items-center gap-8 py-6 sm:py-10 lg:grid-cols-2 lg:gap-12">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute -left-20 top-1/3 h-64 w-64 rounded-full bg-blue-50 blur-3xl" />
        </div>
        <div className="animate-[fadeIn_0.5s_ease-out]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 ring-1 ring-inset ring-blue-100">
            <Sparkles size={12} />
            Mitra Logistik Terpadu
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-[2.75rem]">
            Solusi Pengiriman Barang yang Rapi, Terkoordinasi, dan{" "}
            <span className="text-blue-700">Bisa Diandalkan</span>
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
            PT Gangsar Mitra Suatama menghadirkan layanan logistik antar kota yang dikelola secara
            profesional oleh tim operasional kami sendiri, didukung sistem digital agar setiap
            proses berjalan konsisten dan terdokumentasi.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate("/kontak")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
            >
              Hubungi Kami
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate("/cek-ongkir")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
            >
              <Calculator size={16} />
              Cek Ongkir
            </button>
            <button
              onClick={() => scrollTo("layanan")}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Pelajari Layanan Kami
            </button>
          </div>
        </div>

        <div className="relative animate-[fadeIn_0.6s_ease-out]">
          <img
            src={heroImage}
            alt="Serah terima paket antara kurir dan penerima"
            className="aspect-[4/3] w-full rounded-2xl border border-slate-200 object-cover shadow-sm"
          />
          <div className="absolute -bottom-5 left-4 right-4 rounded-xl border border-slate-200 bg-white p-4 shadow-md sm:left-6 sm:right-auto sm:w-64">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <MapPinned size={17} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Cakupan layanan</p>
                <p className="text-sm font-semibold text-slate-900">{COMPANY_STATS.kotaTerjangkau} kota di Indonesia</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="tentang" className="mt-16 scroll-mt-20 sm:mt-20">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-900 text-white">
              <Building2 size={19} />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl">Tentang Kami</h2>
          </div>
          <div className="lg:col-span-2">
            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
              <strong className="text-slate-800">PT Gangsar Mitra Suatama</strong> adalah
              perusahaan jasa logistik dan pengiriman barang yang melayani rute antar kota di
              Indonesia. Kami hadir untuk menjawab kebutuhan bisnis dan individu akan layanan
              pengiriman yang terkoordinasi rapi, dengan proses kerja yang jelas di setiap
              tahapnya.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              Operasional kami dijalankan oleh tim internal yang menangani langsung setiap
              pengiriman - mulai dari penerimaan barang, koordinasi armada, hingga serah terima ke
              penerima - didukung sistem digital agar prosesnya konsisten dan terdokumentasi
              dengan baik. Kami berkomitmen menghadirkan layanan pengiriman yang transparan dan
              mudah dipantau, sehingga customer tidak perlu lagi menghubungi tim secara manual
              untuk mengetahui posisi barangnya.
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {COMPANY_VALUES.map((v) => (
            <div key={v.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
                <v.icon size={18} />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">{v.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="layanan" className="mt-16 scroll-mt-20 sm:mt-20">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Layanan Kami</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 sm:text-base">
            Solusi pengiriman menyeluruh, dari penerimaan barang hingga sampai ke tangan penerima.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <div
              key={s.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
                <s.icon size={19} />
              </div>
              <p className="mt-3.5 text-sm font-semibold text-slate-900">{s.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{s.desc}</p>
              <p className="mt-3 text-[11px] font-medium text-emerald-700">{s.benefit}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Solusi & Teknologi */}
      <section className="mt-16 sm:mt-20">
        <div className="rounded-2xl bg-blue-50/60 p-6 sm:p-10">
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Solusi &amp; Teknologi Kami</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 sm:text-base">
              Sistem digital yang menghubungkan pelanggan, tim operasional, dan armada dalam satu
              alur kerja.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TECHNOLOGY.map((t) => (
              <div key={t.title} className="relative rounded-xl bg-white p-5 shadow-sm">
                <span className="text-[11px] font-bold tracking-wide text-blue-200">{t.number}</span>
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-900 text-white">
                  <t.icon size={18} />
                </div>
                <p className="mt-3.5 text-sm font-semibold text-slate-900">{t.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section id="keunggulan" className="mt-16 scroll-mt-20 sm:mt-20">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Keunggulan Kami</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 sm:text-base">
            Prinsip kerja yang kami pegang di setiap layanan pengiriman.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_CHOOSE_US.map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
                <f.icon size={18} />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">{f.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats / trust */}
      <section className="mt-16 sm:mt-20">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Kapasitas Layanan Kami</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 sm:text-base">
            Ringkasan operasional layanan kami hingga saat ini.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Pengiriman Tercatat" value={COMPANY_STATS.totalPengiriman} icon={Package} accent="bg-blue-100 text-blue-700" />
          <StatCard label="Kota Terjangkau" value={COMPANY_STATS.kotaTerjangkau} icon={MapPinned} accent="bg-amber-100 text-amber-700" />
          <StatCard label="Armada Truck" value={COMPANY_STATS.armadaTruck} icon={Truck} accent="bg-violet-100 text-violet-700" />
        </div>
      </section>

      {/* Trust strip */}
      <section className="mt-16 sm:mt-20">
        <div className="grid grid-cols-1 gap-4 border-t border-slate-200 pt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {TRUST_STRIP.map((t) => (
            <div key={t.label} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-900 text-white">
                <t.icon size={17} />
              </div>
              <p className="text-sm font-medium text-slate-700">{t.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 rounded-2xl bg-blue-900 px-6 py-10 text-center text-white sm:mt-20 sm:py-14">
        <p className="text-xl font-bold sm:text-2xl">Konsultasikan Kebutuhan Pengiriman Anda</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-blue-100 sm:text-base">
          Tim kami siap membantu merancang solusi pengiriman yang sesuai dengan kebutuhan bisnis
          Anda.
        </p>
        <button
          onClick={() => navigate("/kontak")}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-900 shadow-sm transition-colors hover:bg-blue-50"
        >
          Hubungi Kami
          <ArrowRight size={16} />
        </button>
      </section>
    </PublicLayout>
  );
}
