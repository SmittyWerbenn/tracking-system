import { ArrowRight, Calculator, Check, ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import logoIcon from "../../assets/icon-mark.png";
import { FlagEN, FlagID } from "../FlagIcon";
import { useLanguage } from "../../store/LanguageContext";
import type { Language } from "../../data/translations";

const LANGUAGE_OPTIONS: { value: Language; label: string; Flag: typeof FlagID }[] = [
  { value: "id", label: "Indonesia", Flag: FlagID },
  { value: "en", label: "English", Flag: FlagEN },
];

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const CurrentFlag = LANGUAGE_OPTIONS.find((opt) => opt.value === language)?.Flag ?? FlagID;

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        aria-label="Pilih bahasa / Choose language"
      >
        <CurrentFlag className="h-3.5 w-5 shrink-0 rounded-[2px]" />
        <span className="uppercase">{language}</span>
        <ChevronDown size={13} />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1.5 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {LANGUAGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setLanguage(opt.value);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              <opt.Flag className="h-3.5 w-5 shrink-0 rounded-[2px]" />
              <span className="flex-1">{opt.label}</span>
              {language === opt.value && <Check size={14} className="text-blue-700" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface PublicLayoutProps {
  children: ReactNode;
  /** Use a wider content container - for content-rich pages like the company profile. */
  wide?: boolean;
}

export function PublicLayout({ children, wide = false }: PublicLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  type NavItem =
    | { kind: "route"; to: string; label: string; end?: boolean }
    | { kind: "anchor"; sectionId: string; label: string };

  const navItems: NavItem[] = [
    { kind: "route", to: "/", label: t.nav.home, end: true },
    { kind: "anchor", sectionId: "tentang", label: t.nav.about },
    { kind: "anchor", sectionId: "layanan", label: t.nav.services },
    { kind: "anchor", sectionId: "keunggulan", label: t.nav.advantages },
  ];

  function goToSection(sectionId: string) {
    setMobileOpen(false);
    if (location.pathname === "/") {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/", { state: { scrollTo: sectionId } });
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
            <img src={logoIcon} alt="GMS Logistics" className="h-9 w-9 shrink-0 object-contain" />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900 sm:text-base">GMS Logistics</p>
              <p className="text-[11px] text-slate-500 sm:text-xs">{t.nav.tagline}</p>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) =>
              item.kind === "route" ? (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive ? "bg-blue-50 text-blue-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ) : (
                <button
                  key={item.sectionId}
                  onClick={() => goToSection(item.sectionId)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  {item.label}
                </button>
              ),
            )}
            <NavLink
              to="/cek-ongkir"
              className="ml-2 inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2 text-sm font-semibold text-blue-900 transition-colors hover:bg-blue-100"
            >
              <Calculator size={14} />
              {t.nav.checkPrice}
            </NavLink>
            <NavLink
              to="/tracking"
              className="ml-2 inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
            >
              {t.nav.trackPackage}
              <ArrowRight size={14} />
            </NavLink>
            <div className="ml-2">
              <LanguageSwitcher />
            </div>
          </nav>

          <div className="flex items-center gap-1.5 md:hidden">
            <LanguageSwitcher />
            <button
              className="rounded-md p-2 text-slate-700 hover:bg-slate-100"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? t.nav.closeMenu : t.nav.openMenu}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="flex flex-col gap-0.5 border-t border-slate-100 px-4 py-3 md:hidden">
            {navItems.map((item) =>
              item.kind === "route" ? (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                      isActive ? "bg-blue-50 text-blue-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ) : (
                <button
                  key={item.sectionId}
                  onClick={() => goToSection(item.sectionId)}
                  className="rounded-md px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  {item.label}
                </button>
              ),
            )}
            <div className="mt-1 flex gap-2">
              <NavLink
                to="/cek-ongkir"
                onClick={() => setMobileOpen(false)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2.5 text-sm font-semibold text-blue-900"
              >
                <Calculator size={14} />
                {t.nav.checkPrice}
              </NavLink>
              <NavLink
                to="/tracking"
                onClick={() => setMobileOpen(false)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-2.5 text-sm font-semibold text-white"
              >
                {t.nav.trackPackage}
                <ArrowRight size={14} />
              </NavLink>
            </div>
          </nav>
        )}
      </header>

      <main className={`mx-auto w-full flex-1 px-4 py-6 sm:px-6 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div>
              <div className="flex items-center gap-2.5">
                <img src={logoIcon} alt="GMS Logistics" className="h-9 w-9 shrink-0 object-contain" />
                <p className="text-sm font-semibold text-slate-900">{t.footer.tagline}</p>
              </div>
              <p className="mt-3 max-w-xs text-xs leading-relaxed text-slate-500">{t.footer.description}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t.footer.navHeading}</p>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
                <li>
                  <NavLink to="/" className="hover:text-blue-800">
                    {t.nav.home}
                  </NavLink>
                </li>
                <li>
                  <button onClick={() => goToSection("tentang")} className="text-left hover:text-blue-800">
                    {t.nav.about}
                  </button>
                </li>
                <li>
                  <button onClick={() => goToSection("layanan")} className="text-left hover:text-blue-800">
                    {t.nav.services}
                  </button>
                </li>
                <li>
                  <NavLink to="/cek-ongkir" className="hover:text-blue-800">
                    {t.nav.checkPrice}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/tracking" className="hover:text-blue-800">
                    {t.nav.trackPackage}
                  </NavLink>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t.footer.contactHeading}</p>
              <p className="mt-3 text-sm text-slate-600">
                {t.footer.contactText}{" "}
                <NavLink to="/kontak" className="font-medium text-blue-800 hover:underline">
                  {t.footer.contactLink}
                </NavLink>{" "}
                {t.footer.contactTextAfter}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6 text-center">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} {t.footer.copyright}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
