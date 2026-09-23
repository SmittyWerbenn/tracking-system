import { createContext, useContext, type ReactNode } from "react";
import type { NotificationItem, NotificationTrigger } from "../types";
import { initialNotifications } from "../data/masterData";
import { usePersistedState } from "../utils/usePersistedState";

// Bump this suffix whenever initialNotifications in masterData.ts changes
// meaningfully (e.g. its AWB references) so browsers with an older cached
// copy in localStorage pick up the new set instead of keeping stale data.
const STORAGE_KEY = "gms-notifications-v2";

export interface AddNotificationInput {
  awb: string;
  trigger: NotificationTrigger;
  subject: string;
  toEmail: string;
  toName: string;
  recipientRole: "penerima" | "pengirim";
}

interface NotificationContextValue {
  notifications: NotificationItem[];
  addNotification: (input: AddNotificationInput) => NotificationItem;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = usePersistedState<NotificationItem[]>(
    STORAGE_KEY,
    initialNotifications,
  );

  function addNotification(input: AddNotificationInput): NotificationItem {
    const item: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      ...input,
    };
    setNotifications((prev) => [item, ...prev]);
    return item;
  }

  return (
    <NotificationContext.Provider value={{ notifications, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
