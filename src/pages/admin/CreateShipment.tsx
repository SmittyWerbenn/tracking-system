import {
  AlertTriangle,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Mail,
  MapPin,
  Package,
  Truck,
  User,
  X,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { QRCode } from "../../components/QRCode";
import { SearchableSelect } from "../../components/SearchableSelect";
import { useFleet } from "../../store/FleetContext";
import { useLocations } from "../../store/LocationContext";
import { useSettings } from "../../store/SettingsContext";
import { useShipments } from "../../store/ShipmentContext";
import type { Shipment, ShipmentFormData } from "../../types";
import { compressImage } from "../../utils/compressImage";
import { photos } from "../../utils/photos";
import { sendTrackingEmail } from "../../utils/sendEmail";

const emptyForm: ShipmentFormData = {
  pengirim: { nama: "", telepon: "", email: "" },
  penerima: { nama: "", telepon: "", email: "" },
  alamatAsal: "",
  kotaAsal: "",
  alamatTujuan: "",
  kotaTujuan: "",
  deskripsiBarang: "",
  fotoBarang: undefined,
  truckId: "",
};

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof User;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Icon size={17} className="text-blue-900" />
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
  full = false,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

export default function CreateShipment() {
  const { createShipment, markEmailSent } = useShipments();
  const { trucksWithDriver } = useFleet();
  const { activeTitikLokasi } = useLocations();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [form, setForm] = useState<ShipmentFormData>(emptyForm);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<Shipment | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  function update<K extends keyof ShipmentFormData>(key: K, value: ShipmentFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    compressImage(file)
      .then((dataUrl) => update("fotoBarang", dataUrl))
      .catch(() => setPhotoError("Gagal memproses foto. Coba foto lain."));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.truckId) {
      setFormError("Pilih unit truck terlebih dahulu.");
      return;
    }
    if (!form.kotaAsal || !form.kotaTujuan) {
      setFormError("Pilih kota asal dan kota tujuan terlebih dahulu.");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    // simulate short processing delay for realism
    setTimeout(() => {
      const shipment = createShipment({
        ...form,
        fotoBarang: form.fotoBarang ?? photos.barangDiterima,
      });
      setCreated(shipment);
      setSubmitting(false);
    }, 500);
  }

  async function handleSendEmail() {
    if (!created) return;
    if (!settings.emailSendingEnabled) {
      setEmailError("Pengiriman email sedang dinonaktifkan. Aktifkan di Admin > Pengaturan.");
      return;
    }
    setEmailSending(true);
    setEmailError(null);

    const targets: Array<"penerima" | "pengirim"> = ["penerima", "pengirim"];
    const results = await Promise.all(targets.map((role) => sendTrackingEmail(created, trackingUrl, role)));
    setEmailSending(false);

    const failed = results.find((r) => !r.ok);
    if (!failed) {
      markEmailSent(created.awb);
      setEmailSent(true);
    } else {
      setEmailError(failed.error ?? "Gagal mengirim email.");
    }
  }

  const trackingUrl = created ? `${window.location.origin}${window.location.pathname}#/tracking/${created.awb}` : "";

  const truckOptions = trucksWithDriver
    .filter((t) => t.status !== "Inactive")
    .map((t) => ({
      value: t.id,
      label: `${t.nomorUnit} - ${t.jenis}`,
      description: t.driver ? `Driver: ${t.driver.nama}` : undefined,
    }));
  const kotaOptions = activeTitikLokasi.map((k) => ({
    value: k.namaKota,
    label: k.namaKota,
    description: `${k.jenis} - ${k.provinsi}`,
  }));
  const selectedTruck = trucksWithDriver.find((t) => t.id === form.truckId);

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Buat Pengiriman</h1>
        <p className="mt-1 text-sm text-slate-500">
          Isi data pengirim, penerima, dan informasi pengiriman untuk menerbitkan resi (AWB) baru.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <Section title="Data Pengirim" icon={User}>
          <Field label="Nama Pengirim">
            <input
              required
              className={inputClass}
              placeholder="Nama lengkap"
              value={form.pengirim.nama}
              onChange={(e) => update("pengirim", { ...form.pengirim, nama: e.target.value })}
            />
          </Field>
          <Field label="Nomor HP">
            <input
              required
              className={inputClass}
              placeholder="08xx-xxxx-xxxx"
              value={form.pengirim.telepon}
              onChange={(e) => update("pengirim", { ...form.pengirim, telepon: e.target.value })}
            />
          </Field>
          <Field label="Email" full>
            <input
              required
              type="email"
              className={inputClass}
              placeholder="nama@email.com"
              value={form.pengirim.email}
              onChange={(e) => update("pengirim", { ...form.pengirim, email: e.target.value })}
            />
          </Field>
        </Section>

        <Section title="Data Penerima" icon={User}>
          <Field label="Nama Penerima">
            <input
              required
              className={inputClass}
              placeholder="Nama lengkap"
              value={form.penerima.nama}
              onChange={(e) => update("penerima", { ...form.penerima, nama: e.target.value })}
            />
          </Field>
          <Field label="Nomor HP">
            <input
              required
              className={inputClass}
              placeholder="08xx-xxxx-xxxx"
              value={form.penerima.telepon}
              onChange={(e) => update("penerima", { ...form.penerima, telepon: e.target.value })}
            />
          </Field>
          <Field label="Email" full>
            <input
              required
              type="email"
              className={inputClass}
              placeholder="nama@email.com (penerima notifikasi resi)"
              value={form.penerima.email}
              onChange={(e) => update("penerima", { ...form.penerima, email: e.target.value })}
            />
          </Field>
        </Section>

        <Section title="Pengiriman" icon={MapPin}>
          <Field label="Kota Asal">
            <SearchableSelect
              options={kotaOptions}
              value={form.kotaAsal}
              onChange={(v) => update("kotaAsal", v)}
              placeholder="Pilih kota asal"
              emptyLabel="Kota tidak ditemukan."
            />
          </Field>
          <Field label="Kota Tujuan">
            <SearchableSelect
              options={kotaOptions}
              value={form.kotaTujuan}
              onChange={(v) => update("kotaTujuan", v)}
              placeholder="Pilih kota tujuan"
              emptyLabel="Kota tidak ditemukan."
            />
          </Field>
          <Field label="Alamat Asal" full>
            <input
              required
              className={inputClass}
              placeholder="Jl. Raya ... No. ..."
              value={form.alamatAsal}
              onChange={(e) => update("alamatAsal", e.target.value)}
            />
          </Field>
          <Field label="Alamat Tujuan" full>
            <input
              required
              className={inputClass}
              placeholder="Jl. Raya ... No. ..."
              value={form.alamatTujuan}
              onChange={(e) => update("alamatTujuan", e.target.value)}
            />
          </Field>
          <Field label="Deskripsi Barang" full>
            <textarea
              required
              rows={3}
              className={inputClass}
              placeholder="Contoh: Spare part mesin, 3 dus (85kg)"
              value={form.deskripsiBarang}
              onChange={(e) => update("deskripsiBarang", e.target.value)}
            />
          </Field>
          <Field label="Foto Barang" full>
            <div className="flex items-center gap-3">
              <label className="flex h-24 w-24 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-500">
                <ImagePlus size={20} />
                <span className="text-[10px] font-medium">Unggah Foto</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
              {form.fotoBarang && (
                <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-slate-200">
                  <img src={form.fotoBarang} alt="Preview barang" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => update("fotoBarang", undefined)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              <p className="text-xs text-slate-400">
                Opsional. Jika tidak diunggah, sistem akan menggunakan foto contoh.
              </p>
            </div>
            {photoError && <p className="mt-1.5 text-xs font-medium text-red-600">{photoError}</p>}
          </Field>
        </Section>

        <Section title="Informasi Truck" icon={Truck}>
          <Field label="Pilih Unit Truck" full>
            <SearchableSelect
              options={truckOptions}
              value={form.truckId}
              onChange={(v) => update("truckId", v)}
              placeholder="Pilih Unit Truck"
              emptyLabel="Tidak ada unit truck yang tersedia."
            />
          </Field>
          {selectedTruck ? (
            <div className="sm:col-span-2 flex flex-wrap items-center gap-4 rounded-lg bg-slate-50 px-3.5 py-3 text-sm">
              <span className="flex items-center gap-1.5 text-slate-700">
                <Truck size={15} className="text-slate-400" />
                <span className="font-medium">{selectedTruck.nomorUnit}</span>
                <span className="text-slate-400">- {selectedTruck.jenis}</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <User size={15} className="text-slate-400" />
                Driver: <span className="font-medium">{selectedTruck.driver?.nama ?? "-"}</span>
              </span>
              <span className="text-xs text-slate-400">{selectedTruck.driver?.telepon}</span>
            </div>
          ) : (
            <p className="sm:col-span-2 text-xs text-slate-400">
              Belum ada unit dipilih. Kelola daftar armada di{" "}
              <Link to="/admin/armada" className="text-blue-700 hover:underline">
                Master Armada
              </Link>
              .
            </p>
          )}
        </Section>

        <div className="flex flex-col items-end gap-2.5">
          {formError && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-red-600">
              <AlertTriangle size={14} /> {formError}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 disabled:opacity-60"
          >
            {submitting ? <Loader2 size={17} className="animate-spin" /> : <Package size={17} />}
            {submitting ? "Menerbitkan Resi..." : "Terbitkan Resi"}
          </button>
        </div>
      </form>

      {/* Success modal */}
      {created && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex flex-col items-center gap-2 border-b border-slate-100 px-6 pb-5 pt-7 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 size={30} />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Resi Berhasil Dibuat</h2>
              <p className="text-sm text-slate-500">
                AWB baru telah diterbitkan dan tersimpan dalam sistem.
              </p>
            </div>

            <div className="px-6 py-5">
              <div className="flex flex-col items-center gap-3 rounded-xl bg-slate-50 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Nomor AWB
                </p>
                <p className="font-mono text-2xl font-bold tracking-tight text-blue-900">
                  {created.awb}
                </p>
                <QRCode data={trackingUrl} size={140} />
                <p className="max-w-xs break-all text-center text-[11px] text-slate-400">
                  {trackingUrl}
                </p>
              </div>

              {!emailSent && (
                <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs text-slate-600">
                  <Mail size={14} className="mt-0.5 shrink-0 text-slate-400" />
                  <span>
                    Resi akan dikirim ke email penerima{" "}
                    <span className="font-medium text-slate-800">({created.penerima.email})</span> dan pengirim{" "}
                    <span className="font-medium text-slate-800">({created.pengirim.email})</span>.
                  </span>
                </div>
              )}

              {emailSent && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
                  <CheckCircle2 size={16} />
                  {`Email berhasil dikirim ke penerima (${created.penerima.email}) dan pengirim (${created.pengirim.email})`}
                </div>
              )}
              {emailError && (
                <div className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
                  <div className="flex items-center gap-2 font-medium">
                    <AlertTriangle size={16} />
                    Gagal mengirim email
                  </div>
                  <p className="mt-1 break-words text-xs text-red-600">{emailError}</p>
                </div>
              )}
              {!settings.emailSendingEnabled && !emailSent && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
                  <AlertTriangle size={16} />
                  Pengiriman email sedang dinonaktifkan. Aktifkan di Admin &gt; Pengaturan.
                </div>
              )}

              <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <button
                  onClick={handleSendEmail}
                  disabled={emailSending || emailSent || !settings.emailSendingEnabled}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-800 transition-colors hover:bg-blue-100 disabled:opacity-60"
                >
                  {emailSending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Mail size={16} />
                  )}
                  {emailSent ? "Email Terkirim" : emailError ? "Coba Lagi" : "Kirim Email"}
                </button>
                <button
                  onClick={() => navigate(`/tracking/${created.awb}`)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <MapPin size={16} />
                  Lihat Tracking
                </button>
              </div>

              <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <button
                  onClick={() => navigate(`/admin/resi/${created.awb}`)}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Lihat Detail Resi
                </button>
                <button
                  onClick={() => navigate(`/admin/resi/${created.awb}/email`)}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Preview Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
