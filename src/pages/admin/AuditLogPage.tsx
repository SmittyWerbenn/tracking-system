import { History } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { useAuditLog } from "../../store/AuditLogContext";
import type { AuditAction } from "../../types";
import { formatTanggalPanjang } from "../../utils/format";

const inputClass =
  "rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

function formatTimestamp(iso: string): string {
  return `${formatTanggalPanjang(iso.slice(0, 10))}, ${iso.slice(11, 16)} WIB`;
}

const ACTION_STYLE: Record<AuditAction, string> = {
  CREATE_AWB: "bg-blue-100 text-blue-700",
  UPDATE_STATUS: "bg-sky-100 text-sky-700",
  UPDATE_TRUCK: "bg-violet-100 text-violet-700",
  TRANSFER_TRUCK: "bg-violet-100 text-violet-700",
  ADD_ISSUE: "bg-red-100 text-red-700",
  UPLOAD_POD: "bg-teal-100 text-teal-700",
  CLOSE_SHIPMENT: "bg-emerald-100 text-emerald-700",
  SEND_NOTIFICATION: "bg-amber-100 text-amber-700",
  CREATE_TRUCK: "bg-blue-100 text-blue-700",
  UPDATE_TRUCK_MASTER: "bg-violet-100 text-violet-700",
  CREATE_LOCATION: "bg-blue-100 text-blue-700",
  UPDATE_LOCATION: "bg-violet-100 text-violet-700",
  CREATE_USER: "bg-blue-100 text-blue-700",
  UPDATE_USER: "bg-violet-100 text-violet-700",
};

export default function AuditLogPage() {
  const { entries } = useAuditLog();

  const [userFilter, setUserFilter] = useState("Semua");
  const [actionFilter, setActionFilter] = useState("Semua");
  const [moduleFilter, setModuleFilter] = useState("Semua");
  const [awbQuery, setAwbQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const users = useMemo(() => Array.from(new Set(entries.map((e) => e.userName))).sort(), [entries]);
  const modules = useMemo(() => Array.from(new Set(entries.map((e) => e.module))).sort(), [entries]);
  const actions = useMemo(() => Array.from(new Set(entries.map((e) => e.action))).sort(), [entries]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (userFilter !== "Semua" && e.userName !== userFilter) return false;
      if (actionFilter !== "Semua" && e.action !== actionFilter) return false;
      if (moduleFilter !== "Semua" && e.module !== moduleFilter) return false;
      if (awbQuery && !e.awb?.toLowerCase().includes(awbQuery.toLowerCase())) return false;
      const date = e.timestamp.slice(0, 10);
      if (dateFrom && date < dateFrom) return false;
      if (dateTo && date > dateTo) return false;
      return true;
    });
  }, [entries, userFilter, actionFilter, moduleFilter, awbQuery, dateFrom, dateTo]);

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Audit Log</h1>
        <p className="mt-1 text-sm text-slate-500">Riwayat siapa mengubah apa dan kapan.</p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className={inputClass}>
          <option value="Semua">Semua User</option>
          {users.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className={inputClass}>
          <option value="Semua">Semua Action</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {a.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className={inputClass}>
          <option value="Semua">Semua Module</option>
          {modules.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          value={awbQuery}
          onChange={(e) => setAwbQuery(e.target.value)}
          placeholder="Cari AWB..."
          className={inputClass}
        />
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inputClass} />
          <span>-</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={inputClass} />
        </div>
        {(userFilter !== "Semua" || actionFilter !== "Semua" || moduleFilter !== "Semua" || awbQuery || dateFrom || dateTo) && (
          <button
            onClick={() => {
              setUserFilter("Semua");
              setActionFilter("Semua");
              setModuleFilter("Semua");
              setAwbQuery("");
              setDateFrom("");
              setDateTo("");
            }}
            className="text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            Reset
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {filtered.map((e) => (
          <div key={e.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <History size={13} />
                {formatTimestamp(e.timestamp)}
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${ACTION_STYLE[e.action]}`}>
                {e.actionLabel}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium text-slate-800">{e.userName}</span>
              <span className="text-xs text-slate-400">({e.role})</span>
              <span className="text-slate-300">-</span>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{e.module}</span>
              {e.awb && (
                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-600">{e.awb}</span>
              )}
            </div>
            <p className="mt-1.5 text-sm text-slate-600">{e.description}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
            Tidak ada log yang cocok dengan filter.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
