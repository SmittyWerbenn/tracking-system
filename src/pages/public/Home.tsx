import {
  ArrowRight,
  Building2,
  Camera,
  CheckCircle2,
  FileText,
  Layers,
  MapPinned,
  Package,
  PackageSearch,
  Route,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { PublicLayout } from "../../components/layout/PublicLayout";
import { StatCard } from "../../components/StatCard";
import { StatusBadge } from "../../components/StatusBadge";
import { useShipments } from "../../store/ShipmentContext";
import { photos } from "../../utils/photos";
import { useDocumentTitle } from "../../utils/useDocumentTitle";

const SERVICES = [
  {
    icon: Truck,
    title: "Pengiriman Antar Kota",
    desc: "Layanan pengiriman darat ke berbagai kota tujuan, didukung armada truck sesuai kebutuhan muatan Anda.",
    benefit: "Jangkauan luas, armada bervariasi",
  },
  {
    icon: FileText,
    title: "Resi Digital (AWB)",
    desc: "Setiap pengiriman otomatis mendapat nomor resi unik beserta notifikasi email berisi detail dan link tracking.",
    benefit: "Dokumentasi rapi & mudah diakses",
  },
  {
    icon: MapPinned,
    title: "Tracking Real-Time",
    desc: "Pantau status dan lokasi barang kapan saja melalui halaman tracking publik, tanpa perlu login.",
    benefit: "Transparansi penuh untuk customer",
  },
  {
    icon: Camera,
    title: "Proof of Delivery",
    desc: "Foto barang diterima dan surat jalan yang telah ditandatangani tersimpan digital sebagai bukti serah terima.",
    benefit: "Validitas & kepercayaan terjaga",
  },
];

const WHY_CHOOSE_US = [
  {
    icon: MapPinned,
    title: "Real-Time",
    desc: "Pantau lokasi dan status kiriman kapan saja, langsung dari browser tanpa perlu login.",
  },
  {
    icon: Camera,
    title: "Dokumentasi Foto",
    desc: "Setiap perpindahan barang dilengkapi foto barang, unit truck, dan bukti serah terima.",
  },
  {
    icon: ShieldCheck,
    title: "Data Tervalidasi",
    desc: "Setiap update status diinput oleh tim internal kami sehingga informasi akurat dan terpercaya.",
  },
  {
    icon: Layers,
    title: "Sistem Terintegrasi",
    desc: "Update status dari tim operasional langsung tampil ke halaman tracking customer secara real-time.",
  },
];

const HOW_IT_WORKS = [
  { icon: Search, title: "Masukkan Nomor AWB", desc: "Ketik nomor resi yang Anda terima melalui email atau resi fisik." },
  { icon: PackageSearch, title: "Sistem Menampilkan Detail", desc: "Data pengiriman, status, dan rute perjalanan langsung ditampilkan." },
  { icon: Route, title: "Pantau Riwayat Perjalanan", desc: "Lihat setiap perpindahan barang lengkap dengan foto dan unit truck." },
  { icon: CheckCircle2, title: "Bukti Serah Terima", desc: "Saat status selesai, foto dan surat jalan penerimaan dapat dilihat." },
];

export default function Home() {
  useDocumentTitle("Beranda");
  const [awb, setAwb] = useState("");
  const navigate = useNavigate();
  const { shipments } = useShipments();

  const stats = useMemo(() => {
    const kota = new Set(shipments.flatMap((s) => [s.kotaAsal, s.kotaTujuan]));
    const armada = new Set(shipments.map((s) => s.truck.nomorUnit));
    const selesai = shipments.filter((s) => s.status === "Selesai / Terkirim").length;
    return {
      totalPengiriman: shipments.length,
      kotaTerjangkau: kota.size,
      armadaTruck: armada.size,
      selesai,
    };
  }, [shipments]);

  function handleTrack(e: FormEvent) {
    e.preventDefault();
    const trimmed = awb.trim();
    navigate(trimmed ? `/tracking/${trimmed}` : "/tracking");
  }

  return (
    <PublicLayout wide>
      {/* Hero */}
      <section className="grid grid-cols-1 items-center gap-8 py-6 sm:py-10 lg:grid-cols-2 lg:gap-12">
        <div className="animate-[fadeIn_0.5s_ease-out]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 ring-1 ring-inset ring-blue-100">
            PT Gangsar Mitra Sautama
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-[2.75rem]">
            Pengiriman Barang yang Transparan, dari Gudang hingga Tujuan
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
            Kami menghadirkan layanan logistik antar kota dengan resi digital dan tracking
            real-time, sehingga Anda selalu tahu posisi barang Anda — tanpa perlu menghubungi
            siapa pun secara manual.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate("/tracking")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
            >
              <Search size={16} />
              Lacak Paket Saya
            </button>
            <button
              onClick={() => navigate("/tentang")}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Tentang Kami
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="relative animate-[fadeIn_0.6s_ease-out]">
          <img
            src={photos.truckWingboxA}
            alt="Armada truck pengiriman PT Gangsar Mitra Sautama di jalan raya"
            className="aspect-[4/3] w-full rounded-2xl border border-slate-200 object-cover shadow-sm"
          />
          <div className="absolute -bottom-5 left-4 right-4 rounded-xl border border-slate-200 bg-white p-4 shadow-md sm:left-6 sm:right-auto sm:w-64">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <PackageSearch size={17} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Pengiriman tercatat</p>
                <p className="text-sm font-semibold text-slate-900">{stats.totalPengiriman} AWB dalam sistem</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="mt-16 grid grid-cols-1 items-start gap-8 sm:mt-20 lg:grid-cols-3">
        <div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-900 text-white">
            <Building2 size={19} />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl">Tentang Kami</h2>
        </div>
        <div className="lg:col-span-2">
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            <strong className="text-slate-800">PT Gangsar Mitra Sautama</strong> adalah perusahaan
            jasa logistik dan pengiriman barang yang melayani rute antar kota di Indonesia. Kami
            menyelesaikan masalah utama pengiriman konvensional: minimnya transparansi status
            barang selama perjalanan.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            Melalui Sistem Tracking &amp; Resi Digital, setiap pengiriman memiliki nomor resi (AWB)
            yang dapat dilacak kapan saja — lengkap dengan status, lokasi, foto dokumentasi, unit
            truck yang membawa barang, hingga bukti serah terima.
          </p>
          <button
            onClick={() => navigate("/tentang")}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-800 hover:underline"
          >
            Selengkapnya tentang kami
            <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Services */}
      <section className="mt-16 sm:mt-20">
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

      {/* Why choose us */}
      <section className="mt-16 sm:mt-20">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Kenapa Memilih Kami</h2>
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

      {/* Tracking highlight */}
      <section className="mt-16 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-6 sm:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-900 text-white">
              <PackageSearch size={22} />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl">
              Lacak Paket Anda Sekarang
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Masukkan nomor resi (AWB) untuk memantau status pengiriman Anda secara real-time —
              tanpa perlu login.
            </p>

            <form onSubmit={handleTrack} className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <input
                value={awb}
                onChange={(e) => setAwb(e.target.value)}
                placeholder="Masukkan Nomor Resi / AWB"
                aria-label="Nomor Resi / AWB"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="submit"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
              >
                <Search size={16} />
                Track Package
              </button>
            </form>

            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Contoh AWB (demo)
              </p>
              <div className="flex flex-wrap gap-2">
                {shipments.slice(0, 3).map((s) => (
                  <button
                    key={s.awb}
                    onClick={() => navigate(`/tracking/${s.awb}`)}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-left text-xs transition-colors hover:border-blue-300 hover:bg-blue-50"
                  >
                    <span className="font-mono font-medium text-slate-700">{s.awb}</span>
                    <StatusBadge status={s.status} size="sm" />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden bg-slate-100 lg:block">
            <img
              src={photos.transitLokasi}
              alt="Titik transit pengiriman barang"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mt-16 sm:mt-20">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Cara Kerja</h2>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.title} className="relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="absolute -top-3 left-5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-900 text-[11px] font-bold text-white">
                {i + 1}
              </span>
              <div className="mt-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
                <step.icon size={18} />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">{step.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats / trust */}
      <section className="mt-16 sm:mt-20">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Data Operasional Kami</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 sm:text-base">
            Ringkasan data pengiriman yang tercatat dalam sistem kami saat ini.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Pengiriman Tercatat" value={stats.totalPengiriman} icon={Package} accent="bg-blue-100 text-blue-700" />
          <StatCard label="Kota Terjangkau" value={stats.kotaTerjangkau} icon={MapPinned} accent="bg-amber-100 text-amber-700" />
          <StatCard label="Armada Truck" value={stats.armadaTruck} icon={Truck} accent="bg-violet-100 text-violet-700" />
          <StatCard label="Selesai Terkirim" value={stats.selesai} icon={CheckCircle2} accent="bg-emerald-100 text-emerald-700" />
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 rounded-2xl bg-blue-900 px-6 py-10 text-center text-white sm:mt-20 sm:py-14">
        <p className="text-xl font-bold sm:text-2xl">Siap Mengirim Barang Anda?</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-blue-100 sm:text-base">
          Buat resi digital dan pantau perjalanan barang Anda secara real-time bersama kami.
        </p>
        <button
          onClick={() => navigate("/tracking")}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-900 shadow-sm transition-colors hover:bg-blue-50"
        >
          <Search size={16} />
          Lacak Paket Sekarang
        </button>
      </section>
    </PublicLayout>
  );
}
