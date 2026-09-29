import { Building2, Mail, Package, User } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { api, ApiError } from "../../utils/apiClient";
import { formatTanggalPanjang } from "../../utils/format";

interface CustomerAccount {
  id: string;
  nama: string;
  email: string;
  aktif: boolean;
  createdAt: string;
}

interface CustomerRow {
  customerId: string;
  shipmentCount: number;
  accounts: CustomerAccount[];
}

function formatCreatedAt(iso: string): string {
  return formatTanggalPanjang(iso.slice(0, 10));
}

export default function CustomerList() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    api
      .get<{ items: CustomerRow[] }>("/api/customers")
      .then((res) => {
        if (!cancelled) setCustomers(res.items);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Gagal memuat data customer.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Master Data Customer</h1>
        <p className="mt-1 text-sm text-slate-500">
          Daftar Customer ID yang pernah dibuat lewat akun Cust-Admin di Manajemen User, beserta jumlah
          pengiriman yang tertaut ke masing-masing Customer ID.
        </p>
      </div>

      {error && (
        <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
      )}

      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-900" />
        </div>
      ) : customers.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white py-14 text-center text-sm text-slate-400">
          Belum ada Customer ID. Buat akun Cust-Admin lewat Manajemen User untuk menambahkan customer baru.
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((c) => (
            <div key={c.customerId} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                  <Building2 size={17} />
                </span>
                <span className="font-mono text-sm font-semibold text-slate-900">{c.customerId}</span>
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Package size={13} className="text-slate-400" />
                {c.shipmentCount} Pengiriman
              </div>

              <div className="mt-4 flex flex-col gap-2.5 border-t border-slate-100 pt-3.5">
                {c.accounts.map((a) => (
                  <div key={a.id} className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <User size={13} className="shrink-0 text-slate-400" />
                      <span className="text-sm font-medium text-slate-800">{a.nama}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                          a.aktif ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {a.aktif ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 pl-[19px] text-xs text-slate-500">
                      <Mail size={11} className="shrink-0 text-slate-400" />
                      {a.email}
                    </div>
                    <p className="pl-[19px] text-[11px] text-slate-400">
                      Dibuat {formatCreatedAt(a.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
