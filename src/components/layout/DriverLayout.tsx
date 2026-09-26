import { LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import logoIcon from "../../assets/icon-mark.png";
import { useAuth } from "../../store/AuthContext";

/** Layout for the driver portal (/driver/*) - deliberately separate from
 * both the public site header and AdminLayout's sidebar. Mobile-first (a
 * driver in the field is the primary user), but widens up on tablet/desktop
 * instead of staying pinned to a phone-width column. */
export function DriverLayout({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/driver/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white px-4">
        <div className={`mx-auto flex h-14 items-center justify-between ${wide ? "max-w-4xl" : "max-w-2xl"}`}>
          <div className="flex min-w-0 items-center gap-2">
            <img src={logoIcon} alt="GMS Logistics" className="h-7 w-7 shrink-0 object-contain" />
            <span className="truncate text-sm font-semibold text-slate-900">Portal Driver</span>
          </div>
          <div className="flex items-center gap-3">
            {profile && <span className="hidden text-sm text-slate-500 sm:block">{profile.nama}</span>}
            <button
              onClick={handleLogout}
              title="Keluar"
              className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
      <main className={`mx-auto px-4 py-4 sm:px-6 ${wide ? "max-w-4xl" : "max-w-2xl"}`}>{children}</main>
    </div>
  );
}
