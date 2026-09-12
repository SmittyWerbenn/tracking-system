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

/** For routes only the Admin role may open at all (e.g. Buat Pengiriman,
 * Update Tracking, Manajemen User, Pengaturan). Management is bounced to
 * the Dashboard rather than seeing a page it can't act on. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAuthenticated, profile } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  if (profile.role !== "Admin") {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
