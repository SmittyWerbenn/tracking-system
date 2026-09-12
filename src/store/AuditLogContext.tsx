import { createContext, useContext, type ReactNode } from "react";
import type { AuditAction, AuditLogEntry, UserRole } from "../types";
import { initialAuditLog } from "../data/masterData";
import { usePersistedState } from "../utils/usePersistedState";

const STORAGE_KEY = "gms-audit-log-v1";

export interface AddLogInput {
  userName: string;
  role: UserRole;
  action: AuditAction;
  actionLabel: string;
  module: string;
  awb?: string;
  description: string;
}

interface AuditLogContextValue {
  entries: AuditLogEntry[];
  addLog: (input: AddLogInput) => void;
}

const AuditLogContext = createContext<AuditLogContextValue | null>(null);

export function AuditLogProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = usePersistedState<AuditLogEntry[]>(STORAGE_KEY, initialAuditLog);

  function addLog(input: AddLogInput) {
    const entry: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...input,
    };
    setEntries((prev) => [entry, ...prev]);
  }

  return <AuditLogContext.Provider value={{ entries, addLog }}>{children}</AuditLogContext.Provider>;
}

export function useAuditLog() {
  const ctx = useContext(AuditLogContext);
  if (!ctx) throw new Error("useAuditLog must be used within AuditLogProvider");
  return ctx;
}
