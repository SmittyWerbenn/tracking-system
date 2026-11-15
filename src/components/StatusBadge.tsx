import type { ShipmentStatus, TimelineEventType } from "../types";
import { useLanguage } from "../store/LanguageContext";
import { getStatusStyle } from "../utils/status";
import { statusLabel } from "../utils/trackingI18n";

interface StatusBadgeProps {
  status: ShipmentStatus | TimelineEventType;
  /** "lg" = the headline status under the AWB number on Detail Resi (screen and print). */
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const { language } = useLanguage();
  const style = getStatusStyle(status);
  const sizeClasses =
    size === "sm" ? "text-xs px-2 py-0.5 gap-1 font-medium"
    : size === "lg" ? "text-base px-4 py-1.5 gap-2 font-bold whitespace-nowrap"
    : "text-sm px-3 py-1 gap-1.5 font-medium";
  const dotClasses = size === "lg" ? "h-2.5 w-2.5" : "h-1.5 w-1.5";
  return (
    <span
      className={`inline-flex items-center rounded-full ring-1 ring-inset ${style.bg} ${style.text} ${style.ring} ${sizeClasses}`}
    >
      <span className={`${dotClasses} shrink-0 rounded-full ${style.dot}`} />
      {statusLabel(status, language)}
    </span>
  );
}
