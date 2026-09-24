import {
  ArrowRight,
  Building2,
  Calculator,
  Camera,
  FileText,
  Gauge,
  Headset,
  Layers,
  LayoutDashboard,
  Mail,
  MapPinned,
  Monitor,
  Package,
  PackageCheck,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import heroImage from "../../assets/hero-package-handoff.jpg";
import { PublicLayout } from "../../components/layout/PublicLayout";
import { StatCard } from "../../components/StatCard";
import { useLanguage } from "../../store/LanguageContext";
import { useDocumentTitle } from "../../utils/useDocumentTitle";

// Figures provided by the business (includes pre-digitization manual
// operations, not just what's recorded in the tracking system).
const COMPANY_STATS = {
  totalPengiriman: "9.355+",
  kotaTerjangkau: "50+",
  armadaTruck: "70+",
};

const COMPANY_VALUE_ICONS: LucideIcon[] = [ShieldCheck, PackageCheck, Truck];
const SERVICE_ICONS: LucideIcon[] = [Truck, Headset, FileText, Camera];
const TECHNOLOGY_ICONS: LucideIcon[] = [Monitor, LayoutDashboard, Smartphone, Mail];
const ADVANTAGE_ICONS: LucideIcon[] = [ShieldCheck, Camera, Layers, MapPinned];
const TRUST_STRIP_ICONS: LucideIcon[] = [ShieldCheck, Gauge, Headset, TrendingUp];

export default function Home() {
  useDocumentTitle("Beranda");
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    if (state?.scrollTo) {
      const el = document.getElementById(state.scrollTo);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <PublicLayout wide>
      {/* Hero */}
      <section className="relative grid grid-cols-1 items-center gap-8 py-6 sm:py-10 lg:grid-cols-2 lg:gap-12">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute -left-20 top-1/3 h-64 w-64 rounded-full bg-blue-50 blur-3xl" />
        </div>
        <div className="animate-[fadeIn_0.5s_ease-out]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 ring-1 ring-inset ring-blue-100">
            <Sparkles size={12} />
            {t.home.heroBadge}
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-[2.75rem]">
            {t.home.heroTitleA} <span className="text-blue-700">{t.home.heroTitleHighlight}</span>
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">{t.home.heroDesc}</p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate("/kontak")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
            >
              {t.home.ctaContact}
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate("/cek-ongkir")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
            >
              <Calculator size={16} />
              {t.home.ctaCheckPrice}
            </button>
            <button
              onClick={() => scrollTo("layanan")}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              {t.home.ctaServices}
            </button>
          </div>
        </div>

        <div className="relative animate-[fadeIn_0.6s_ease-out]">
          <img
            src={heroImage}
            alt={t.home.heroImageAlt}
            className="aspect-[4/3] w-full rounded-2xl border border-slate-200 object-cover shadow-sm"
          />
          <div className="absolute -bottom-5 left-4 right-4 rounded-xl border border-slate-200 bg-white p-4 shadow-md sm:left-6 sm:right-auto sm:w-64">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <MapPinned size={17} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{t.home.coverageLabel}</p>
                <p className="text-sm font-semibold text-slate-900">
                  {COMPANY_STATS.kotaTerjangkau} {t.home.coverageSuffix}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="tentang" className="mt-16 scroll-mt-20 sm:mt-20">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-900 text-white">
              <Building2 size={19} />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl">{t.home.aboutHeading}</h2>
          </div>
          <div className="lg:col-span-2">
            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">{t.home.aboutP1}</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">{t.home.aboutP2}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {t.companyValues.map((v, i) => {
            const Icon = COMPANY_VALUE_ICONS[i];
            return (
              <div key={v.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
                  <Icon size={18} />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">{v.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Services */}
      <section id="layanan" className="mt-16 scroll-mt-20 sm:mt-20">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{t.home.servicesHeading}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 sm:text-base">{t.home.servicesDesc}</p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.services.map((s, i) => {
            const Icon = SERVICE_ICONS[i];
            return (
              <div
                key={s.title}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
                  <Icon size={19} />
                </div>
                <p className="mt-3.5 text-sm font-semibold text-slate-900">{s.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{s.desc}</p>
                <p className="mt-3 text-[11px] font-medium text-emerald-700">{s.benefit}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Solusi & Teknologi */}
      <section className="mt-16 sm:mt-20">
        <div className="rounded-2xl bg-blue-50/60 p-6 sm:p-10">
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{t.home.technologyHeading}</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 sm:text-base">{t.home.technologyDesc}</p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.home.technology.map((tech, i) => {
              const Icon = TECHNOLOGY_ICONS[i];
              return (
                <div key={tech.title} className="relative rounded-xl bg-white p-5 shadow-sm">
                  <span className="text-[11px] font-bold tracking-wide text-blue-200">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-900 text-white">
                    <Icon size={18} />
                  </div>
                  <p className="mt-3.5 text-sm font-semibold text-slate-900">{tech.title}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{tech.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section id="keunggulan" className="mt-16 scroll-mt-20 sm:mt-20">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{t.home.advantagesHeading}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 sm:text-base">{t.home.advantagesDesc}</p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.advantages.map((f, i) => {
            const Icon = ADVANTAGE_ICONS[i];
            return (
              <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
                  <Icon size={18} />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">{f.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats / trust */}
      <section className="mt-16 sm:mt-20">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{t.home.statsHeading}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 sm:text-base">{t.home.statsDesc}</p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label={t.home.statTotalShipments} value={COMPANY_STATS.totalPengiriman} icon={Package} accent="bg-blue-100 text-blue-700" />
          <StatCard label={t.home.statCitiesCovered} value={COMPANY_STATS.kotaTerjangkau} icon={MapPinned} accent="bg-amber-100 text-amber-700" />
          <StatCard label={t.home.statFleet} value={COMPANY_STATS.armadaTruck} icon={Truck} accent="bg-violet-100 text-violet-700" />
        </div>
      </section>

      {/* Trust strip */}
      <section className="mt-16 sm:mt-20">
        <div className="grid grid-cols-1 gap-4 border-t border-slate-200 pt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {t.home.trustStrip.map((label, i) => {
            const Icon = TRUST_STRIP_ICONS[i];
            return (
              <div key={label} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-900 text-white">
                  <Icon size={17} />
                </div>
                <p className="text-sm font-medium text-slate-700">{label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 rounded-2xl bg-blue-900 px-6 py-10 text-center text-white sm:mt-20 sm:py-14">
        <p className="text-xl font-bold sm:text-2xl">{t.home.ctaHeading}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-blue-100 sm:text-base">{t.home.ctaDesc}</p>
        <button
          onClick={() => navigate("/kontak")}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-900 shadow-sm transition-colors hover:bg-blue-50"
        >
          {t.home.ctaButton}
          <ArrowRight size={16} />
        </button>
      </section>
    </PublicLayout>
  );
}
