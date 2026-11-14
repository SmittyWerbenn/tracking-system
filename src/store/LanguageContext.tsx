import { createContext, useContext, type ReactNode } from "react";
import { translations, type Language, type Translations } from "../data/translations";
import { usePersistedState } from "../utils/usePersistedState";

const STORAGE_KEY = "gms-language-v1";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

// A link such as /tracking/AWB123?lang=en opens in that language and remembers it, like the navbar toggle.
// Done before the provider reads storage, so the first render is already in the requested language.
try {
  const fromUrl = new URLSearchParams(window.location.search).get("lang");
  if (fromUrl === "en" || fromUrl === "id") localStorage.setItem(STORAGE_KEY, JSON.stringify(fromUrl));
} catch {
  // storage unavailable (private mode): the toggle still works for this visit
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = usePersistedState<Language>(STORAGE_KEY, "id");

  const value: LanguageContextValue = {
    language,
    setLanguage,
    t: translations[language],
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
