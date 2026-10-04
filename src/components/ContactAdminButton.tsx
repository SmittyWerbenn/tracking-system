import { Loader2, MessageCircle } from "lucide-react";
import { useState } from "react";
import { ApiError } from "../utils/apiClient";
import { fetchLupaPasswordTarget, notConfiguredMessage, type HelpTargetInfo } from "../utils/helpWhatsApp";
import { whatsappUrl } from "../utils/whatsapp";

/**
 * "Lupa Password" / "Hubungi Admin" on the login pages. Nobody is signed in
 * yet, so the WhatsApp number is looked up from the typed email: GMS-Admin
 * accounts go to WhatsApp Superadmin, everyone else to WhatsApp Admin (numbers
 * come from Pengaturan, the mapping lives in the API). When the number is not
 * configured it says so instead of opening an invalid link.
 */
export function ContactAdminButton({
  email,
  message,
  label = "Hubungi Admin",
  variant = "solid",
}: {
  email: string;
  /** Builds the WhatsApp text once the destination (Admin/Superadmin) is known. */
  message: (info: HelpTargetInfo) => string;
  label?: string;
  variant?: "solid" | "link";
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setFallbackUrl(null);
    if (!email.trim()) {
      setError("Isi email akun Anda terlebih dahulu, lalu klik lagi.");
      return;
    }
    setBusy(true);
    try {
      const info = await fetchLupaPasswordTarget(email);
      const url = info.configured ? whatsappUrl(info.number, message(info)) : null;
      if (!url) {
        setError(notConfiguredMessage(info));
        return;
      }
      const win = window.open(url, "_blank");
      if (win) win.opener = null;
      else setFallbackUrl(url); // pop-up blocked: let the user open it with one tap
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menyiapkan WhatsApp. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={variant === "link" ? "" : "flex flex-col gap-1.5"}>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className={
          variant === "link"
            ? "inline-flex items-center gap-1 text-xs font-semibold text-blue-800 hover:underline disabled:opacity-60"
            : "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
        }
      >
        {busy ? <Loader2 size={variant === "link" ? 12 : 16} className="animate-spin" /> : variant === "solid" && <MessageCircle size={16} />}
        {label}
      </button>
      {error && (
        <p role="alert" className="mt-1 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
      {fallbackUrl && (
        <a
          href={fallbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
        >
          <MessageCircle size={12} /> Buka WhatsApp
        </a>
      )}
    </div>
  );
}
