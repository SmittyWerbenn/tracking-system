import type { IncomingMessage, ServerResponse } from "node:http";
import nodemailer from "nodemailer";
import type { Connect, Plugin } from "vite";
import { buildEmailHtml } from "./emailTemplate.ts";

interface SendEmailBody {
  to?: string;
  toName?: string;
  awb?: string;
  kotaAsal?: string;
  kotaTujuan?: string;
  status?: string;
  tanggalDibuat?: string;
  trackingUrl?: string;
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, statusCode: number, body: unknown) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function createHandler(env: Record<string, string>): Connect.NextHandleFunction {
  const senderName = env.BREVO_SENDER_NAME || "PT Gangsar Mitra Sautama";

  return async (req, res) => {
    if (req.method !== "POST") {
      sendJson(res, 405, { ok: false, error: "Method not allowed" });
      return;
    }

    if (!env.BREVO_SMTP_HOST || !env.BREVO_SMTP_LOGIN || !env.BREVO_SMTP_KEY || !env.BREVO_SENDER_EMAIL) {
      sendJson(res, 500, {
        ok: false,
        error: "Konfigurasi SMTP belum lengkap di file .env (BREVO_SMTP_HOST/LOGIN/KEY/SENDER_EMAIL).",
      });
      return;
    }

    try {
      const raw = await readBody(req);
      const data = JSON.parse(raw || "{}") as SendEmailBody;

      if (!data.to || !data.awb || !data.trackingUrl) {
        sendJson(res, 400, { ok: false, error: "Data email tidak lengkap (to/awb/trackingUrl wajib diisi)." });
        return;
      }

      const transporter = nodemailer.createTransport({
        host: env.BREVO_SMTP_HOST,
        port: Number(env.BREVO_SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: env.BREVO_SMTP_LOGIN,
          pass: env.BREVO_SMTP_KEY,
        },
      });

      const html = buildEmailHtml({
        toName: data.toName,
        awb: data.awb,
        kotaAsal: data.kotaAsal ?? "-",
        kotaTujuan: data.kotaTujuan ?? "-",
        status: data.status ?? "Dalam Proses",
        tanggalDibuat: data.tanggalDibuat ?? new Date().toISOString().slice(0, 10),
        trackingUrl: data.trackingUrl,
        senderName,
      });

      await transporter.sendMail({
        from: `"${senderName}" <${env.BREVO_SENDER_EMAIL}>`,
        to: data.toName ? `"${data.toName}" <${data.to}>` : data.to,
        subject: `Resi Pengiriman Anda - AWB ${data.awb}`,
        html,
      });

      sendJson(res, 200, { ok: true });
    } catch (err) {
      console.error("[email-api] gagal mengirim email:", err);
      sendJson(res, 500, {
        ok: false,
        error: err instanceof Error ? err.message : "Gagal mengirim email melalui SMTP.",
      });
    }
  };
}

/**
 * Dev-only email API. Adds POST /api/send-email backed by Brevo SMTP via
 * nodemailer. Credentials are read from process env (server-side only) and
 * never bundled into client code. Only active while running `vite dev` /
 * `vite preview` — a static production build has no server to host this.
 */
export function emailApiPlugin(env: Record<string, string>): Plugin {
  const handler = createHandler(env);
  return {
    name: "gms-email-api",
    configureServer(server) {
      server.middlewares.use("/api/send-email", handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api/send-email", handler);
    },
  };
}
