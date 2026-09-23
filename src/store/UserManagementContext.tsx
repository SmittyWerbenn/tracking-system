import { createContext, useContext, type ReactNode } from "react";
import type { AppUser, UserRole } from "../types";
import { initialUsers } from "../data/masterData";
import { usePersistedState } from "../utils/usePersistedState";
import { useAuditLog } from "./AuditLogContext";
import { useAuth } from "./AuthContext";

// Bump this suffix whenever the seed data in masterData.ts changes meaningfully
// so browsers with an older cached copy in localStorage pick up the new set
// instead of silently keeping stale data forever.
const STORAGE_KEY = "gms-users-v3";

export interface UserFormData {
  nama: string;
  email: string;
  role: UserRole;
  foto?: string;
  /** Demo-only: set when creating a user or explicitly resetting a password;
   * omit on a plain profile-field edit to leave the existing password intact. */
  password?: string;
}

interface UserManagementContextValue {
  users: AppUser[];
  createUser: (data: UserFormData) => AppUser;
  updateUser: (id: string, data: UserFormData) => void;
  setUserActive: (id: string, aktif: boolean) => void;
}

const UserManagementContext = createContext<UserManagementContextValue | null>(null);

export function UserManagementProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = usePersistedState<AppUser[]>(STORAGE_KEY, initialUsers);
  const { addLog } = useAuditLog();
  const { profile } = useAuth();

  function createUser(data: UserFormData): AppUser {
    const user: AppUser = { id: `usr-${Date.now()}`, aktif: true, ...data };
    setUsers((prev) => [...prev, user]);
    addLog({
      userName: profile.nama,
      role: profile.role,
      action: "CREATE_USER",
      actionLabel: "CREATE USER",
      module: "User",
      description: `User "${data.nama}" (${data.role}) ditambahkan.`,
    });
    return user;
  }

  function updateUser(id: string, data: UserFormData) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
    addLog({
      userName: profile.nama,
      role: profile.role,
      action: "UPDATE_USER",
      actionLabel: "UPDATE USER",
      module: "User",
      description: `Data user "${data.nama}" diperbarui.`,
    });
  }

  function setUserActive(id: string, aktif: boolean) {
    const user = users.find((u) => u.id === id);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, aktif } : u)));
    if (user) {
      addLog({
        userName: profile.nama,
        role: profile.role,
        action: "UPDATE_USER",
        actionLabel: "UPDATE USER",
        module: "User",
        description: `User "${user.nama}" ${aktif ? "diaktifkan" : "dinonaktifkan"}.`,
      });
    }
  }

  return (
    <UserManagementContext.Provider value={{ users, createUser, updateUser, setUserActive }}>
      {children}
    </UserManagementContext.Provider>
  );
}

export function useUserManagement() {
  const ctx = useContext(UserManagementContext);
  if (!ctx) throw new Error("useUserManagement must be used within UserManagementProvider");
  return ctx;
}
