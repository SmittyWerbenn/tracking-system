import { History, QrCode, Search, Trash2, Truck, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import heroImage from "../../assets/hero-package-handoff.jpg";
import { BarcodeScannerModal } from "../../components/BarcodeScannerModal";
import { PublicLayout } from "../../components/layout/PublicLayout";
import { StatusBadge } from "../../components/StatusBadge";
import { useLanguage } from "../../store/LanguageContext";
import { useShipments } from "../../store/ShipmentContext";
import type { ShipmentStatus } from "../../types";
import {
  clearAwbHistory,
  formatRelativeView,
  getAwbHistory,
  removeAwbHistory,
  type AwbHistoryEntry,
} from "../../utils/awbHistory";
import { useDocumentTitle } from "../../utils/useDocumentTitle";

export default function TrackingSearch() {
  const { t, language } = useLanguage();
  useDocumentTitle(t.nav.trackPackage);
  const [awb, setAwb] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [history, setHistory] = useState<AwbHistoryEntry[]>(() => getAwbHistory());
  const [scannerOpen, setScannerOpen] = useState(false);
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

  function handleScanned(scannedAwb: string) {
    setScannerOpen(false);
    setAwb(scannedAwb);
    if (getByAwb(scannedAwb)) {
      setNotFound(false);
      navigate(`/tracking/${scannedAwb}`);
    } else {
      setNotFound(true);
    }
  }

  return (
    <PublicLayout wide>
      {/* Hero band - full-bleed, breaks out of the centered content container */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] -mt-6 w-screen overflow-hidden bg-blue-950">
        <img
          src={heroImage}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-blue-950/95 to-blue-900/90" />
        <div className="relative mx-auto grid max-w-5xl grid-cols-1 items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-5 lg:gap-10">
          <div className="text-center lg:col-span-3 lg:text-left">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{t.trackingSearch.heroTitle}</h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-blue-100 sm:text-base lg:mx-0">
              {t.trackingSearch.heroDesc}
            </p>

            <form onSubmit={handleSubmit} className="mx-auto mt-6 w-full max-w-md lg:mx-0">
              <div className="flex flex-col gap-2.5 rounded-xl bg-white p-2 shadow-lg sm:flex-row sm:rounded-full">
                <input
                  value={awb}
                  onChange={(e) => {
                    setAwb(e.target.value);
                    setNotFound(false);
                  }}
                  placeholder={t.trackingSearch.placeholder}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 sm:border-0 sm:bg-transparent sm:pl-5 sm:focus:bg-transparent sm:focus:ring-0"
                />
                <button
                  type="submit"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800 sm:rounded-full"
                >
                  <Search size={16} />
                  {t.trackingSearch.submitButton}
                </button>
              </div>
              {notFound && (
                <p className="mt-2 text-left text-xs font-medium text-red-200">{t.trackingSearch.notFound}</p>
              )}
            </form>

            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/20 lg:mx-0"
            >
              <QrCode size={18} />
              {t.trackingSearch.scanButton}
            </button>
          </div>

          <div className="hidden flex-col items-center justify-center gap-3 lg:col-span-2 lg:flex">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
              <Truck size={44} className="text-white" />
            </div>
            <p className="max-w-[220px] text-center font-serif text-lg italic text-blue-100">
              {t.trackingSearch.taglineImage}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center pb-6 pt-10 text-center">
        {history.length > 0 && (
          <div className="w-full text-left">
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <History size={13} />
                {t.trackingSearch.historyTitle}
              </p>
              <button
                onClick={() => setHistory(clearAwbHistory())}
                className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-red-600"
              >
                <Trash2 size={12} /> {t.trackingSearch.clearAll}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {history.map((h) => (
                <div
                  key={h.awb}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50"
                >
                  <button
                    onClick={() => navigate(`/tracking/${h.awb}`)}
                    className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm font-medium text-slate-800">{h.awb}</p>
                      <p className="text-xs text-slate-400">
                        {t.trackingSearch.lastViewed}: {formatRelativeView(h.lastViewedAt, language)}
                      </p>
                    </div>
                    <StatusBadge status={h.status as ShipmentStatus} size="sm" />
                  </button>
                  <button
                    onClick={() => setHistory(removeAwbHistory(h.awb))}
                    title={t.trackingSearch.removeFromHistory}
                    className="shrink-0 rounded-md p-1 text-slate-300 hover:bg-slate-100 hover:text-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 w-full text-left">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {t.trackingSearch.exampleTitle}
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>

      {scannerOpen && (
        <BarcodeScannerModal onClose={() => setScannerOpen(false)} onDetected={handleScanned} />
      )}
    </PublicLayout>
  );
}
