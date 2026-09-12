import { AlertTriangle, Bell, CheckCircle2, Mail, PackagePlus } from "lucide-react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { useNotifications } from "../../store/NotificationContext";
import type { NotificationTrigger } from "../../types";
import { formatTanggalPanjang } from "../../utils/format";

const TRIGGER_META: Record<NotificationTrigger, { icon: typeof Bell; style: string; label: string }> = {
  AWB_CREATED: { icon: PackagePlus, style: "bg-blue-100 text-blue-700", label: "Resi Diterbitkan" },
  KENDALA: { icon: AlertTriangle, style: "bg-red-100 text-red-700", label: "Kendala" },
  SELESAI: { icon: CheckCircle2, style: "bg-emerald-100 text-emerald-700", label: "Selesai" },
};

function formatTimestamp(iso: string): string {
  return `${formatTanggalPanjang(iso.slice(0, 10))}, ${iso.slice(11, 16)} WIB`;
}

export default function NotificationCenter() {
  const { notifications } = useNotifications();

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Notification Center</h1>
        <p className="mt-1 text-sm text-slate-500">
          Notifikasi customer yang dibuat sistem (resi terbit, kendala, dan pengiriman selesai).
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {notifications.map((n) => {
          const meta = TRIGGER_META[n.trigger];
          return (
            <div key={n.id} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.style}`}>
                <meta.icon size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{n.subject}</p>
                  <span className="text-xs text-slate-400">{formatTimestamp(n.createdAt)}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Kepada: <span className="font-medium text-slate-700">{n.toName}</span> ({n.toEmail}) - AWB{" "}
                  <span className="font-mono">{n.awb}</span>
                </p>
                <Link
                  to={`/admin/resi/${n.awb}/email`}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-800 hover:underline"
                >
                  <Mail size={13} /> Buka Email Preview
                </Link>
              </div>
            </div>
          );
        })}
        {notifications.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
            Belum ada notifikasi.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
