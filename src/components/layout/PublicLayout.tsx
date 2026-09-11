import { Menu, Truck, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Beranda", end: true },
  { to: "/tracking", label: "Lacak Kiriman", end: false },
  { to: "/tentang", label: "Tentang Kami", end: true },
  { to: "/kontak", label: "Hubungi Kami", end: true },
];

export function PublicLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-blue-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
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
          </nav>

          <button
            className="rounded-md p-2 text-white hover:bg-white/10 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Buka menu navigasi"
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
          </nav>
        )}
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6">{children}</main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center">
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} PT Gangsar Mitra Sautama · Sistem Tracking &amp; Resi Digital
        </p>
        <NavLink to="/admin" className="mt-1.5 inline-block text-[11px] text-slate-300 hover:text-slate-500">
          Portal Admin
        </NavLink>
      </footer>
    </div>
  );
}
