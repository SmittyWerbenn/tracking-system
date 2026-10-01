import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../utils/apiClient";

const FALLBACK_PHONE_DISPLAY = "0812-0000-8899";

// Shown on the public Contact page until/unless Superadmin edits them under
// Pengaturan. Same text the page used to hardcode.
export const CONTACT_DEFAULTS = {
  contactPhone: "021-2200-8899",
  contactEmail: "cs@gms-logistics.co.id",
  contactAddress: "Jl. Raya Cakung No. 88, Cakung, Jakarta Timur, DKI Jakarta",
  contactHours: "Senin - Sabtu, 08.00 - 18.00 WIB",
};

/** Digits-only, keeping a leading "+", for tel: links. */
export function toTelHref(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return `tel:${cleaned}`;
}

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
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  contactHours: string;
}

const HelpContactContext = createContext<HelpContactContextValue>({
  helpPhoneDisplay: FALLBACK_PHONE_DISPLAY,
  helpWhatsAppNumber: toWhatsAppNumber(FALLBACK_PHONE_DISPLAY),
  ...CONTACT_DEFAULTS,
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
  const [contact, setContact] = useState(CONTACT_DEFAULTS);

  useEffect(() => {
    api
      .get<
        {
          helpPhoneNumber: string;
        } & Partial<typeof CONTACT_DEFAULTS>
      >("/api/public/settings", { auth: false })
      .then((res) => {
        if (res.helpPhoneNumber) setHelpPhoneDisplay(res.helpPhoneNumber);
        setContact({
          contactPhone: res.contactPhone || CONTACT_DEFAULTS.contactPhone,
          contactEmail: res.contactEmail || CONTACT_DEFAULTS.contactEmail,
          contactAddress: res.contactAddress || CONTACT_DEFAULTS.contactAddress,
          contactHours: res.contactHours || CONTACT_DEFAULTS.contactHours,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <HelpContactContext.Provider
      value={{ helpPhoneDisplay, helpWhatsAppNumber: toWhatsAppNumber(helpPhoneDisplay), ...contact }}
    >
      {children}
    </HelpContactContext.Provider>
  );
}

export function useHelpContact() {
  return useContext(HelpContactContext);
}
