import { Building2 } from "lucide-react";
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
        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Customer ID</th>
                  <th className="px-4 py-3 font-medium">Nama Akun</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Status Akun</th>
                  <th className="px-4 py-3 font-medium">Dibuat</th>
                  <th className="px-4 py-3 font-medium">Jumlah Pengiriman</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) =>
                  c.accounts.map((a, i) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      {i === 0 && (
                        <td
                          rowSpan={c.accounts.length}
                          className="whitespace-nowrap border-r border-slate-100 px-4 py-3 align-top"
                        >
                          <span className="flex items-center gap-1.5 font-mono font-semibold text-slate-900">
                            <Building2 size={14} className="text-teal-600" />
                            {c.customerId}
                          </span>
                        </td>
                      )}
                      <td className="px-4 py-3 text-slate-800">{a.nama}</td>
                      <td className="px-4 py-3 text-slate-600">{a.email}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            a.aktif ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {a.aktif ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                        {formatCreatedAt(a.createdAt)}
                      </td>
                      {i === 0 && (
                        <td rowSpan={c.accounts.length} className="whitespace-nowrap px-4 py-3 align-top text-slate-600">
                          {c.shipmentCount}
                        </td>
                      )}
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
