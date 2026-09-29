import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../utils/apiClient";

const FALLBACK_PHONE_DISPLAY = "0812-0000-8899";

/** Converts a displayed Indonesian phone number ("0812-0000-8899") into the
 * digits-only format wa.me links need, swapping the country code in for a
 * leading "0". */
export function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return `62${digits}`;
}

interface HelpContactContextValue {
  helpPhoneDisplay: string;
  helpWhatsAppNumber: string;
}

const HelpContactContext = createContext<HelpContactContextValue>({
  helpPhoneDisplay: FALLBACK_PHONE_DISPLAY,
  helpWhatsAppNumber: toWhatsAppNumber(FALLBACK_PHONE_DISPLAY),
});

/**
 * Nomor Bantuan (CS/admin contact number) - configurable by Superadmin
 * under Pengaturan, fetched here from the public settings endpoint (no
 * auth - both the public Contact page and the driver portal need it, and
 * neither has settings.view) and shared app-wide so an edit takes effect
 * everywhere without a redeploy.
 */
export function HelpContactProvider({ children }: { children: ReactNode }) {
  const [helpPhoneDisplay, setHelpPhoneDisplay] = useState(FALLBACK_PHONE_DISPLAY);

  useEffect(() => {
    api
      .get<{ helpPhoneNumber: string }>("/api/public/settings", { auth: false })
      .then((res) => {
        if (res.helpPhoneNumber) setHelpPhoneDisplay(res.helpPhoneNumber);
      })
      .catch(() => {});
  }, []);

  return (
    <HelpContactContext.Provider
      value={{ helpPhoneDisplay, helpWhatsAppNumber: toWhatsAppNumber(helpPhoneDisplay) }}
    >
      {children}
    </HelpContactContext.Provider>
  );
}

export function useHelpContact() {
  return useContext(HelpContactContext);
}
