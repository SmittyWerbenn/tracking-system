import type { ShipmentStatus, TimelineEventType } from "../types";
import { useLanguage } from "../store/LanguageContext";
import { getStatusStyle } from "../utils/status";
import { statusLabel } from "../utils/trackingI18n";

interface StatusBadgeProps {
  status: ShipmentStatus | TimelineEventType;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const { language } = useLanguage();
  const style = getStatusStyle(status);
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5 gap-1" : "text-sm px-3 py-1 gap-1.5";
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ring-1 ring-inset ${style.bg} ${style.text} ${style.ring} ${sizeClasses}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {statusLabel(status, language)}
    </span>
  );
}
