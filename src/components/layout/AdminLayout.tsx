import {
  History,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Menu,
  MessageSquare,
  Package,
  PackagePlus,
  Settings,
  Shield,
  Truck,
  Users,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import type { UserRole } from "../../types";
import { initials } from "../../utils/initials";
import { NotificationBell } from "./NotificationBell";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  adminOnly?: boolean;
}

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Operasional",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/admin/pengiriman/baru", label: "Buat Pengiriman", icon: PackagePlus, end: true, adminOnly: true },
      { to: "/admin/pengiriman", label: "Data Pengiriman", icon: Package, end: true },
    ],
  },
  {
    title: "Master Data",
    items: [
      { to: "/admin/armada", label: "Master Armada", icon: Truck, end: false },
      { to: "/admin/kota", label: "Kota & Titik Transit", icon: MapPinned, end: true },
    ],
  },
  {
    title: "Layanan",
    items: [{ to: "/admin/feedback", label: "Feedback Customer", icon: MessageSquare, end: true }],
  },
  {
    title: "Sistem",
    items: [
      { to: "/admin/users", label: "Manajemen User", icon: Users, end: true, adminOnly: true },
      { to: "/admin/audit-log", label: "Audit Log", icon: History, end: true },
      { to: "/admin/pengaturan/tracking", label: "Pengaturan", icon: Settings, end: true, adminOnly: true },
    ],
  },
];

const ROLE_OPTIONS: UserRole[] = ["Admin", "Management"];

export function AdminLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout, profile, switchRole } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      {/* Top bar */}
      <header className="no-print sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Buka menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-900 text-white">
              <Truck size={18} />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900">Gangsar Mitra Sautama</p>
              <p className="text-xs text-slate-500">Sistem Tracking &amp; Resi Digital</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="hidden items-center gap-1 rounded-lg bg-slate-100 p-1 sm:flex"
            title="Demo: ganti peran untuk melihat tampilan Admin vs Management"
          >
            {ROLE_OPTIONS.map((role) => (
              <button
                key={role}
                onClick={() => switchRole(role)}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  profile.role === role ? "bg-white text-blue-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Shield size={12} />
                {role}
              </button>
            ))}
          </div>
          <NotificationBell />
          <NavLink
            to="/admin/pengaturan/akun"
            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-100"
            title="Pengaturan Akun"
          >
            <span className="hidden text-sm text-slate-500 sm:block">{profile.nama}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700">
              {initials(profile.nama)}
            </div>
          </NavLink>
          <button
            onClick={handleLogout}
            title="Keluar"
            className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <LogOut size={17} />
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`no-print fixed inset-y-0 left-0 top-16 z-20 w-64 transform overflow-y-auto border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="flex flex-col gap-4 p-4">
            {navGroups.map((group) => {
              const items = group.items.filter((item) => !item.adminOnly || profile.role === "Admin");
              if (items.length === 0) return null;
              return (
                <div key={group.title}>
                  <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {group.title}
                  </p>
                  <div className="flex flex-col gap-1">
                    {items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-blue-900 text-white"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          }`
                        }
                      >
                        <item.icon size={18} />
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>
          <div className="mx-4 mt-2 rounded-lg bg-slate-50 p-3 sm:hidden">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Demo: Peran Aktif
            </p>
            <div className="flex items-center gap-1 rounded-lg bg-white p-1">
              {ROLE_OPTIONS.map((role) => (
                <button
                  key={role}
                  onClick={() => switchRole(role)}
                  className={`flex-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    profile.role === role ? "bg-blue-900 text-white" : "text-slate-500"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
          <div className="mx-4 mt-2 rounded-lg bg-slate-50 p-4 text-xs text-slate-500">
            <p className="font-medium text-slate-700">Fase 1 - Prototype</p>
            <p className="mt-1">
              Modul tracking &amp; resi digital. Data ditampilkan menggunakan mock data lokal.
            </p>
          </div>
        </aside>

        {mobileOpen && (
          <div
            className="no-print fixed inset-0 z-10 bg-black/30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8 print:p-0">{children}</main>
      </div>
    </div>
  );
}
