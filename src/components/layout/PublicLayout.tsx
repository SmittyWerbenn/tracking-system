import { ArrowRight, Menu, Truck, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/tracking", label: "Tracking", end: false },
  { to: "/tentang", label: "Tentang Kami", end: true },
  { to: "/kontak", label: "Hubungi Kami", end: true },
];

interface PublicLayoutProps {
  children: ReactNode;
  /** Use a wider content container - for content-rich pages like the company profile. */
  wide?: boolean;
}

export function PublicLayout({ children, wide = false }: PublicLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-blue-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
              <Truck size={18} />
            </div>
            <div className="leading-tight text-white">
              <p className="text-sm font-semibold sm:text-base">PT Gangsar Mitra Sautama</p>
              <p className="text-[11px] text-blue-200 sm:text-xs">Tracking Pengiriman</p>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? "bg-white/15 text-white" : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to="/tracking"
              className="ml-2 inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-blue-900 transition-colors hover:bg-blue-50"
            >
              Lacak Paket
              <ArrowRight size={14} />
            </NavLink>
          </nav>

          <button
            className="rounded-md p-2 text-white hover:bg-white/10 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <nav className="flex flex-col gap-0.5 border-t border-white/10 px-4 py-3 md:hidden">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? "bg-white/15 text-white" : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to="/tracking"
              onClick={() => setMobileOpen(false)}
              className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-white px-3.5 py-2.5 text-sm font-semibold text-blue-900"
            >
              Lacak Paket
              <ArrowRight size={14} />
            </NavLink>
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
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-900 text-white">
                  <Truck size={16} />
                </div>
                <p className="text-sm font-semibold text-slate-900">PT Gangsar Mitra Sautama</p>
              </div>
              <p className="mt-3 max-w-xs text-xs leading-relaxed text-slate-500">
                Layanan pengiriman barang antar kota dengan resi digital dan tracking real-time,
                agar setiap perjalanan barang Anda transparan dari awal hingga sampai tujuan.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Navigasi</p>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
                <li>
                  <NavLink to="/" className="hover:text-blue-800">
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/tracking" className="hover:text-blue-800">
                    Lacak Pengiriman
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/tentang" className="hover:text-blue-800">
                    Tentang Kami
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/kontak" className="hover:text-blue-800">
                    Hubungi Kami
                  </NavLink>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Info</p>
              <p className="mt-3 text-sm text-slate-600">
                Butuh bantuan seputar pengiriman? Kunjungi halaman{" "}
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
              © {new Date().getFullYear()} PT Gangsar Mitra Sautama · Sistem Tracking &amp; Resi Digital
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
