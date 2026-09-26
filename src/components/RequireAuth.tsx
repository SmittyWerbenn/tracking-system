import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-900" />
    </div>
  );
}

/** Driver accounts don't use /admin at all anymore - they have their own
 * portal at /driver. Every admin guard below checks this first and bounces
 * a Driver there instead of rendering any admin page. */
function driverRedirect(profile: { role: string } | null): ReactNode | null {
  if (profile?.role === "Driver") return <Navigate to="/driver" replace />;
  return null;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  const redirect = driverRedirect(profile);
  if (redirect) return redirect;

  return <>{children}</>;
}

/** For general admin-edit routes (Buat Pengiriman, Pengaturan, Manajemen
 * Armada/Kota) - only Superadmin and Admin qualify. Driver and Viewer are
 * both bounced to the Dashboard rather than seeing a page they can't act on. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  const redirect = driverRedirect(profile);
  if (redirect) return redirect;
  if (profile?.role !== "Superadmin" && profile?.role !== "Admin") {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

/** For Update Tracking specifically - Superadmin and Admin qualify. Driver
 * now uses the driver portal's own status-update flow instead of this
 * shared admin page, and Viewer is bounced to the Dashboard. */
export function RequireTrackingUpdater({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  const redirect = driverRedirect(profile);
  if (redirect) return redirect;
  if (profile?.role === "Viewer") {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

/** For the driver portal (/driver/*) - a fully separate app from /admin, so
 * this redirects to /driver/login (never /admin/login), and only a Driver
 * account may pass; any other role gets bounced back to /driver/login too,
 * since there's no "driver home" for them to land on. */
export function RequireDriver({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated || profile?.role !== "Driver") {
    return <Navigate to="/driver/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

/** For routes only Superadmin may open (Manajemen User) - Admin and Viewer
 * are both bounced to the Dashboard. */
export function RequireSuperadmin({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  const redirect = driverRedirect(profile);
  if (redirect) return redirect;
  if (profile?.role !== "Superadmin") {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
