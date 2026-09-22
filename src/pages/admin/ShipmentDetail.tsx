import {
  ArrowLeft,
  Download,
  Mail,
  MapPin,
  Package,
  Printer,
  Truck,
  User,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { QRCode } from "../../components/QRCode";
import { StatusBadge } from "../../components/StatusBadge";
import { useShipments } from "../../store/ShipmentContext";
import { formatTanggalPanjang } from "../../utils/format";

export default function ShipmentDetail() {
  const { awb } = useParams<{ awb: string }>();
  const { getByAwb } = useShipments();
  const navigate = useNavigate();
  const shipment = getByAwb(awb ?? "");

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

  const trackingUrl = `${window.location.origin}${window.location.pathname}#/tracking/${shipment.awb}`;

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
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3 print:mt-4 print:grid-cols-3 print:gap-4">
        <div className="space-y-6 lg:col-span-2 print:col-span-2 print:space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 print:shadow-none">
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
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Package size={13} /> Deskripsi Barang
              </p>
              <p className="text-sm text-slate-700">{shipment.deskripsiBarang}</p>
              {shipment.fotoBarang && (
                <img
                  src={shipment.fotoBarang}
                  alt="Foto barang"
                  className="mt-3 h-40 w-40 rounded-lg border border-slate-200 object-cover print:h-24 print:w-24"
                />
              )}
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Truck size={13} /> Truck &amp; Driver
              </p>
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
          <Link
            to={`/admin/update-tracking/${shipment.awb}`}
            className="block rounded-xl border border-dashed border-blue-300 bg-blue-50 p-4 text-center text-sm font-semibold text-blue-800 hover:bg-blue-100 no-print"
          >
            + Tambah Update Tracking
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
