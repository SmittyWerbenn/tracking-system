/** LTL-only switches that turn on the optional tracking stages (PACKING_*, TRANSIT_HUB). Insurance has its own section. */
export function LtlHandlingFields({
  packingKayu,
  hasTransit,
  onChange,
}: {
  packingKayu: boolean;
  hasTransit: boolean;
  onChange: (key: "packingKayu" | "hasTransit", value: boolean) => void;
}) {
  const row = (key: "packingKayu" | "hasTransit", checked: boolean, title: string, hint: string) => (
    <label className="flex cursor-pointer items-start gap-2.5">
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600"
        checked={checked}
        onChange={(e) => onChange(key, e.target.checked)}
      />
      <span className="text-sm text-slate-700">
        <span className="font-medium">{title}</span>
        <span className="block text-xs text-slate-500">{hint}</span>
      </span>
    </label>
  );
  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Penanganan LTL</p>
      {row("packingKayu", packingKayu, "Packing Kayu", "Cargo butuh packing kayu: tahap Packing Required / Completed ikut muncul di tracking.")}
      {row("hasTransit", hasTransit, "Rute melewati Transit Hub", "Aktifkan tahap Transit Hub. Tanpa ini rute dianggap direct (In Transit langsung ke Destination Hub).")}
    </div>
  );
}
