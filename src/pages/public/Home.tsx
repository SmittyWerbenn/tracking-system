import { Camera, MapPinned, Search, ShieldCheck, Truck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { PublicLayout } from "../../components/layout/PublicLayout";
import { StatusBadge } from "../../components/StatusBadge";
import { useShipments } from "../../store/ShipmentContext";

const FEATURES = [
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
];

export default function Home() {
  const [awb, setAwb] = useState("");
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();
  const { shipments, getByAwb } = useShipments();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = awb.trim();
    if (!trimmed) return;
    if (getByAwb(trimmed)) {
      setNotFound(false);
      navigate(`/tracking/${trimmed}`);
    } else {
      setNotFound(true);
    }
  }

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="flex flex-col items-center rounded-2xl bg-white px-4 py-10 text-center shadow-sm sm:py-14">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-900 text-white">
          <Truck size={26} />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900 sm:text-3xl">
          Lacak Pengiriman Anda
        </h1>
        <p className="mt-2 max-w-md text-sm text-slate-500 sm:text-base">
          Masukkan nomor resi untuk melihat status pengiriman Anda secara real-time.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 w-full max-w-md">
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <input
              value={awb}
              onChange={(e) => {
                setAwb(e.target.value);
                setNotFound(false);
              }}
              placeholder="Masukkan Nomor Resi / AWB"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
            >
              <Search size={16} />
              Lacak Sekarang
            </button>
          </div>
          {notFound && (
            <p className="mt-2 text-left text-xs font-medium text-red-600">
              Nomor AWB tidak ditemukan. Periksa kembali nomor resi Anda.
            </p>
          )}
        </form>

        <div className="mt-6 w-full max-w-md text-left">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Contoh AWB (demo)
          </p>
          <div className="flex flex-col gap-2">
            {shipments.slice(0, 3).map((s) => (
              <button
                key={s.awb}
                onClick={() => navigate(`/tracking/${s.awb}`)}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50"
              >
                <div>
                  <p className="font-mono text-sm font-medium text-slate-800">{s.awb}</p>
                  <p className="text-xs text-slate-500">
                    {s.kotaAsal} → {s.kotaTujuan}
                  </p>
                </div>
                <StatusBadge status={s.status} size="sm" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
              <f.icon size={18} />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900">{f.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Callout */}
      <section className="mt-8 rounded-2xl bg-blue-900 px-6 py-8 text-center text-white">
        <p className="text-lg font-semibold">Kirim barang Anda bersama kami</p>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-blue-100">
          Setiap pengiriman mendapat resi digital (AWB) dan akses tracking real-time untuk
          transparansi penuh perjalanan barang Anda.
        </p>
      </section>
    </PublicLayout>
  );
}
