import { ArrowLeft, CheckCircle2, ImagePlus, MapPin, Send, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { StatusBadge } from "../../components/StatusBadge";
import { useShipments } from "../../store/ShipmentContext";
import type { TimelineEventType, TrackingUpdateFormData } from "../../types";
import { formatTanggalPanjang, nowHHMM, todayISO } from "../../utils/format";
import { getAllowedNextEvents } from "../../utils/status";

const TRUCK_TYPES = ["Wingbox", "CDD", "Box", "Pickup", "Fuso", "Tronton"];

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

export default function UpdateTracking() {
  const { awb } = useParams<{ awb: string }>();
  const { getByAwb, addTrackingUpdate } = useShipments();
  const navigate = useNavigate();
  const shipment = getByAwb(awb ?? "");
  const allowedOptions = shipment ? getAllowedNextEvents(shipment.status) : [];

  const [type, setType] = useState<TimelineEventType>(allowedOptions[0] ?? "Transit");
  const [lokasi, setLokasi] = useState("");
  const [tanggal, setTanggal] = useState(todayISO());
  const [jam, setJam] = useState(nowHHMM());
  const [keterangan, setKeterangan] = useState("");
  const [foto, setFoto] = useState<string[]>([]);
  const [nomorUnit, setNomorUnit] = useState(shipment?.truck.nomorUnit ?? "");
  const [jenisTruck, setJenisTruck] = useState(shipment?.truck.jenis ?? "Wingbox");
  const [driver, setDriver] = useState(shipment?.truck.driver ?? "");
  const [submitted, setSubmitted] = useState(false);

  if (!shipment) {
    return (
      <AdminLayout>
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-500">AWB "{awb}" tidak ditemukan.</p>
          <Link to="/admin/pengiriman" className="mt-3 inline-block text-sm text-blue-700 hover:underline">
            Kembali ke Data Pengiriman
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const locked = shipment.status === "Selesai / Terkirim";

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setFoto((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const data: TrackingUpdateFormData = {
      awb: shipment!.awb,
      type,
      lokasi,
      tanggal,
      jam,
      keterangan,
      foto,
      nomorUnit: nomorUnit || undefined,
      jenisTruck: nomorUnit ? jenisTruck : undefined,
      driver: driver || undefined,
    };
    addTrackingUpdate(data);
    setSubmitted(true);
    setTimeout(() => navigate(`/tracking/${shipment!.awb}`), 1100);
  }

  return (
    <AdminLayout>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={15} /> Kembali
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Update Tracking</h1>
          <p className="mt-1 font-mono text-sm text-slate-500">{shipment.awb}</p>
        </div>
        <StatusBadge status={shipment.status} />
      </div>

      {locked ? (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <CheckCircle2 className="mx-auto mb-2 text-emerald-600" size={28} />
          <p className="font-semibold text-emerald-800">Pengiriman ini sudah Selesai/Terkirim</p>
          <p className="mt-1 text-sm text-emerald-700">
            Sesuai kebijakan (FR-17), riwayat pengiriman yang sudah closing dikunci dan tidak dapat
            diubah lagi untuk menjaga validitas data.
          </p>
          <Link
            to={`/tracking/${shipment.awb}`}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            <MapPin size={15} /> Lihat Tracking
          </Link>
        </div>
      ) : submitted ? (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <CheckCircle2 className="mx-auto mb-2 text-emerald-600" size={28} />
          <p className="font-semibold text-emerald-800">Update tracking berhasil disimpan</p>
          <p className="mt-1 text-sm text-emerald-700">Mengarahkan ke halaman tracking publik...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">Status</span>
              <select
                className={inputClass}
                value={type}
                onChange={(e) => setType(e.target.value as TimelineEventType)}
              >
                {allowedOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span className="mt-1.5 block text-[11px] text-slate-400">
                Hanya status lanjutan dari status saat ini ({shipment.status}) yang bisa dipilih -
                pipeline tidak bisa dibuat mundur.
              </span>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">Lokasi</span>
              <input
                required
                className={inputClass}
                placeholder="Contoh: Semarang"
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">Tanggal</span>
              <input
                required
                type="date"
                className={inputClass}
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">Jam</span>
              <input
                required
                type="time"
                className={inputClass}
                value={jam}
                onChange={(e) => setJam(e.target.value)}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">Keterangan</span>
              <textarea
                required
                rows={3}
                className={inputClass}
                placeholder="Keterangan status perjalanan"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">Foto</span>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex h-20 w-20 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-500">
                  <ImagePlus size={18} />
                  <span className="text-[10px] font-medium">Unggah</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
                {foto.map((src, i) => (
                  <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-slate-200">
                    <img src={src} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFoto((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </label>

            <div className="sm:col-span-2 border-t border-slate-100 pt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Informasi Truck {type === "Transfer Unit" && "(Unit Baru)"}
              </p>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">Nomor Unit Truck</span>
              <input
                className={inputClass}
                placeholder="B 9123 XYZ"
                value={nomorUnit}
                onChange={(e) => setNomorUnit(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">Jenis Truck</span>
              <select className={inputClass} value={jenisTruck} onChange={(e) => setJenisTruck(e.target.value)}>
                {TRUCK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">Driver</span>
              <input
                className={inputClass}
                placeholder="Nama driver"
                value={driver}
                onChange={(e) => setDriver(e.target.value)}
              />
            </label>
          </div>

          {type === "Transfer Unit" && (
            <p className="mt-3 rounded-lg bg-violet-50 px-3 py-2 text-xs text-violet-700">
              Unit sebelumnya ({shipment.truck.nomorUnit}) akan otomatis tercatat sebagai unit yang
              digantikan pada timeline publik.
            </p>
          )}

          <div className="mt-5 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-500">
            Update ini akan langsung muncul di halaman tracking publik:{" "}
            <span className="font-medium text-slate-700">
              {formatTanggalPanjang(tanggal)} · {jam} WIB
            </span>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
            >
              <Send size={15} /> Simpan Update
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
