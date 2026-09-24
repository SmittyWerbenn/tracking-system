import type { PersonInfo, Shipment } from "../types";

/** The subset of a Shipment this module actually needs - lets callers pass
 * a freshly-created shipment before its full server-hydrated record (with
 * timeline, truck snapshot, etc.) has been fetched back. */
export interface EmailableShipment {
  awb: string;
  kotaAsal: string;
  kotaTujuan: string;
  status: Shipment["status"];
  tanggalDibuat: string;
  pengirim: PersonInfo;
  penerima: PersonInfo;
}

export interface SendEmailResult {
  ok: boolean;
  error?: string;
}

export type EmailRecipientRole = "penerima" | "pengirim";

// Production email endpoint: a Cloudflare Worker (see cloudflare-worker/)
// that speaks real SMTP to Brevo via TCP sockets, since a static host like
// GitHub Pages can't run server code itself.
const WORKER_EMAIL_ENDPOINT = "https://gms-email-api.indotrans-tracking.workers.dev/send-email";

function isLocalDev(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

/**
 * Local dev (`npm run dev` / `npm run preview`) uses the Vite dev-server
 * route (see server/emailApiPlugin.ts) so no network hop is needed; any
 * other host (GitHub Pages, a custom domain pointed at it, etc.) calls the
 * deployed Cloudflare Worker instead, which holds the same Brevo SMTP
 * credentials as server-side secrets.
 */
function emailEndpoint(): string {
  return isLocalDev() ? "/api/send-email" : WORKER_EMAIL_ENDPOINT;
}

/**
 * Sends the resi/tracking notification email. `recipient` selects whether
 * it goes to the penerima (default) or the pengirim.
 */
export async function sendTrackingEmail(
  shipment: EmailableShipment,
  trackingUrl: string,
  recipient: EmailRecipientRole = "penerima",
): Promise<SendEmailResult> {
  const person = shipment[recipient];

  try {
    const res = await fetch(emailEndpoint(), {
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
