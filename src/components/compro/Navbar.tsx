import { Calculator, Check, ChevronDown, Menu, Package, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoIcon from "../../assets/icon-mark.png";
import { C } from "../../data/compro/content";
import type { Language } from "../../data/translations";
import { useLanguage } from "../../store/LanguageContext";
import { FlagEN, FlagID } from "../FlagIcon";
import { useL } from "./utils";

export const NAV_SECTIONS = [
  { id: "home", key: "home" },
  { id: "tentang", key: "about" },
  { id: "layanan", key: "services" },
  { id: "armada", key: "fleet" },
  { id: "coverage", key: "coverage" },
  { id: "kontak", key: "contact" },
] as const;

const LANGS: { value: Language; Flag: typeof FlagID }[] = [
  { value: "id", Flag: FlagID },
  { value: "en", Flag: FlagEN },
];

/** ID | EN segmented switcher. */
function LangSwitch({ solid }: { solid: boolean }) {
  const { language, setLanguage } = useLanguage();
  const l = useL();
  return (
    <div
      role="group"
      aria-label={l(C.nav.langLabel)}
      className={`inline-flex items-center rounded-full border p-0.5 text-base font-bold ${
        solid ? "border-slate-200 bg-gms-mist" : "border-white/25 bg-white/10"
      }`}
    >
      {LANGS.map(({ value, Flag }) => {
        const active = language === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setLanguage(value)}
            aria-pressed={active}
            className={`inline-flex min-h-8 items-center gap-1.5 rounded-full px-2.5 uppercase transition-colors ${
              active
                ? "bg-gms-gold text-gms-deep"
                : solid
                  ? "text-slate-600 hover:text-gms-corp"
                  : "text-white/80 hover:text-white"
            }`}
          >
            <Flag className="h-3 w-4 rounded-[2px]" />
            {value}
            {active && <Check size={11} aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}

export function Navbar({ overlay }: { overlay: boolean }) {
  const l = useL();
  const { language } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");
  const navigate = useNavigate();
  const location = useLocation();
  const onHome = location.pathname === "/";
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy for the active (gold) menu item.
  useEffect(() => {
    if (!onHome) return;
    const els = NAV_SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [onHome]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function go(id: string) {
    setOpen(false);
    if (onHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/", { state: { scrollTo: id } });
    }
  }

  const solid = scrolled || !overlay || open;
  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        solid ? "bg-white/95 shadow-sm backdrop-blur" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:h-24 lg:px-8">
        <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
          <img src={logoIcon} alt="GMS Logistics" className="h-12 w-12 shrink-0 object-contain" />
          <span className="shrink-0 leading-tight">
            <span className={`block whitespace-nowrap font-display text-3xl font-extrabold ${solid ? "text-gms-corp" : "text-white"}`}>
              GMS Logistics
            </span>
            <span className={`hidden whitespace-nowrap text-lg sm:block ${solid ? "text-slate-500" : "text-white/70"}`}>
              {l(C.hero.eyebrow)}
            </span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-0.5 xl:ml-8 xl:flex">
          {NAV_SECTIONS.map((s) => {
            const isActive = onHome && active === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => go(s.id)}
                aria-current={isActive ? "true" : undefined}
                className={`relative whitespace-nowrap rounded-md px-2.5 py-2 text-xl font-semibold transition-colors ${
                  isActive
                    ? solid
                      ? "text-gms-gold"
                      : "text-gms-light"
                    : solid
                      ? "text-slate-700 hover:text-gms-corp"
                      : "text-white/85 hover:text-white"
                }`}
              >
                {l(C.nav[s.key])}
                <span
                  aria-hidden
                  className={`absolute inset-x-3 -bottom-0.5 h-0.5 rounded bg-gms-gold transition-transform ${
                    isActive ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LangSwitch solid={solid} />
          <button
            type="button"
            className={`rounded-md p-2 xl:hidden ${solid ? "text-gms-corp hover:bg-gms-sky" : "text-white hover:bg-white/10"}`}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? l(C.nav.closeMenu) : l(C.nav.openMenu)}
            aria-expanded={open}
            aria-controls="compro-mobile-menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="compro-mobile-menu"
          ref={menuRef}
          className="fixed inset-x-0 top-20 z-50 max-h-[calc(100vh-80px)] overflow-y-auto bg-white px-4 pb-8 pt-3 shadow-lg xl:hidden"
        >
          <nav aria-label="Mobile" className="flex flex-col">
            {NAV_SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(s.id)}
                className={`flex min-h-12 items-center justify-between border-b border-slate-100 px-2 text-left text-2xl font-semibold ${
                  onHome && active === s.id ? "text-gms-gold" : "text-gms-corp"
                }`}
              >
                {l(C.nav[s.key])}
                <ChevronDown size={16} className="-rotate-90 text-slate-400" aria-hidden />
              </button>
            ))}
          </nav>
          <div className="mt-5 grid gap-2.5">
            <a
              href="https://gms-logistics.id/cek-ongkir"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-gms-gold font-bold text-gms-deep"
            >
              <Calculator size={18} />
              {language === "id" ? "Cek Ongkir" : "Check Rates"}
            </a>
            <a
              href="https://gms-logistics.id/tracking"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border-2 border-gms-gold font-bold text-gms-gold"
            >
              <Package size={18} />
              {language === "id" ? "Lacak Paket" : "Track Package"}
            </a>
            <button
              type="button"
              onClick={() => go("kontak")}
              className="inline-flex min-h-12 items-center justify-center rounded-lg border-2 border-gms-corp font-bold text-gms-corp"
            >
              {l(C.hero.ctaQuote)}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
