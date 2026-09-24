import { ArrowLeft, ArrowRight, CalendarClock, PackageSearch, Search } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FeedbackPopup } from "../../components/FeedbackPopup";
import { PublicLayout } from "../../components/layout/PublicLayout";
import { ProofOfDeliveryCard } from "../../components/ProofOfDeliveryCard";
import { StatusBadge } from "../../components/StatusBadge";
import { StatusStepper } from "../../components/StatusStepper";
import { TrackingTimeline } from "../../components/TrackingTimeline";
import { useLanguage } from "../../store/LanguageContext";
import type { Shipment } from "../../types";
import { recordAwbView } from "../../utils/awbHistory";
import { formatTanggalPanjang } from "../../utils/format";
import { fetchPublicShipment } from "../../utils/publicTracking";
import { useDocumentTitle } from "../../utils/useDocumentTitle";

export default function TrackingResult() {
  const { t } = useLanguage();
  const { awb } = useParams<{ awb: string }>();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [hasFeedback, setHasFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchPublicShipment(awb ?? "").then((result) => {
      if (cancelled) return;
      setShipment(result?.shipment ?? null);
      setHasFeedback(result?.hasFeedback ?? false);
      setIsLoading(false);
      if (result?.shipment) recordAwbView(result.shipment.awb, result.shipment.status);
    });
    return () => {
      cancelled = true;
    };
  }, [awb]);

  useDocumentTitle(shipment ? `Tracking ${shipment.awb}` : `AWB ${awb} ${t.trackingResult.notFoundTitle}`);

  const [query, setQuery] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [checking, setChecking] = useState(false);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setChecking(true);
    const result = await fetchPublicShipment(trimmed);
    setChecking(false);
    if (result) {
      setNotFound(false);
      navigate(`/tracking/${trimmed}`);
    } else {
      setNotFound(true);
    }
  }

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-900" />
        </div>
      </PublicLayout>
    );
  }

  if (!shipment) {
    return (
      <PublicLayout>
        <div className="flex flex-col items-center py-10 text-center">
          <PackageSearch size={40} className="text-slate-300" />
          <h1 className="mt-4 text-lg font-semibold text-slate-800">{t.trackingResult.notFoundTitle}</h1>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            AWB <span className="font-mono font-medium text-slate-700">"{awb}"</span> — {t.trackingResult.notFoundDesc}
          </p>
          <form onSubmit={handleSearch} className="mt-6 flex w-full max-w-sm gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.trackingSearch.placeholder}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              disabled={checking}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              <Search size={15} /> {t.trackingSearch.submitButton}
            </button>
          </form>
          {notFound && <p className="mt-2 text-xs font-medium text-red-600">{t.trackingResult.notFoundError}</p>}
          <Link to="/tracking" className="mt-4 text-sm text-blue-700 hover:underline">
            {t.trackingResult.notFoundBack}
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const isDelivered = shipment.status === "Selesai / Terkirim";

  return (
    <PublicLayout wide>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={15} /> {t.trackingResult.back}
      </button>

      {/* quick search */}
      <form onSubmit={handleSearch} className="mb-5 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.trackingResult.searchPlaceholder}
          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <button
          type="submit"
          disabled={checking}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          <Search size={15} />
        </button>
      </form>
      {notFound && (
        <p className="-mt-3 mb-3 text-xs font-medium text-red-600">
          AWB "{query}" {t.trackingResult.notFoundError}
        </p>
      )}

      {/* Summary card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                {t.trackingResult.resiNumber}
              </p>
              <p className="font-mono text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {shipment.awb}
              </p>
            </div>
            <StatusBadge status={shipment.status} />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <CalendarClock size={14} className="text-slate-400" />
            {t.trackingResult.estimatedArrival}:{" "}
            <span className="font-medium text-slate-700">
              {isDelivered
                ? t.trackingResult.delivered
                : shipment.estimasiTiba
                  ? formatTanggalPanjang(shipment.estimasiTiba)
                  : t.trackingResult.notAvailable}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{t.trackingResult.origin}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
              {shipment.kotaAsal}
            </p>
          </div>
          <div className="pl-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              {t.trackingResult.destination}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
              {shipment.kotaTujuan}
              <ArrowRight size={13} className="text-slate-300" />
            </p>
          </div>
        </div>
      </div>

      {/* Progress stepper */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <StatusStepper status={shipment.status} />
      </div>

      {/* POD if delivered - shown prominently near top */}
      {isDelivered && shipment.pod && (
        <div className="mt-5">
          <ProofOfDeliveryCard pod={shipment.pod} />
        </div>
      )}

      {/* Timeline */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t.trackingResult.journeyHeading}
        </h2>
        <TrackingTimeline events={shipment.timeline} />
      </div>

      {isDelivered && (
        <FeedbackPopup awb={shipment.awb} customerName={shipment.penerima.nama} alreadyRated={hasFeedback} />
      )}

      <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-xs text-slate-400">
        {t.trackingResult.helpText}{" "}
        <span className="font-mono font-medium text-slate-600">{shipment.awb}</span>.
      </div>
    </PublicLayout>
  );
}
