import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { NotificationItem, NotificationTrigger } from "../types";
import { api } from "../utils/apiClient";
import { useAuth } from "./AuthContext";

interface NotificationRow {
  id: string;
  awb: string;
  trigger_type: NotificationTrigger;
  subject: string;
  to_email: string;
  to_name: string;
  recipient_role: "penerima" | "pengirim";
  created_at: string;
}

function toItem(row: NotificationRow): NotificationItem {
  return {
    id: row.id,
    awb: row.awb,
    trigger: row.trigger_type,
    subject: row.subject,
    toEmail: row.to_email,
    toName: row.to_name,
    recipientRole: row.recipient_role,
    createdAt: row.created_at,
  };
}

interface NotificationContextValue {
  notifications: NotificationItem[];
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

/** Notifications are created server-side (see api-worker/src/routes/shipments.ts)
 * whenever a shipment is created or reaches Kendala/Selesai - this context
 * only ever reads the feed, it never creates entries itself. */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function refresh() {
    setIsLoading(true);
    try {
      const res = await api.get<{ items: NotificationRow[] }>("/api/notifications?limit=100");
      setNotifications(res.items.map(toItem));
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) refresh();
    else setNotifications([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <NotificationContext.Provider value={{ notifications, isLoading, refresh }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
