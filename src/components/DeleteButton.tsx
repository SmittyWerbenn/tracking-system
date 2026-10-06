import { actionClass } from "./ActionButton";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../store/AuthContext";
import { moveToRecycleBin, type RecycleEntity } from "../utils/recycle";
import { ImpactList, useImpact } from "./ImpactList";
import { ReasonModal } from "./ReasonModal";
import { useToast } from "./Toast";

/** True only for Superadmin. The API re-checks; this just keeps the UI honest. */
export function useIsSuperadmin(): boolean {
  const { profile } = useAuth();
  return profile?.role === "Superadmin";
}

interface Props {
  entityType: RecycleEntity;
  id: string;
  /** Lines shown in the confirmation ("Nama: Budi", ...). */
  details: Array<[string, string]>;
  onDone: () => void | Promise<void>;
  /** "icon" for dense table rows, "full" for a labelled button. */
  variant?: "icon" | "full";
}

/** "Hapus" action = move to Recycle Bin (soft delete), with a mandatory reason. Renders nothing for non-Superadmin. */
export function DeleteButton({ entityType, id, details, onDone }: Props) {
  const isSuperadmin = useIsSuperadmin();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  // What still points at this row (with examples); loaded when the dialog opens. Nothing listed is deleted with it.
  const impact = useImpact(entityType, id, open && isSuperadmin);
  if (!isSuperadmin) return null;

  return (
    <>
      <button
        type="button"
        title="Hapus (pindahkan ke Recycle Bin)"
        aria-label="Hapus"
        onClick={() => setOpen(true)}
        className={actionClass("danger")}
      >
        <Trash2 size={16} />
      </button>
      {open && (
        <ReasonModal
          title="Hapus Data?"
          reasonLabel="Alasan Penghapusan"
          placeholder="Contoh: Data duplicate / input salah / data testing"
          confirmLabel={impact && impact.length > 0 ? "Lanjutkan Hapus" : "Pindahkan ke Recycle Bin"}
          onClose={() => setOpen(false)}
          onConfirm={async (reason) => {
            await moveToRecycleBin(entityType, [id], reason);
            setOpen(false);
            toast("Data berhasil dipindahkan ke Recycle Bin.");
            await onDone();
          }}
        >
          <p>Anda akan memindahkan data berikut ke Recycle Bin:</p>
          <dl className="mt-2 space-y-1 rounded-lg bg-slate-50 p-3">
            {details.map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt className="w-20 shrink-0 text-xs text-slate-500">{k}</dt>
                <dd className="break-words text-sm font-medium text-slate-800">{v || "-"}</dd>
              </div>
            ))}
          </dl>
          {impact === null && <p className="mt-3 text-xs text-slate-400">Memeriksa keterkaitan data...</p>}
          {impact && impact.length > 0 && (
            <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900">
              <p className="font-semibold">⚠️ Peringatan: data ini masih terhubung dengan:</p>
              <ImpactList items={impact} className="mt-2" />
              <p className="mt-2 text-xs">Data terkait tidak akan ikut dihapus secara langsung.</p>
            </div>
          )}
          <p className="mt-3">
            Data akan disimpan di Recycle Bin selama 90 hari, lalu dihapus permanen otomatis oleh sistem. Selama itu data masih bisa dipulihkan.
          </p>
        </ReasonModal>
      )}
    </>
  );
}
