import type { Shipment } from "../types";

export interface SendEmailResult {
  ok: boolean;
  error?: string;
}

/**
 * Calls the local dev-server email API (see server/emailApiPlugin.ts), which
 * sends a real transactional email through Brevo SMTP. Only works while
 * running `npm run dev` or `npm run preview` — a static production deploy
 * (e.g. GitHub Pages) has no server to host this endpoint.
 */
export async function sendTrackingEmail(shipment: Shipment, trackingUrl: string): Promise<SendEmailResult> {
  try {
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: shipment.penerima.email,
        toName: shipment.penerima.nama,
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
