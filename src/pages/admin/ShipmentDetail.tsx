import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  CheckCircle2,
  Download,
  Loader2,
  Mail,
  MapPin,
  Package,
  Pencil,
  Printer,
  Truck,
  User,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { QRCode } from "../../components/QRCode";
import { RefreshButton } from "../../components/RefreshButton";
import { StatusBadge } from "../../components/StatusBadge";
import { useAuth } from "../../store/AuthContext";
import { useLocations } from "../../store/LocationContext";
import { useShipments } from "../../store/ShipmentContext";
import type { Shipment } from "../../types";
import { formatJam, formatTanggalJam, formatTanggalPanjang } from "../../utils/format";

export default function ShipmentDetail() {
  const { awb } = useParams<{ awb: string }>();
  const { getByAwb, confirmClaim, rejectClaim, unassignDriver, cancelShipment, updateShipmentAlamat } = useShipments();
  const { activeTitikLokasi } = useLocations();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [claimActionPending, setClaimActionPending] = useState(false);
  const [claimActionError, setClaimActionError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const canManageClaims = profile?.role === "Superadmin" || profile?.role === "Admin";

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelPending, setCancelPending] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [alamatModalOpen, setAlamatModalOpen] = useState(false);
  const [alamatAsalInput, setAlamatAsalInput] = useState("");
  const [kotaAsalInput, setKotaAsalInput] = useState("");
  const [alamatTujuanInput, setAlamatTujuanInput] = useState("");
  const [kotaTujuanInput, setKotaTujuanInput] = useState("");
  const [alamatPending, setAlamatPending] = useState(false);
  const [alamatError, setAlamatError] = useState<string | null>(null);
  const kotaSuggestions = Array.from(new Set(activeTitikLokasi.map((k) => k.namaKota))).sort();

  function reload() {
    return getByAwb(awb ?? "").then((s) => {
      setShipment(s);
      return s;
    });
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await reload();
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getByAwb(awb ?? "").then((s) => {
      if (!cancelled) {
        setShipment(s);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [awb]);

  async function handleConfirmClaim() {
    setClaimActionPending(true);
    setClaimActionError(null);
    const result = await confirmClaim(shipment!.awb);
    setClaimActionPending(false);
    if (result.ok) await reload();
    else setClaimActionError(result.error);
  }

  async function handleRejectClaim() {
    setClaimActionPending(true);
    setClaimActionError(null);
    const result = await rejectClaim(shipment!.awb);
    setClaimActionPending(false);
    if (result.ok) await reload();
    else setClaimActionError(result.error);
  }

  async function handleUnassignDriver() {
    setClaimActionPending(true);
    setClaimActionError(null);
    const result = await unassignDriver(shipment!.awb);
    setClaimActionPending(false);
    if (result.ok) await reload();
    else setClaimActionError(result.error);
  }

  function openCancelModal() {
    setCancelReason("");
    setCancelError(null);
    setCancelModalOpen(true);
  }

  async function handleCancelShipment() {
    setCancelPending(true);
    setCancelError(null);
    const result = await cancelShipment(shipment!.awb, cancelReason.trim() || undefined);
    setCancelPending(false);
    if (result.ok) {
      setCancelModalOpen(false);
      await reload();
    } else {
      setCancelError(result.error);
    }
  }

  function openAlamatModal() {
    setAlamatAsalInput(shipment!.alamatAsal);
    setKotaAsalInput(shipment!.kotaAsal);
    setAlamatTujuanInput(shipment!.alamatTujuan);
    setKotaTujuanInput(shipment!.kotaTujuan);
    setAlamatError(null);
    setAlamatModalOpen(true);
  }

  async function handleSaveAlamat() {
    setAlamatPending(true);
    setAlamatError(null);
    const result = await updateShipmentAlamat(shipment!.awb, {
      alamatAsal: alamatAsalInput.trim(),
      kotaAsal: kotaAsalInput.trim(),
      alamatTujuan: alamatTujuanInput.trim(),
      kotaTujuan: kotaTujuanInput.trim(),
    });
    setAlamatPending(false);
    if (result.ok) {
      setAlamatModalOpen(false);
      await reload();
    } else {
      setAlamatError(result.error);
    }
  }

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

  const trackingUrl = `${window.location.origin}/tracking/${shipment.awb}`;
  const isTerminalStatus = shipment.status === "Selesai / Terkirim" || shipment.status === "Dibatalkan";
  const canCancelOrder =
    !isTerminalStatus &&
    (profile?.role === "Superadmin" ||
      profile?.role === "Admin" ||
      (profile?.role === "Cust-Admin" && shipment.status === "Dalam Persiapan"));
  const canEditAlamat = profile?.role === "Cust-Admin" && shipment.status === "Dalam Persiapan";

  function printResi() {
    // The browser's print/"Save as PDF" dialog suggests document.title as the
    // filename - set it just for the print action so downloads are named
    // consistently, then restore the normal tab title afterwards. The
    // listener must be attached before print() since print() blocks until
    // the dialog closes, and "afterprint" can fire as soon as it does.
    const previousTitle = document.title;
    window.addEventListener(
      "afterprint",
      () => {
        document.title = previousTitle;
      },
      { once: true },
    );
    document.title = "Sistem Tracking & Resi Digital - Gmslogistics";
    window.print();
  }

  return (
    <AdminLayout>
      <button
        onClick={() => navigate(-1)}
        className="no-print mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={15} /> Kembali
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4 print:block">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Detail Resi / AWB
          </p>
          <h1 className="mt-0.5 font-mono text-2xl font-bold text-slate-900">{shipment.awb}</h1>
          <div className="mt-2">
            <StatusBadge status={shipment.status} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 no-print">
          <RefreshButton onClick={handleRefresh} refreshing={refreshing} />
          <button
            onClick={printResi}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Printer size={15} /> Cetak Resi
          </button>
          <button
            onClick={printResi}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Download size={15} /> Download Resi
          </button>
          <Link
            to={`/admin/resi/${shipment.awb}/email`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Mail size={15} /> Kirim Email
          </Link>
          <Link
            to={`/tracking/${shipment.awb}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            <MapPin size={15} /> Lihat Tracking
          </Link>
          {canCancelOrder && (
            <button
              type="button"
              onClick={openCancelModal}
              className="inline-flex items-center gap-1.5 rounded-lg border-2 border-rose-600 bg-white px-3.5 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
            >
              <Ban size={15} /> Batalkan Pesanan
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3 print:mt-4 print:grid-cols-3 print:gap-4">
        <div className="space-y-6 lg:col-span-2 print:col-span-2 print:space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 print:shadow-none">
            {canEditAlamat && (
              <div className="mb-4 flex justify-end no-print">
                <button
                  type="button"
                  onClick={openAlamatModal}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <Pencil size={13} /> Edit Alamat
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 print:grid-cols-2">
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <User size={13} /> Pengirim
                </p>
                <p className="text-sm font-medium text-slate-900">{shipment.pengirim.nama}</p>
                <p className="text-sm text-slate-500">{shipment.pengirim.telepon}</p>
                <p className="text-sm text-slate-500">{shipment.pengirim.email}</p>
                <p className="mt-2 text-sm text-slate-600">{shipment.alamatAsal}</p>
                <p className="text-sm font-medium text-slate-700">{shipment.kotaAsal}</p>
              </div>
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <User size={13} /> Penerima
                </p>
                <p className="text-sm font-medium text-slate-900">{shipment.penerima.nama}</p>
                <p className="text-sm text-slate-500">{shipment.penerima.telepon}</p>
                <p className="text-sm text-slate-500">{shipment.penerima.email}</p>
                <p className="mt-2 text-sm text-slate-600">{shipment.alamatTujuan}</p>
                <p className="text-sm font-medium text-slate-700">{shipment.kotaTujuan}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-6 border-t border-slate-100 pt-5">
              {shipment.customerId && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Customer ID</p>
                  <p className="text-sm font-medium text-slate-800">{shipment.customerId}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Layanan</p>
                <p className="text-sm font-medium text-slate-800">{shipment.layanan}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Berat</p>
                <p className="text-sm font-medium text-slate-800">{shipment.beratKg} Kg</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Jumlah Koli</p>
                <p className="text-sm font-medium text-slate-800">{shipment.jumlahKoli} Koli</p>
              </div>
              {shipment.slaValue != null && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">ETA</p>
                  <p className="text-sm font-medium text-slate-800">{shipment.slaValue} Hari</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Estimasi Tiba</p>
                <p className="text-sm font-medium text-slate-800">
                  {shipment.estimasiTiba ? formatTanggalPanjang(shipment.estimasiTiba) : "Belum tersedia"}
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Package size={13} /> Deskripsi Barang
              </p>
              <p className="text-sm text-slate-700">{shipment.deskripsiBarang}</p>
              <div className="mt-3 flex flex-wrap gap-4">
                {shipment.fotoBarang && (
                  <div>
                    <p className="mb-1 text-[11px] font-medium text-slate-400">Foto Barang</p>
                    <img
                      src={shipment.fotoBarang}
                      alt="Foto barang"
                      className="h-40 w-40 rounded-lg border border-slate-200 object-cover print:h-24 print:w-24"
                    />
                  </div>
                )}
                {shipment.fotoSuratJalan && (
                  <div>
                    <p className="mb-1 text-[11px] font-medium text-slate-400">Foto Surat Jalan</p>
                    <img
                      src={shipment.fotoSuratJalan}
                      alt="Foto surat jalan"
                      className="h-40 w-40 rounded-lg border border-slate-200 object-cover print:h-24 print:w-24"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Truck size={13} /> Truck &amp; Driver
              </p>

              {claimActionError && (
                <p className="mb-2 text-xs font-medium text-red-600">{claimActionError}</p>
              )}

              {shipment.claimStatus === "pending" ? (
                <div className="rounded-lg border border-violet-200 bg-violet-50 p-3">
                  <p className="text-sm text-violet-800">
                    Diklaim oleh <span className="font-semibold">{shipment.claimDriverNama}</span>
                    {shipment.claimDriverTelepon && ` (${shipment.claimDriverTelepon})`} - menunggu
                    konfirmasi.
                    {shipment.claimRequestedAt && (
                      <span className="mt-0.5 block text-xs text-violet-600">
                        Diajukan {formatTanggalJam(shipment.claimRequestedAt.slice(0, 10), shipment.claimRequestedAt.slice(11, 16))}
                      </span>
                    )}
                  </p>
                  {canManageClaims && (
                    <div className="mt-3 flex items-center gap-2 no-print">
                      <button
                        type="button"
                        disabled={claimActionPending}
                        onClick={handleRejectClaim}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                      >
                        <XCircle size={13} /> Tolak
                      </button>
                      <button
                        type="button"
                        disabled={claimActionPending}
                        onClick={handleConfirmClaim}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
                      >
                        {claimActionPending ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                        Konfirmasi
                      </button>
                    </div>
                  )}
                </div>
              ) : !shipment.truckId ? (
                <p className="text-sm text-slate-500">
                  Belum ditugaskan ke driver manapun - pengiriman ini masuk daftar "Pesanan Terbuka"
                  di portal driver.
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-700">
                    <p>
                      <span className="text-slate-400">Nomor Unit:</span> {shipment.truck.nomorUnit}
                    </p>
                    <p>
                      <span className="text-slate-400">Jenis:</span> {shipment.truck.jenis}
                    </p>
                    {shipment.truck.driver && (
                      <p>
                        <span className="text-slate-400">Driver:</span> {shipment.truck.driver}
                      </p>
                    )}
                  </div>
                  {canManageClaims && shipment.status === "Dalam Persiapan" && (
                    <button
                      type="button"
                      disabled={claimActionPending}
                      onClick={handleUnassignDriver}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60 no-print"
                    >
                      {claimActionPending ? <Loader2 size={13} className="animate-spin" /> : null}
                      Batalkan Penugasan
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs text-slate-400">Tanggal Dibuat</p>
                <p className="font-medium text-slate-700">
                  {formatTanggalPanjang(shipment.tanggalDibuat)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Jam Dibuat</p>
                <p className="font-medium text-slate-700">{shipment.jamDibuat} WIB</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Status Email</p>
                <p className="font-medium text-slate-700">
                  {shipment.emailTerkirim ? "Terkirim" : "Belum dikirim"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {shipment.pod && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm print:shadow-none">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <CheckCircle2 size={13} /> Bukti Serah Terima
              </p>
              <p className="text-xs text-slate-500">Diterima oleh :</p>
              <p className="text-sm font-semibold text-slate-900">{shipment.pod.namaPenerima}</p>
              <p className="mt-2 text-xs text-slate-500">Tanggal &amp; Waktu Diterima :</p>
              <p className="text-sm font-medium text-slate-800">
                {formatTanggalPanjang(shipment.pod.tanggal)} · {formatJam(shipment.pod.jam)}
              </p>
            </div>
          )}
          <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm print:shadow-none">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              QR Tracking
            </p>
            <QRCode data={trackingUrl} size={160} />
            <p className="break-all text-[11px] text-slate-400">{trackingUrl}</p>
            <p className="text-xs text-slate-500">
              Scan QR untuk membuka halaman tracking publik AWB ini.
            </p>
          </div>
          {profile?.role !== "Viewer" && profile?.role !== "Cust-Admin" && (
            <Link
              to={`/admin/update-tracking/${shipment.awb}`}
              className="block rounded-xl border border-dashed border-blue-300 bg-blue-50 p-4 text-center text-sm font-semibold text-blue-800 hover:bg-blue-100 no-print"
            >
              + Tambah Update Tracking
            </Link>
          )}
        </div>
      </div>

      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <Ban size={18} className="text-rose-600" /> Batalkan Pesanan
                </h2>
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-slate-600">
                AWB <span className="font-mono font-semibold">{shipment.awb}</span> akan dibatalkan.
                Setelah dibatalkan, status tidak bisa dikembalikan lagi.
              </p>
              <label className="mt-4 block">
                <span className="mb-1.5 block text-xs font-medium text-slate-600">
                  Alasan Pembatalan <span className="text-slate-400">(opsional)</span>
                </span>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Contoh: Salah input, pesanan diganti, dll."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </label>
              {cancelError && (
                <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-red-600">
                  <AlertTriangle size={14} /> {cancelError}
                </p>
              )}
              <div className="mt-5 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={cancelPending}
                  onClick={handleCancelShipment}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 disabled:opacity-60"
                >
                  {cancelPending ? <Loader2 size={15} className="animate-spin" /> : <Ban size={15} />}
                  Batalkan Pesanan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {alamatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <Pencil size={18} /> Edit Alamat
                </h2>
                <button
                  type="button"
                  onClick={() => setAlamatModalOpen(false)}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Alamat Asal</span>
                  <textarea
                    required
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    value={alamatAsalInput}
                    onChange={(e) => setAlamatAsalInput(e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Kota Asal</span>
                  <input
                    required
                    list="detail-kota-asal-suggestions"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    value={kotaAsalInput}
                    onChange={(e) => setKotaAsalInput(e.target.value)}
                    autoComplete="off"
                  />
                  <datalist id="detail-kota-asal-suggestions">
                    {kotaSuggestions.map((k) => (
                      <option key={k} value={k} />
                    ))}
                  </datalist>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Alamat Tujuan</span>
                  <textarea
                    required
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    value={alamatTujuanInput}
                    onChange={(e) => setAlamatTujuanInput(e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Kota Tujuan</span>
                  <input
                    required
                    list="detail-kota-tujuan-suggestions"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    value={kotaTujuanInput}
                    onChange={(e) => setKotaTujuanInput(e.target.value)}
                    autoComplete="off"
                  />
                  <datalist id="detail-kota-tujuan-suggestions">
                    {kotaSuggestions.map((k) => (
                      <option key={k} value={k} />
                    ))}
                  </datalist>
                </label>
              </div>
              {alamatError && (
                <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-red-600">
                  <AlertTriangle size={14} /> {alamatError}
                </p>
              )}
              <div className="mt-5 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAlamatModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={
                    alamatPending ||
                    !alamatAsalInput.trim() ||
                    !kotaAsalInput.trim() ||
                    !alamatTujuanInput.trim() ||
                    !kotaTujuanInput.trim()
                  }
                  onClick={handleSaveAlamat}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:opacity-60"
                >
                  {alamatPending ? <Loader2 size={15} className="animate-spin" /> : null}
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
