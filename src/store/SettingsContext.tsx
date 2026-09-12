import { createContext, useContext, type ReactNode } from "react";
import { usePersistedState } from "../utils/usePersistedState";

const STORAGE_KEY = "gms-settings-v1";

interface Settings {
  stagnantThresholdDays: number;
  emailSendingEnabled: boolean;
}

const DEFAULT_SETTINGS: Settings = { stagnantThresholdDays: 3, emailSendingEnabled: true };

interface SettingsContextValue {
  settings: Settings;
  setStagnantThresholdDays: (days: number) => void;
  setEmailSendingEnabled: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Stored settings may predate a field added later (e.g. emailSendingEnabled) -
  // merge over the defaults so older localStorage values still get it.
  const [storedSettings, setSettings] = usePersistedState<Partial<Settings>>(STORAGE_KEY, DEFAULT_SETTINGS);
  const settings: Settings = { ...DEFAULT_SETTINGS, ...storedSettings };

  function setStagnantThresholdDays(days: number) {
    setSettings({ ...settings, stagnantThresholdDays: days });
  }

  function setEmailSendingEnabled(enabled: boolean) {
    setSettings({ ...settings, emailSendingEnabled: enabled });
  }

  return (
    <SettingsContext.Provider value={{ settings, setStagnantThresholdDays, setEmailSendingEnabled }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
