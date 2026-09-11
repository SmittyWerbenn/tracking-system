import { createContext, useContext, useState, type ReactNode } from "react";

const AUTH_KEY = "gms-admin-authenticated";

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Mock, client-only auth for the prototype (no backend). Credentials are
 * intentionally hardcoded (admin/admin) — this only gates navigation in the
 * demo, it is not real security.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem(AUTH_KEY) === "true");

  function login(username: string, password: string): boolean {
    const ok = username.trim() === "admin" && password === "admin";
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

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
