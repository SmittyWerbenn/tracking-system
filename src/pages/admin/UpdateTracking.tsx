import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ImagePlus,
  MapPin,
  Pencil,
  Save,
  Send,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { SearchableSelect } from "../../components/SearchableSelect";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { StatusBadge } from "../../components/StatusBadge";
import { useLocations } from "../../store/LocationContext";
import { useFleet } from "../../store/FleetContext";
import { useShipments } from "../../store/ShipmentContext";
import type { Shipment, TimelineEventType, TrackingUpdateFormData, UpdateShipmentInfoData } from "../../types";
import { compressImage } from "../../utils/compressImage";
import { formatTanggalJam, formatTanggalPanjang, nowHHMM, todayISO } from "../../utils/format";
import { getAllowedNextEvents } from "../../utils/status";

const CUSTOM_LOKASI_VALUE = "__custom__";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

export default function UpdateTracking() {
  const { awb } = useParams<{ awb: string }>();
  const { getByAwb, addTrackingUpdate, updateShipmentInfo, updatePodPhoto } = useShipments();
  const { trucksWithDriver } = useFleet();
  const { activeTitikLokasi } = useLocations();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initializedFor = useRef<string | null>(null);

  const [type, setType] = useState<TimelineEventType>("Transit");
  const [titikId, setTitikId] = useState("");
  const [customLokasi, setCustomLokasi] = useState("");
  const [tanggal, setTanggal] = useState(todayISO());
  const [jam, setJam] = useState(nowHHMM());
  const [keterangan, setKeterangan] = useState("");
  const [namaPenerima, setNamaPenerima] = useState("");
  const [foto, setFoto] = useState<string[]>([]);
  const [fotoBarangDiterima, setFotoBarangDiterima] = useState<string | null>(null);
  const [fotoSuratJalan, setFotoSuratJalan] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [truckId, setTruckId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [editInfoOpen, setEditInfoOpen] = useState(false);
  const [editPengirim, setEditPengirim] = useState({ nama: "", telepon: "", email: "" });
  const [editPenerima, setEditPenerima] = useState({ nama: "", telepon: "", email: "" });
  const [editKotaAsal, setEditKotaAsal] = useState("");
  const [editAlamatAsal, setEditAlamatAsal] = useState("");
  const [editKotaTujuan, setEditKotaTujuan] = useState("");
  const [editAlamatTujuan, setEditAlamatTujuan] = useState("");
  const [editSaved, setEditSaved] = useState(false);
  const [editFormError, setEditFormError] = useState<string | null>(null);

  const [podPhotoError, setPodPhotoError] = useState<string | null>(null);
  const [podPhotoSaved, setPodPhotoSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getByAwb(awb ?? "").then((s) => {
      if (cancelled) return;
      setShipment(s);
      setIsLoading(false);
      if (s && initializedFor.current !== s.awb) {
        initializedFor.current = s.awb;
        const allowedOptions = getAllowedNextEvents(s.status);
        setType(allowedOptions[0] ?? "Transit");
        setNamaPenerima(s.penerima.nama);
        setTruckId(s.truckId ?? "");
        setEditPengirim(s.pengirim);
        setEditPenerima(s.penerima);
        setEditKotaAsal(s.kotaAsal);
        setEditAlamatAsal(s.alamatAsal);
        setEditKotaTujuan(s.kotaTujuan);
        setEditAlamatTujuan(s.alamatTujuan);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [awb]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-900" />
        </div>
      </AdminLayout>
    );
  }

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

  const allowedOptions = getAllowedNextEvents(shipment.status);
  const locked = shipment.status === "Selesai / Terkirim";
  const POD_EDIT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
  const deliveredEvent = [...shipment.timeline].reverse().find((e) => e.type === "Selesai / Terkirim");
  const deliveredAtMs = deliveredEvent?.inputAt ? new Date(deliveredEvent.inputAt).getTime() : null;
  const podEditDeadlineMs = deliveredAtMs !== null ? deliveredAtMs + POD_EDIT_WINDOW_MS : null;
  const nowMs = new Date().getTime();
  const canEditPodPhoto = Boolean(shipment.pod && podEditDeadlineMs !== null && nowMs < podEditDeadlineMs);
  const podEditDaysLeft =
    podEditDeadlineMs !== null ? Math.max(0, Math.ceil((podEditDeadlineMs - nowMs) / (24 * 60 * 60 * 1000))) : 0;
  const deliveredAtLabel = deliveredEvent ? formatTanggalJam(deliveredEvent.tanggal, deliveredEvent.jam) : null;

  function handlePodPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPodPhotoError(null);
    setPodPhotoSaved(false);
    compressImage(file)
      .then(async (dataUrl) => {
        await updatePodPhoto(shipment!.awb, dataUrl);
        setPodPhotoSaved(true);
        setTimeout(() => setPodPhotoSaved(false), 2500);
      })
      .catch(() => setPodPhotoError("Gagal memproses foto. Coba foto lain."));
  }
  const lokasiOptions = [
    ...activeTitikLokasi.map((t) => ({ value: t.id, label: t.namaKota, description: `${t.jenis} - ${t.provinsi}` })),
    { value: CUSTOM_LOKASI_VALUE, label: "Lainnya (ketik manual)" },
  ];
  const truckOptions = trucksWithDriver.map((t) => ({
    value: t.id,
    label: `${t.nomorUnit} - ${t.jenis}`,
    description: t.driver ? `Driver: ${t.driver.nama}` : undefined,
  }));
  const selectedTruck = trucksWithDriver.find((t) => t.id === truckId);
  const isSelesai = type === "Selesai / Terkirim";
  const resolvedLokasi = isSelesai
    ? shipment.kotaTujuan
    : titikId === CUSTOM_LOKASI_VALUE
      ? customLokasi
      : (activeTitikLokasi.find((t) => t.id === titikId)?.namaKota ?? "");
  const kotaOptions = activeTitikLokasi.map((k) => ({
    value: k.namaKota,
    label: k.namaKota,
    description: `${k.jenis} - ${k.provinsi}`,
  }));

  async function handleSaveInfo(e: FormEvent) {
    e.preventDefault();
    if (!editKotaAsal || !editKotaTujuan) {
      setEditFormError("Pilih kota asal dan kota tujuan terlebih dahulu.");
      return;
    }
    setEditFormError(null);
    const data: UpdateShipmentInfoData = {
      pengirim: editPengirim,
      penerima: editPenerima,
      alamatAsal: editAlamatAsal,
      kotaAsal: editKotaAsal,
      alamatTujuan: editAlamatTujuan,
      kotaTujuan: editKotaTujuan,
    };
    const result = await updateShipmentInfo(shipment!.awb, data);
    if (result.ok) {
      setEditSaved(true);
      setTimeout(() => setEditSaved(false), 2500);
    } else {
      setEditFormError(result.error);
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setPhotoError(null);
    files.forEach((file) => {
      compressImage(file)
        .then((dataUrl) => setFoto((prev) => [...prev, dataUrl]))
        .catch(() => setPhotoError("Gagal memproses salah satu foto. Coba lagi."));
    });
  }

  function handleFotoBarangDiterimaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    compressImage(file)
      .then(setFotoBarangDiterima)
      .catch(() => setPhotoError("Gagal memproses foto barang diterima. Coba lagi."));
  }

  function handleFotoSuratJalanChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    compressImage(file)
      .then(setFotoSuratJalan)
      .catch(() => setPhotoError("Gagal memproses foto surat jalan. Coba lagi."));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isSelesai && !resolvedLokasi) {
      setFormError("Pilih atau isi lokasi terlebih dahulu.");
      return;
    }
    if (isSelesai && !namaPenerima.trim()) {
      setFormError("Isi nama penerima barang terlebih dahulu.");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    const data: TrackingUpdateFormData = {
      awb: shipment!.awb,
      type,
      lokasi: resolvedLokasi,
      titikId: isSelesai || titikId === CUSTOM_LOKASI_VALUE ? undefined : titikId || undefined,
      tanggal,
      jam,
      keterangan,
      // Order matters here: addTrackingUpdate takes foto[0] as bukti barang
      // diterima and foto[1] (falling back to foto[0]) as bukti surat
      // jalan - keep these two labeled uploads in that exact order.
      foto: isSelesai
        ? [fotoBarangDiterima, fotoSuratJalan].filter((f): f is string => !!f)
        : foto,
      truckId: truckId || undefined,
      namaPenerima: isSelesai ? namaPenerima.trim() : undefined,
    };
    const result = await addTrackingUpdate(data);
    setSubmitting(false);
    if (result.ok) {
      setSubmitted(true);
      setTimeout(() => navigate(`/tracking/${shipment!.awb}`), 1100);
    } else {
      setFormError(result.error);
    }
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

      {!locked && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setEditInfoOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left sm:px-6"
          >
            <span className="flex items-center gap-2">
              <Pencil size={16} className="text-blue-900" />
              <span className="text-sm font-semibold text-slate-800">Data Pengiriman</span>
              <span className="hidden text-xs text-slate-400 sm:inline">(Pengirim, Penerima, Rute)</span>
            </span>
            <ChevronDown
              size={16}
              className={`shrink-0 text-slate-400 transition-transform ${editInfoOpen ? "rotate-180" : ""}`}
            />
          </button>

          {!editInfoOpen && (
            <div className="grid grid-cols-1 gap-4 border-t border-slate-100 px-5 py-4 text-sm sm:grid-cols-3 sm:px-6">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Pengirim</p>
                <p className="mt-0.5 font-medium text-slate-800">{shipment.pengirim.nama}</p>
                <p className="text-xs text-slate-500">{shipment.pengirim.telepon}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Penerima</p>
                <p className="mt-0.5 font-medium text-slate-800">{shipment.penerima.nama}</p>
                <p className="text-xs text-slate-500">{shipment.penerima.telepon}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Rute</p>
                <p className="mt-0.5 font-medium text-slate-800">
                  {shipment.kotaAsal} &rarr; {shipment.kotaTujuan}
                </p>
              </div>
            </div>
          )}

          {editInfoOpen && (
            <form onSubmit={handleSaveInfo} className="border-t border-slate-100 px-5 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <User size={13} /> Pengirim
                  </p>
                  <div className="flex flex-col gap-3">
                    <input
                      required
                      className={inputClass}
                      placeholder="Nama lengkap"
                      value={editPengirim.nama}
                      onChange={(e) => setEditPengirim((p) => ({ ...p, nama: e.target.value }))}
                    />
                    <input
                      required
                      className={inputClass}
                      placeholder="08xx-xxxx-xxxx"
                      value={editPengirim.telepon}
                      onChange={(e) => setEditPengirim((p) => ({ ...p, telepon: e.target.value }))}
                    />
                    <input
                      required
                      type="email"
                      className={inputClass}
                      placeholder="nama@email.com"
                      value={editPengirim.email}
                      onChange={(e) => setEditPengirim((p) => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <User size={13} /> Penerima
                  </p>
                  <div className="flex flex-col gap-3">
                    <input
                      required
                      className={inputClass}
                      placeholder="Nama lengkap"
                      value={editPenerima.nama}
                      onChange={(e) => setEditPenerima((p) => ({ ...p, nama: e.target.value }))}
                    />
                    <input
                      required
                      className={inputClass}
                      placeholder="08xx-xxxx-xxxx"
                      value={editPenerima.telepon}
                      onChange={(e) => setEditPenerima((p) => ({ ...p, telepon: e.target.value }))}
                    />
                    <input
                      required
                      type="email"
                      className={inputClass}
                      placeholder="nama@email.com"
                      value={editPenerima.email}
                      onChange={(e) => setEditPenerima((p) => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-5">
                <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <MapPin size={13} /> Rute
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-slate-600">Kota Asal</span>
                    <SearchableSelect
                      options={kotaOptions}
                      value={editKotaAsal}
                      onChange={setEditKotaAsal}
                      placeholder="Pilih kota asal"
                      emptyLabel="Kota tidak ditemukan."
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-slate-600">Kota Tujuan</span>
                    <SearchableSelect
                      options={kotaOptions}
                      value={editKotaTujuan}
                      onChange={setEditKotaTujuan}
                      placeholder="Pilih kota tujuan"
                      emptyLabel="Kota tidak ditemukan."
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-slate-600">Alamat Asal</span>
                    <input
                      required
                      className={inputClass}
                      placeholder="Jl. Raya ... No. ..."
                      value={editAlamatAsal}
                      onChange={(e) => setEditAlamatAsal(e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-slate-600">Alamat Tujuan</span>
                    <input
                      required
                      className={inputClass}
                      placeholder="Jl. Raya ... No. ..."
                      value={editAlamatTujuan}
                      onChange={(e) => setEditAlamatTujuan(e.target.value)}
                    />
                  </label>
                </div>
              </div>

              {editFormError && (
                <p className="mt-4 text-sm font-medium text-red-600">{editFormError}</p>
              )}
              {editSaved && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-700">
                  <CheckCircle2 size={16} /> Perubahan disimpan.
                </div>
              )}

              <div className="mt-5 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
                >
                  <Save size={15} /> Simpan Perubahan
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {locked ? (
        <>
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

          {shipment.pod && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                <ImagePlus size={16} className="text-blue-900" /> Foto Barang Diterima
              </p>
              {canEditPodPhoto ? (
                <p className="mb-4 text-xs text-slate-500">
                  Bisa diganti dalam 30 hari sejak pengiriman selesai
                  {deliveredAtLabel && (
                    <>
                      {" "}
                      (<span className="font-medium text-slate-700">{deliveredAtLabel}</span>)
                    </>
                  )}
                  . Sisa waktu: <span className="font-medium text-slate-700">{podEditDaysLeft} hari</span>.
                </p>
              ) : (
                <p className="mb-4 text-xs text-slate-500">
                  Batas waktu 30 hari untuk mengganti foto sudah lewat
                  {deliveredAtLabel && (
                    <>
                      {" "}
                      (paket diterima pada{" "}
                      <span className="font-medium text-slate-700">{deliveredAtLabel}</span>)
                    </>
                  )}
                  .
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4">
                {shipment.pod.fotoBarang ? (
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-slate-200">
                    <img
                      src={shipment.pod.fotoBarang}
                      alt="Foto barang diterima"
                      className="h-full w-full object-cover"
                    />
                    {canEditPodPhoto && (
                      <button
                        type="button"
                        onClick={() => updatePodPhoto(shipment!.awb, undefined)}
                        title="Hapus foto"
                        className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 text-center text-[10px] text-slate-400">
                    Belum ada foto
                  </div>
                )}
                {canEditPodPhoto && (
                  <label className="flex h-24 w-24 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-500">
                    <ImagePlus size={18} />
                    <span className="text-[10px] font-medium">
                      {shipment.pod.fotoBarang ? "Ganti Foto" : "Tambah Foto"}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePodPhotoChange} />
                  </label>
                )}
              </div>

              {podPhotoError && <p className="mt-3 text-xs font-medium text-red-600">{podPhotoError}</p>}
              {podPhotoSaved && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-700">
                  <CheckCircle2 size={16} /> Foto berhasil diperbarui.
                </div>
              )}
            </div>
          )}
        </>
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
            {isSelesai ? (
              <div className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-600">Lokasi</span>
                <div className={`${inputClass} bg-slate-50 text-slate-600`}>{shipment.kotaTujuan}</div>
                <span className="mt-1.5 block text-[11px] text-slate-400">
                  Otomatis memakai kota tujuan pengiriman, tidak perlu diisi ulang.
                </span>
              </div>
            ) : (
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-600">Lokasi / Titik Transit</span>
                <SearchableSelect
                  options={lokasiOptions}
                  value={titikId}
                  onChange={setTitikId}
                  placeholder="Pilih lokasi"
                  emptyLabel="Lokasi tidak ditemukan."
                />
                {titikId === CUSTOM_LOKASI_VALUE && (
                  <input
                    required
                    className={`${inputClass} mt-2`}
                    placeholder="Ketik nama lokasi"
                    value={customLokasi}
                    onChange={(e) => setCustomLokasi(e.target.value)}
                  />
                )}
              </label>
            )}
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

            {isSelesai && (
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-medium text-slate-600">
                  Nama Penerima (Diterima oleh)
                </span>
                <input
                  required
                  className={inputClass}
                  placeholder="Nama orang yang menerima/menandatangani barang"
                  value={namaPenerima}
                  onChange={(e) => setNamaPenerima(e.target.value)}
                />
                <span className="mt-1.5 block text-[11px] text-slate-400">
                  Default terisi nama penerima ({shipment.penerima.nama}), ubah jika barang diterima
                  oleh orang lain (misalnya rekan kerja atau satpam).
                </span>
              </label>
            )}

            {isSelesai ? (
              <div className="grid grid-cols-1 gap-4 sm:col-span-2 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Foto Barang Diterima</span>
                  <span className="mb-1.5 block text-[11px] text-slate-400">
                    Kondisi barang saat diterima di lokasi tujuan.
                  </span>
                  {fotoBarangDiterima ? (
                    <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-slate-200">
                      <img src={fotoBarangDiterima} alt="Foto barang diterima" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFotoBarangDiterima(null)}
                        className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-500">
                      <ImagePlus size={18} />
                      <span className="text-[10px] font-medium">Unggah</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFotoBarangDiterimaChange} />
                    </label>
                  )}
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Foto Surat Jalan</span>
                  <span className="mb-1.5 block text-[11px] text-slate-400">
                    Surat jalan yang ditandatangani/dicap penerima.
                  </span>
                  {fotoSuratJalan ? (
                    <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-slate-200">
                      <img src={fotoSuratJalan} alt="Foto surat jalan" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFotoSuratJalan(null)}
                        className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-500">
                      <ImagePlus size={18} />
                      <span className="text-[10px] font-medium">Unggah</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFotoSuratJalanChange} />
                    </label>
                  )}
                </label>
                {photoError && <p className="text-xs font-medium text-red-600 sm:col-span-2">{photoError}</p>}
              </div>
            ) : (
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
                {photoError && <p className="mt-1.5 text-xs font-medium text-red-600">{photoError}</p>}
              </label>
            )}

            <div className="sm:col-span-2 border-t border-slate-100 pt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Informasi Truck {type === "Transfer Unit" && "(Unit Baru)"}
              </p>
            </div>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">Pilih Unit Truck</span>
              <SearchableSelect
                options={truckOptions}
                value={truckId}
                onChange={setTruckId}
                placeholder="Pilih Unit Truck"
                emptyLabel="Tidak ada unit truck."
              />
            </label>
            {selectedTruck && (
              <div className="sm:col-span-2 flex flex-wrap items-center gap-4 rounded-lg bg-slate-50 px-3.5 py-3 text-sm">
                <span className="font-medium text-slate-700">{selectedTruck.nomorUnit}</span>
                <span className="text-slate-500">{selectedTruck.jenis}</span>
                <span className="text-slate-500">Driver: {selectedTruck.driver?.nama ?? "-"}</span>
              </div>
            )}
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

          <div className="mt-5 flex flex-col items-end gap-2.5">
            {formError && <p className="text-sm font-medium text-red-600">{formError}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:opacity-60"
            >
              <Send size={15} /> Simpan Update
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
