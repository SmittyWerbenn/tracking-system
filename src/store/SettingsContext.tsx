import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../utils/apiClient";
import { useAuth } from "./AuthContext";

interface Settings {
  stagnantThresholdDays: number;
  emailSendingEnabled: boolean;
  helpPhoneNumber: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  contactHours: string;
}

const DEFAULT_SETTINGS: Settings = {
  stagnantThresholdDays: 3,
  emailSendingEnabled: true,
  helpPhoneNumber: "0812-0000-8899",
  contactPhone: "021-2200-8899",
  contactEmail: "cs@gms-logistics.co.id",
  contactAddress: "Jl. Raya Cakung No. 88, Cakung, Jakarta Timur, DKI Jakarta",
  contactHours: "Senin - Sabtu, 08.00 - 18.00 WIB",
};

export interface ContactInfoInput {
  helpPhoneNumber: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  contactHours: string;
}

interface SettingsContextValue {
  settings: Settings;
  isLoading: boolean;
  setStagnantThresholdDays: (days: number) => Promise<void>;
  setEmailSendingEnabled: (enabled: boolean) => Promise<void>;
  /** Superadmin-only - the backend rejects this from any other role. */
  setHelpPhoneNumber: (phone: string) => Promise<void>;
  /** Superadmin-only: details shown on the public Contact page. */
  setContactInfo: (info: ContactInfoInput) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    api
      .get<Settings>("/api/settings")
      .then(setSettings)
      .catch(() => setSettings(DEFAULT_SETTINGS))
      .finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  async function setStagnantThresholdDays(days: number) {
    await api.patch("/api/settings", { stagnantThresholdDays: days });
    setSettings((s) => ({ ...s, stagnantThresholdDays: days }));
  }

  async function setEmailSendingEnabled(enabled: boolean) {
    await api.patch("/api/settings", { emailSendingEnabled: enabled });
    setSettings((s) => ({ ...s, emailSendingEnabled: enabled }));
  }

  async function setHelpPhoneNumber(phone: string) {
    await api.patch("/api/settings", { helpPhoneNumber: phone });
    setSettings((s) => ({ ...s, helpPhoneNumber: phone }));
  }

  async function setContactInfo(info: ContactInfoInput) {
    await api.patch("/api/settings", info);
    setSettings((s) => ({ ...s, ...info }));
  }

  return (
    <SettingsContext.Provider
      value={{ settings, isLoading, setStagnantThresholdDays, setEmailSendingEnabled, setHelpPhoneNumber, setContactInfo }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
