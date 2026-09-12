import { createContext, useContext, useState, type ReactNode } from "react";
import type { UserRole } from "../types";

const AUTH_KEY = "gms-admin-authenticated";
const PROFILE_KEY = "gms-admin-profile";

export interface AdminProfile {
  nama: string;
  password: string;
  role: UserRole;
}

const DEFAULT_PROFILE: AdminProfile = { nama: "Admin - Dewi", password: "admin", role: "Admin" };

function loadProfile(): AdminProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return { ...DEFAULT_PROFILE, ...(JSON.parse(raw) as Partial<AdminProfile>) };
  } catch {
    // ignore corrupted storage, fall back to default profile
  }
  return DEFAULT_PROFILE;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  profile: AdminProfile;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (data: { nama: string }) => void;
  changePassword: (currentPassword: string, newPassword: string) => boolean;
  /** Demo-only: lets the prototype be presented as either role without a
   * real second account. Real permission checks still key off `profile.role`. */
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Mock, client-only auth for the prototype (no backend). Username is fixed
 * ("admin"); password, display name, and role are editable/switchable and
 * persisted to localStorage - this only gates navigation in the demo, it is
 * not real security.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem(AUTH_KEY) === "true");
  const [profile, setProfile] = useState<AdminProfile>(loadProfile);

  function persist(next: AdminProfile) {
    setProfile(next);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  }

  function login(username: string, password: string): boolean {
    const ok = username.trim() === "admin" && password === profile.password;
    if (ok) {
      sessionStorage.setItem(AUTH_KEY, "true");
      setIsAuthenticated(true);
    }
    return ok;
  }

  function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  }

  function updateProfile(data: { nama: string }) {
    persist({ ...profile, nama: data.nama });
  }

  function changePassword(currentPassword: string, newPassword: string): boolean {
    if (currentPassword !== profile.password) return false;
    persist({ ...profile, password: newPassword });
    return true;
  }

  function switchRole(role: UserRole) {
    persist({ ...profile, role });
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, profile, login, logout, updateProfile, changePassword, switchRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
