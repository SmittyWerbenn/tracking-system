import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../utils/apiClient";
import { useAuth } from "./AuthContext";

interface Settings {
  stagnantThresholdDays: number;
  emailSendingEnabled: boolean;
}

const DEFAULT_SETTINGS: Settings = { stagnantThresholdDays: 3, emailSendingEnabled: true };

interface SettingsContextValue {
  settings: Settings;
  isLoading: boolean;
  setStagnantThresholdDays: (days: number) => Promise<void>;
  setEmailSendingEnabled: (enabled: boolean) => Promise<void>;
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

  return (
    <SettingsContext.Provider value={{ settings, isLoading, setStagnantThresholdDays, setEmailSendingEnabled }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
