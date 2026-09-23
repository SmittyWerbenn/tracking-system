import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

/** For general admin-edit routes (Buat Pengiriman, Pengaturan, Manajemen
 * Armada/Kota) - only Superadmin and Admin qualify. Driver and Viewer are
 * both bounced to the Dashboard rather than seeing a page they can't act on. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAuthenticated, profile } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  if (profile.role !== "Superadmin" && profile.role !== "Admin") {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

/** For Update Tracking specifically - Superadmin, Admin, and Driver all
 * qualify (a Driver's one job is logging status/delivery updates), only
 * Viewer is bounced to the Dashboard. */
export function RequireTrackingUpdater({ children }: { children: ReactNode }) {
  const { isAuthenticated, profile } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  if (profile.role === "Viewer") {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

/** For routes only Superadmin may open (Manajemen User) - Admin and Viewer
 * are both bounced to the Dashboard. */
export function RequireSuperadmin({ children }: { children: ReactNode }) {
  const { isAuthenticated, profile } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  if (profile.role !== "Superadmin") {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
