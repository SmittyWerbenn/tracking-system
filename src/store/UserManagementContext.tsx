import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AppUser, UserRole } from "../types";
import { api, uploadFile } from "../utils/apiClient";
import { useAuth } from "./AuthContext";

interface UserRow {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
  aktif: number;
  foto_file_id: string | null;
  last_login_at: string | null;
}

function toAppUser(row: UserRow): AppUser {
  return {
    id: row.id,
    nama: row.nama,
    email: row.email,
    role: row.role,
    aktif: row.aktif === 1,
    lastLogin: row.last_login_at ?? undefined,
    foto: row.foto_file_id ?? undefined,
  };
}

export interface UserFormData {
  nama: string;
  email: string;
  role: UserRole;
  /** A freshly-picked photo as a data URL (from compressImage); uploaded
   * to storage before the user record is written. Leave unset to keep the
   * existing photo on an edit. */
  fotoDataUrl?: string;
  /** Set only when creating a user, or when explicitly resetting one's
   * password - omit on a plain profile edit to leave it unchanged. */
  password?: string;
}

interface UserManagementContextValue {
  users: AppUser[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  createUser: (data: UserFormData) => Promise<void>;
  updateUser: (id: string, data: UserFormData) => Promise<void>;
  setUserActive: (id: string, aktif: boolean) => Promise<void>;
}

const UserManagementContext = createContext<UserManagementContextValue | null>(null);

export function UserManagementProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, profile } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function refresh() {
    if (profile?.role !== "Superadmin") return;
    setIsLoading(true);
    try {
      const res = await api.get<{ items: UserRow[] }>("/api/users?limit=100");
      setUsers(res.items.map(toAppUser));
    } catch {
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated && profile?.role === "Superadmin") refresh();
    else setUsers([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, profile?.role]);

  async function createUser(data: UserFormData) {
    let fotoFileId: string | undefined;
    const tempId = crypto.randomUUID();
    if (data.fotoDataUrl) {
      const uploaded = await uploadFile(data.fotoDataUrl, "user_avatar", tempId);
      fotoFileId = uploaded.id;
    }
    await api.post("/api/users", { nama: data.nama, email: data.email, role: data.role, password: data.password, fotoFileId });
    await refresh();
  }

  async function updateUser(id: string, data: UserFormData) {
    let fotoFileId: string | undefined;
    if (data.fotoDataUrl) {
      const uploaded = await uploadFile(data.fotoDataUrl, "user_avatar", id);
      fotoFileId = uploaded.id;
    }
    await api.patch(`/api/users/${id}`, {
      nama: data.nama,
      email: data.email,
      role: data.role,
      password: data.password || undefined,
      fotoFileId,
    });
    await refresh();
  }

  async function setUserActive(id: string, aktif: boolean) {
    await api.patch(`/api/users/${id}`, { aktif });
    await refresh();
  }

  return (
    <UserManagementContext.Provider value={{ users, isLoading, refresh, createUser, updateUser, setUserActive }}>
      {children}
    </UserManagementContext.Provider>
  );
}

export function useUserManagement() {
  const ctx = useContext(UserManagementContext);
  if (!ctx) throw new Error("useUserManagement must be used within UserManagementProvider");
  return ctx;
}
