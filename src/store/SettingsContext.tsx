import { createContext, useContext, type ReactNode } from "react";
import { usePersistedState } from "../utils/usePersistedState";

const STORAGE_KEY = "gms-settings-v1";

interface Settings {
  stagnantThresholdDays: number;
}

const DEFAULT_SETTINGS: Settings = { stagnantThresholdDays: 3 };

interface SettingsContextValue {
  settings: Settings;
  setStagnantThresholdDays: (days: number) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = usePersistedState<Settings>(STORAGE_KEY, DEFAULT_SETTINGS);

  function setStagnantThresholdDays(days: number) {
    setSettings((prev) => ({ ...prev, stagnantThresholdDays: days }));
  }

  return (
    <SettingsContext.Provider value={{ settings, setStagnantThresholdDays }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
