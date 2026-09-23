import { ArrowLeft, ArrowLeftRight, Boxes, Calculator, Clock3, MapPin, Truck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { PublicLayout } from "../../components/layout/PublicLayout";
import { SearchableSelect } from "../../components/SearchableSelect";
import { useLanguage } from "../../store/LanguageContext";
import { useLocations } from "../../store/LocationContext";
import type { LayananPengiriman } from "../../types";
import { estimateOngkir, formatRupiah, type OngkirEstimate } from "../../utils/ongkir";
import { useDocumentTitle } from "../../utils/useDocumentTitle";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

const LAYANAN_KEYS: LayananPengiriman[] = ["Reguler", "Express", "Kargo"];

export default function CekOngkir() {
  const { t, language } = useLanguage();
  useDocumentTitle(t.nav.checkPrice);
  const navigate = useNavigate();
  const { activeTitikLokasi } = useLocations();

  const [kotaAsal, setKotaAsal] = useState("");
  const [kotaTujuan, setKotaTujuan] = useState("");
  const [beratKg, setBeratKg] = useState("");
  const [jumlahKoli, setJumlahKoli] = useState("1");
  const [layanan, setLayanan] = useState<LayananPengiriman>("Reguler");
  const [result, setResult] = useState<OngkirEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const kotaOptions = activeTitikLokasi.map((k) => ({
    value: k.namaKota,
    label: k.namaKota,
    description: k.provinsi,
  }));

  const layananIndex = LAYANAN_KEYS.indexOf(layanan);
  const resultLayananIndex = result ? LAYANAN_KEYS.indexOf(result.layanan) : -1;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!kotaAsal || !kotaTujuan) {
      setResult(null);
      setError(t.cekOngkir.errorCities);
      return;
    }
    const berat = Number(beratKg);
    if (!berat || berat <= 0) {
      setResult(null);
      setError(t.cekOngkir.errorWeight);
      return;
    }
    const koli = Number(jumlahKoli) || 1;
    setResult(estimateOngkir(kotaAsal, kotaTujuan, berat, koli, layanan, language));
  }

  function handleSwap() {
    const a = kotaAsal;
    const b = kotaTujuan;
    setKotaAsal(b);
    setKotaTujuan(a);
    setResult(null);
  }

  return (
    <PublicLayout>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={15} /> {t.trackingResult.back}
      </button>

      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-900 text-white">
          <Calculator size={22} />
        </div>
        <h1 className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl">{t.cekOngkir.title}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{t.cekOngkir.desc}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">{t.cekOngkir.originCity}</label>
            <SearchableSelect
              options={kotaOptions}
              value={kotaAsal}
              onChange={setKotaAsal}
              placeholder={t.cekOngkir.originCity}
              emptyLabel={t.cekOngkir.cityNotFound}
            />
          </div>
          <button
            type="button"
            onClick={handleSwap}
            title={t.cekOngkir.swapCities}
            aria-label={t.cekOngkir.swapCities}
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:border-blue-300 hover:text-blue-700 sm:flex"
          >
            <ArrowLeftRight size={16} />
          </button>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">{t.cekOngkir.destinationCity}</label>
            <SearchableSelect
              options={kotaOptions}
              value={kotaTujuan}
              onChange={setKotaTujuan}
              placeholder={t.cekOngkir.destinationCity}
              emptyLabel={t.cekOngkir.cityNotFound}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">{t.cekOngkir.weightLabel}</label>
            <input
              type="number"
              min={0.1}
              step={0.1}
              value={beratKg}
              onChange={(e) => setBeratKg(e.target.value)}
              placeholder={t.cekOngkir.weightPlaceholder}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">{t.cekOngkir.koliLabel}</label>
            <input
              type="number"
              min={1}
              step={1}
              value={jumlahKoli}
              onChange={(e) => setJumlahKoli(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">{t.cekOngkir.serviceLabel}</label>
            <select
              value={layanan}
              onChange={(e) => setLayanan(e.target.value as LayananPengiriman)}
              className={inputClass}
            >
              {LAYANAN_KEYS.map((key, i) => (
                <option key={key} value={key}>
                  {t.cekOngkir.serviceOptions[i].label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          {layananIndex >= 0 && t.cekOngkir.serviceOptions[layananIndex].desc}
        </p>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 sm:w-auto"
        >
          <Calculator size={16} />
          {t.cekOngkir.submitButton}
        </button>
      </form>

      {result && (
        <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-blue-700">
                {result.kotaAsal} → {result.kotaTujuan}
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                {formatRupiah(result.total)}
              </p>
              <p className="mt-1 text-xs text-slate-500">{t.cekOngkir.resultDisclaimer}</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-blue-800 ring-1 ring-inset ring-blue-200">
              {resultLayananIndex >= 0 ? t.cekOngkir.serviceOptions[resultLayananIndex].label : result.layanan}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-white p-3">
              <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <MapPin size={12} /> {t.cekOngkir.route}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{result.tierLabel}</p>
            </div>
            <div className="rounded-xl bg-white p-3">
              <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Truck size={12} /> {t.cekOngkir.estimatedDistance}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">~{result.distanceKm} km</p>
            </div>
            <div className="rounded-xl bg-white p-3">
              <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Clock3 size={12} /> {t.cekOngkir.estimatedArrival}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{result.estimasiHari}</p>
            </div>
            <div className="rounded-xl bg-white p-3">
              <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Boxes size={12} /> {t.cekOngkir.weightKoli}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {result.beratKg} kg · {result.jumlahKoli} koli
              </p>
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
