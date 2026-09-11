import { PackageSearch, Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { PublicLayout } from "../../components/layout/PublicLayout";
import { StatusBadge } from "../../components/StatusBadge";
import { useShipments } from "../../store/ShipmentContext";
import { useDocumentTitle } from "../../utils/useDocumentTitle";

export default function TrackingSearch() {
  useDocumentTitle("Lacak Pengiriman");
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
      <div className="flex flex-col items-center py-6 text-center sm:py-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-900 text-white">
          <PackageSearch size={26} />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-slate-900 sm:text-2xl">
          Lacak Pengiriman Anda
        </h1>
        <p className="mt-1.5 max-w-sm text-sm text-slate-500">
          Masukkan nomor AWB (resi) yang tertera pada email atau resi fisik Anda untuk melihat
          status pengiriman terkini.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 w-full max-w-md">
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <input
              value={awb}
              onChange={(e) => {
                setAwb(e.target.value);
                setNotFound(false);
              }}
              placeholder="Contoh: GMS-20260911-0001"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
            >
              <Search size={16} />
              Lacak
            </button>
          </div>
          {notFound && (
            <p className="mt-2 text-left text-xs font-medium text-red-600">
              Nomor AWB tidak ditemukan. Periksa kembali nomor resi Anda.
            </p>
          )}
        </form>

        <div className="mt-10 w-full max-w-md text-left">
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
      </div>
    </PublicLayout>
  );
}
