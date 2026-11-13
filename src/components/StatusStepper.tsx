import { AlertTriangle, Check, ClipboardCheck, MapPin, Navigation, PackageCheck, PackageOpen, Truck, Warehouse, FileCheck } from "lucide-react";
import { useLanguage } from "../store/LanguageContext";
import type { ShipmentStatus } from "../types";
import { LTL_DELIVERED_INDEX, LTL_STAGES } from "../utils/ltlPipeline";

const STEP_ICONS = [ClipboardCheck, PackageOpen, PackageCheck, Truck, Navigation, Check];

/** `index` is the step currently in progress (all earlier steps are done). Steps:
 * 0 Order Dibuat, 1 Di Pickup, 2 Berangkat, 3 Dalam Pengiriman, 4 Sedang Diantar, 5 Terkirim.
 * Shipments that never logged a "Di pickup" event keep working: anything from Berangkat onward
 * jumps straight to its step, and only a still-"Dalam Persiapan" shipment depends on `hasPickup`. */
function getProgress(status: ShipmentStatus, hasPickup: boolean): { index: number; hasKendala: boolean } {
  switch (status) {
    case "Dalam Persiapan":
    case "Hold":
      return { index: hasPickup ? 2 : 1, hasKendala: false };
    case "Berangkat":
    case "Transit":
    case "Dalam Perjalanan":
    case "Re-route":
    case "Penarikan":
      return { index: 3, hasKendala: false };
    case "Kendala":
      return { index: 3, hasKendala: true };
    case "Tiba di Tujuan":
      return { index: 4, hasKendala: false };
    case "Selesai / Terkirim":
      return { index: 5, hasKendala: false };
    default:
      return { index: 0, hasKendala: false };
  }
}

/** LTL: one step per pipeline status (9, ending at POD Kembali). `ltlIndex` is the status of the newest log - the top row of the timeline -
 * so the stepper and the history always point at the same status (-1 = nothing yet). */
function getLtlProgress(status: ShipmentStatus, ltlIndex: number): { index: number; hasKendala: boolean } {
  return { index: Math.max(0, ltlIndex), hasKendala: status === "Kendala" };
}

/** Order Dibuat, Di-Pickup, Tiba di Gudang Asal, Berangkat, Dalam Perjalanan, Tiba di Gudang Tujuan, Sedang Diantar, Terkirim, POD Kembali. */
const LTL_ICONS = [ClipboardCheck, PackageOpen, Warehouse, Truck, Navigation, PackageCheck, MapPin, Check, FileCheck];

export function StatusStepper({ status, hasPickup = false, ltlIndex }: { status: ShipmentStatus; hasPickup?: boolean; ltlIndex?: number }) {
  const { t } = useLanguage();
  const isLtl = ltlIndex !== undefined;
  const { index: current, hasKendala } = isLtl ? getLtlProgress(status, ltlIndex) : getProgress(status, hasPickup);
  const STEPS = isLtl
    ? LTL_STAGES.map((st, i) => ({ label: st.label, icon: LTL_ICONS[i] }))
    : [
    { label: t.stepper.orderCreated, icon: STEP_ICONS[0] },
    { label: t.stepper.pickedUp, icon: STEP_ICONS[1] },
    { label: t.stepper.departed, icon: STEP_ICONS[2] },
    { label: t.stepper.inTransit, icon: STEP_ICONS[3] },
    { label: t.stepper.outForDelivery, icon: STEP_ICONS[4] },
    { label: t.stepper.delivered, icon: STEP_ICONS[5] },
  ];

  // 9 steps (LTL) need tighter circles and labels to fit a phone screen.
  const dense = STEPS.length > 6;

  return (
    <div>
      {hasKendala && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
          <AlertTriangle size={16} className="shrink-0" />
          {t.stepper.kendalaWarning}
        </div>
      )}
      <ol className="flex items-start">
        {STEPS.map((step, i) => {
          const isLast = i === STEPS.length - 1;
          // Reaching the final step IS completion, not "in progress toward
          // it" - treat it as done (emerald + check) rather than the
          // in-progress blue used for earlier current steps.
          // LTL: Terkirim is complete the moment it is reached too; only POD Kembali is still ahead.
          const isDelivered = i === current && (isLast || (isLtl && i === LTL_DELIVERED_INDEX)) && !hasKendala;
          const done = i < current || isDelivered;
          const isCurrent = i === current && !isDelivered;
          const Icon = step.icon;
          return (
            <li key={i} className="flex flex-1 flex-col items-center last:flex-none">
              <div className="relative flex w-full items-center">
                <div
                  className={`absolute left-0 top-1/2 h-0.5 w-1/2 -translate-y-1/2 ${
                    i === 0 ? "invisible" : done ? "bg-emerald-500" : isCurrent ? "bg-blue-800" : "bg-slate-200"
                  }`}
                />
                <div
                  className={`absolute right-0 top-1/2 h-0.5 w-1/2 -translate-y-1/2 ${
                    isLast ? "invisible" : done ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
                <span className={`relative z-10 mx-auto flex shrink-0 sm:h-10 sm:w-10 ${dense ? "h-7 w-7" : "h-9 w-9"}`}>
                  {(isCurrent || isDelivered) && (
                    <span
                      className={`absolute inset-0 animate-ping rounded-full opacity-75 ${
                        hasKendala ? "bg-red-400" : isDelivered ? "bg-emerald-400" : "bg-blue-500"
                      }`}
                    />
                  )}
                  <span
                    className={`relative flex shrink-0 items-center justify-center rounded-full ring-4 ring-white sm:h-10 sm:w-10 ${dense ? "h-7 w-7" : "h-9 w-9"} ${
                      isCurrent && hasKendala
                        ? "bg-red-500 text-white"
                        : done
                          ? "bg-emerald-500 text-white"
                          : isCurrent
                            ? "bg-blue-800 text-white"
                            : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isCurrent && hasKendala ? (
                      <AlertTriangle size={16} />
                    ) : done ? (
                      <Check size={16} />
                    ) : (
                      <Icon size={16} />
                    )}
                  </span>
                </span>
              </div>
              <p
                className={`mt-2 text-center font-medium leading-tight sm:max-w-none sm:px-1 sm:text-xs ${dense ? "max-w-[38px] text-[8px]" : "max-w-[56px] text-[10px]"} ${
                  done || isCurrent ? "text-slate-800" : "text-slate-400"
                }`}
              >
                {step.label}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
