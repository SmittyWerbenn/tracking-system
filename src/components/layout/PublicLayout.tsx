import { ArrowRight, Calculator, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import logoIcon from "../../assets/icon-mark.png";

type NavItem =
  | { kind: "route"; to: string; label: string; end?: boolean }
  | { kind: "anchor"; sectionId: string; label: string };

const navItems: NavItem[] = [
  { kind: "route", to: "/", label: "Beranda", end: true },
  { kind: "anchor", sectionId: "tentang", label: "Tentang Kami" },
  { kind: "anchor", sectionId: "layanan", label: "Layanan" },
  { kind: "anchor", sectionId: "keunggulan", label: "Keunggulan" },
];

interface PublicLayoutProps {
  children: ReactNode;
  /** Use a wider content container - for content-rich pages like the company profile. */
  wide?: boolean;
}

export function PublicLayout({ children, wide = false }: PublicLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
              <p className="text-[11px] text-slate-500 sm:text-xs">Jasa Logistik &amp; Pengiriman</p>
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
              Cek Ongkir
            </NavLink>
            <NavLink
              to="/tracking"
              className="ml-2 inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
            >
              Lacak Paket
              <ArrowRight size={14} />
            </NavLink>
          </nav>

          <button
            className="rounded-md p-2 text-slate-700 hover:bg-slate-100 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
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
                Cek Ongkir
              </NavLink>
              <NavLink
                to="/tracking"
                onClick={() => setMobileOpen(false)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-2.5 text-sm font-semibold text-white"
              >
                Lacak Paket
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
                <p className="text-sm font-semibold text-slate-900">GMS Logistics</p>
              </div>
              <p className="mt-3 max-w-xs text-xs leading-relaxed text-slate-500">
                Perusahaan jasa logistik dan pengiriman barang antar kota, didukung sistem digital
                agar proses layanan lebih transparan dan efisien.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Navigasi</p>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
                <li>
                  <NavLink to="/" className="hover:text-blue-800">
                    Beranda
                  </NavLink>
                </li>
                <li>
                  <button onClick={() => goToSection("tentang")} className="text-left hover:text-blue-800">
                    Tentang Kami
                  </button>
                </li>
                <li>
                  <button onClick={() => goToSection("layanan")} className="text-left hover:text-blue-800">
                    Layanan
                  </button>
                </li>
                <li>
                  <NavLink to="/cek-ongkir" className="hover:text-blue-800">
                    Cek Ongkir
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/tracking" className="hover:text-blue-800">
                    Lacak Paket
                  </NavLink>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Kontak</p>
              <p className="mt-3 text-sm text-slate-600">
                Butuh bantuan seputar layanan kami? Kunjungi halaman{" "}
                <NavLink to="/kontak" className="font-medium text-blue-800 hover:underline">
                  Hubungi Kami
                </NavLink>{" "}
                untuk kontak tim customer service kami.
              </p>
              <NavLink
                to="/admin"
                className="mt-4 inline-block text-[11px] text-slate-300 hover:text-slate-500"
              >
                Portal Admin
              </NavLink>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6 text-center">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} PT Gangsar Mitra Suatama · Sistem Tracking &amp; Resi Digital
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
