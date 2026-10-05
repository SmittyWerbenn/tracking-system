import { ArrowLeft, Boxes, Calculator, Clock3, Gauge, MapPin, Truck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../../components/compro/Navbar";
import { Footer } from "../../components/compro/Footer";
import { SearchableSelect } from "../../components/SearchableSelect";
import { COMPRO_IMAGES } from "../../data/compro/imagesData";
import { useLanguage } from "../../store/LanguageContext";
import type { LayananPengiriman } from "../../types";
import { ApiError } from "../../utils/apiClient";
import { estimasiHariLabel, fetchOngkir, fetchWilayah, formatRupiah, type OngkirEstimate } from "../../utils/ongkir";
import { useSeo } from "../../utils/seo";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-gms-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gms-gold/20";

const LAYANAN_KEYS: LayananPengiriman[] = ["Darat", "Express", "Kargo", "Regular", "Charter"];

export default function CekOngkir() {
  const { t, language } = useLanguage();
  useSeo({
    title: language === "id" ? "Cek Ongkir | GMS Logistics" : "Check Shipping Cost | GMS Logistics",
    description: t.cekOngkir.desc,
    path: "/cek-ongkir",
  });
  const navigate = useNavigate();

  const [provAsal, setProvAsal] = useState("");
  const [kotaAsal, setKotaAsal] = useState("");
  const [provTujuan, setProvTujuan] = useState("");
  const [kotaTujuan, setKotaTujuan] = useState("");
  const [kecTujuan, setKecTujuan] = useState("");
  const [beratKg, setBeratKg] = useState("");
  const [jumlahKoli, setJumlahKoli] = useState("1");
  const [layanan, setLayanan] = useState<LayananPengiriman>("Regular");
  const [result, setResult] = useState<OngkirEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Wilayah master (Provinsi -> Kab/Kota -> Kecamatan) comes from the API; each
  // level loads when its parent is chosen. Child values reset when a parent changes.
  const [provinsiList, setProvinsiList] = useState<string[]>([]);
  const [kotaAsalList, setKotaAsalList] = useState<string[]>([]);
  const [kotaTujuanList, setKotaTujuanList] = useState<string[]>([]);
  const [kecTujuanList, setKecTujuanList] = useState<string[]>([]);

  useEffect(() => {
    fetchWilayah().then(setProvinsiList).catch(() => setProvinsiList([]));
  }, []);
  useEffect(() => {
    if (!provAsal) return;
    let live = true;
    fetchWilayah(provAsal).then((l) => live && setKotaAsalList(l)).catch(() => live && setKotaAsalList([]));
    return () => {
      live = false;
    };
  }, [provAsal]);
  useEffect(() => {
    if (!provTujuan) return;
    let live = true;
    fetchWilayah(provTujuan).then((l) => live && setKotaTujuanList(l)).catch(() => live && setKotaTujuanList([]));
    return () => {
      live = false;
    };
  }, [provTujuan]);
  useEffect(() => {
    if (!provTujuan || !kotaTujuan) return;
    let live = true;
    fetchWilayah(provTujuan, kotaTujuan).then((l) => live && setKecTujuanList(l)).catch(() => live && setKecTujuanList([]));
    return () => {
      live = false;
    };
  }, [provTujuan, kotaTujuan]);

  const toOptions = (list: string[]) => list.map((v) => ({ value: v, label: v }));
  const provinsiOptions = toOptions(provinsiList);

  const layananIndex = LAYANAN_KEYS.indexOf(layanan);
  const resultLayananIndex = result ? LAYANAN_KEYS.indexOf(result.layanan) : -1;

  const benefits = [
    { icon: Gauge, title: t.cekOngkir.benefit1Title, desc: t.cekOngkir.benefit1Desc },
    { icon: Clock3, title: t.cekOngkir.benefit2Title, desc: t.cekOngkir.benefit2Desc },
    { icon: Truck, title: t.cekOngkir.benefit3Title, desc: t.cekOngkir.benefit3Desc },
  ];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!provAsal || !kotaAsal || !provTujuan || !kotaTujuan || !kecTujuan) {
      setResult(null);
      setError(t.cekOngkir.errorRoute);
      return;
    }
    const berat = Number(beratKg);
    if (!berat || berat <= 0) {
      setResult(null);
      setError(t.cekOngkir.errorWeight);
      return;
    }
    setLoading(true);
    try {
      setResult(
        await fetchOngkir({
          asal: { provinsi: provAsal, kota: kotaAsal },
          tujuan: { provinsi: provTujuan, kota: kotaTujuan, kecamatan: kecTujuan },
          beratKg: berat,
          jumlahKoli: Number(jumlahKoli) || 1,
          layanan,
        }),
      );
    } catch (err) {
      setResult(null);
      setError(err instanceof ApiError ? err.message : t.cekOngkir.errorPricing);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar overlay={false} />
      <main>
        {/* Hero */}
        <section className="relative isolate overflow-hidden bg-gms-deep pb-40 pt-24 sm:pb-52 sm:pt-28">
          <img
            src={COMPRO_IMAGES.hero.url}
            alt=""
            aria-hidden
            loading="eager"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-gms-deep via-gms-deep/85 to-gms-corp/40" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gms-deep" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200/40 px-3.5 py-2 text-sm font-semibold text-blue-100 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={15} /> {t.trackingResult.back}
            </button>

            <div className="mt-8 max-w-xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-gms-gold/40 bg-gms-gold/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-gms-light">
                <Calculator size={13} /> {t.cekOngkir.title}
              </p>
              <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
                {t.cekOngkir.heroTitle} <span className="text-gms-bright">{t.cekOngkir.heroTitleGold}</span>
              </h1>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-blue-100/90 sm:text-base">{t.cekOngkir.desc}</p>
            </div>
          </div>
        </section>

        {/* Floating form card + benefits, overlapping the hero */}
        <div className="relative mx-auto -mt-28 max-w-6xl px-4 sm:-mt-36 sm:px-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_300px] lg:items-start">
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl bg-white p-5 shadow-2xl ring-1 ring-black/5 sm:p-7"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gms-gold/15 text-gms-corp">
                  <Calculator size={20} />
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-gms-corp">{t.cekOngkir.formTitle}</h2>
                  <p className="text-xs text-slate-500">{t.cekOngkir.formDesc}</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">{t.cekOngkir.originProvince}</label>
                    <SearchableSelect
                      options={provinsiOptions}
                      value={provAsal}
                      onChange={(v) => {
                        setProvAsal(v);
                        setKotaAsal("");
                        setKotaAsalList([]);
                      }}
                      placeholder={t.cekOngkir.originProvince}
                      emptyLabel={t.cekOngkir.provinceNotFound}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">{t.cekOngkir.originCity}</label>
                    <SearchableSelect
                      options={toOptions(provAsal ? kotaAsalList : [])}
                      value={kotaAsal}
                      onChange={setKotaAsal}
                      placeholder={provAsal ? t.cekOngkir.originCity : t.cekOngkir.selectProvinceFirst}
                      emptyLabel={t.cekOngkir.cityNotFound}
                      disabled={!provAsal}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">{t.cekOngkir.destinationProvince}</label>
                    <SearchableSelect
                      options={provinsiOptions}
                      value={provTujuan}
                      onChange={(v) => {
                        setProvTujuan(v);
                        setKotaTujuan("");
                        setKecTujuan("");
                        setKotaTujuanList([]);
                        setKecTujuanList([]);
                      }}
                      placeholder={t.cekOngkir.destinationProvince}
                      emptyLabel={t.cekOngkir.provinceNotFound}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">{t.cekOngkir.destinationCity}</label>
                    <SearchableSelect
                      options={toOptions(provTujuan ? kotaTujuanList : [])}
                      value={kotaTujuan}
                      onChange={(v) => {
                        setKotaTujuan(v);
                        setKecTujuan("");
                        setKecTujuanList([]);
                      }}
                      placeholder={provTujuan ? t.cekOngkir.destinationCity : t.cekOngkir.selectProvinceFirst}
                      emptyLabel={t.cekOngkir.cityNotFound}
                      disabled={!provTujuan}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">{t.cekOngkir.destinationDistrict}</label>
                    <SearchableSelect
                      options={toOptions(kotaTujuan ? kecTujuanList : [])}
                      value={kecTujuan}
                      onChange={setKecTujuan}
                      placeholder={kotaTujuan ? t.cekOngkir.destinationDistrict : t.cekOngkir.destinationCity}
                      emptyLabel={t.cekOngkir.cityNotFound}
                      disabled={!kotaTujuan}
                    />
                  </div>
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
                <p className="mt-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gms-gold px-6 py-3.5 text-sm font-bold text-gms-deep shadow-lg shadow-gms-gold/30 transition-all hover:-translate-y-0.5 hover:bg-gms-bright sm:w-auto"
              >
                <Calculator size={16} />
                {loading ? t.cekOngkir.calculating : t.cekOngkir.submitButton}
              </button>
            </form>

            <div className="hidden flex-col gap-4 lg:flex">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black/5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gms-corp text-gms-light">
                    <b.icon size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-gms-corp">{b.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {result && (
            <div className="mt-6 rounded-3xl border border-gms-gold/20 bg-gms-sky p-5 shadow-sm sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-gms-corp/70">
                    {result.asal.kota} ({result.asal.provinsi}) &rarr; {result.tujuan.kecamatan}, {result.tujuan.kota}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gms-deep sm:text-3xl">{formatRupiah(result.total)}</p>
                  <p className="mt-1 text-xs text-slate-500">{t.cekOngkir.resultDisclaimer}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gms-corp ring-1 ring-inset ring-gms-gold/30">
                  {resultLayananIndex >= 0 ? t.cekOngkir.serviceOptions[resultLayananIndex].label : result.layanan}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl bg-white p-3">
                  <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <MapPin size={12} /> {t.cekOngkir.route}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{result.tujuan.provinsi}</p>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Truck size={12} /> {t.cekOngkir.areaCategory}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{result.tujuan.kategoriArea}</p>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Clock3 size={12} /> {t.cekOngkir.estimatedArrival}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{estimasiHariLabel(result.leadTimeMin, result.leadTimeMax, language)}</p>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Boxes size={12} /> {t.cekOngkir.weightKoli}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {result.beratKg} kg &middot; {result.jumlahKoli} koli
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-10 sm:h-16" />
      </main>
      <Footer />
    </div>
  );
}
