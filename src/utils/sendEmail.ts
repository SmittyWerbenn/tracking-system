import type { Shipment } from "../types";

export interface SendEmailResult {
  ok: boolean;
  error?: string;
}

export type EmailRecipientRole = "penerima" | "pengirim";

/**
 * True only when the app is likely being served by our own Vite dev/preview
 * server (see server/emailApiPlugin.ts), which is the only place the
 * POST /api/send-email route actually exists. A static deploy (GitHub Pages,
 * a custom domain pointed at it, etc.) has no server behind it, so calling
 * the endpoint there would just 404/405 against the static host.
 */
function hasEmailApi(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

const NO_BACKEND_MESSAGE =
  "Fitur kirim email otomatis hanya aktif saat aplikasi dijalankan secara lokal (npm run dev). " +
  "Versi yang di-hosting sebagai situs statis (mis. GitHub Pages) belum memiliki server untuk " +
  "benar-benar mengirim email SMTP - ini keterbatasan arsitektur prototype, bukan kesalahan data.";

/**
 * Calls the local dev-server email API (see server/emailApiPlugin.ts), which
 * sends a real transactional email through Brevo SMTP. Only works while
 * running `npm run dev` or `npm run preview` - a static production deploy
 * (e.g. GitHub Pages, or a custom domain pointed at it) has no server to
 * host this endpoint.
 *
 * `recipient` selects whether the resi notification (with tracking link) is
 * sent to the penerima (default) or the pengirim.
 */
export async function sendTrackingEmail(
  shipment: Shipment,
  trackingUrl: string,
  recipient: EmailRecipientRole = "penerima",
): Promise<SendEmailResult> {
  if (!hasEmailApi()) {
    return { ok: false, error: NO_BACKEND_MESSAGE };
  }

  const person = shipment[recipient];

  try {
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: person.email,
        toName: person.nama,
        recipientRole: recipient,
        awb: shipment.awb,
        kotaAsal: shipment.kotaAsal,
        kotaTujuan: shipment.kotaTujuan,
        status: shipment.status,
        tanggalDibuat: shipment.tanggalDibuat,
        trackingUrl,
      }),
    });

    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };

    if (!res.ok || !data.ok) {
      if (res.status === 404 || res.status === 405) {
        return { ok: false, error: NO_BACKEND_MESSAGE };
      }
      return { ok: false, error: data.error ?? `Gagal mengirim email (status ${res.status}).` };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? `Tidak dapat terhubung ke server email: ${err.message}`
          : "Tidak dapat terhubung ke server email.",
    };
  }
}
