import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../store/AuthContext";
import { moveToRecycleBin, type RecycleEntity } from "../utils/recycle";
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
export function DeleteButton({ entityType, id, details, onDone, variant = "icon" }: Props) {
  const isSuperadmin = useIsSuperadmin();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  if (!isSuperadmin) return null;

  return (
    <>
      <button
        type="button"
        title="Hapus (pindahkan ke Recycle Bin)"
        onClick={() => setOpen(true)}
        className={
          variant === "icon"
            ? "inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
            : "inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
        }
      >
        <Trash2 size={15} /> Hapus
      </button>
      {open && (
        <ReasonModal
          title="Hapus Data?"
          reasonLabel="Alasan Penghapusan"
          placeholder="Contoh: Data duplicate / input salah / data testing"
          confirmLabel="Pindahkan ke Recycle Bin"
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
          <p className="mt-3">Data akan disimpan di Recycle Bin selama 30 hari sebelum dihapus permanen.</p>
        </ReasonModal>
      )}
    </>
  );
}
