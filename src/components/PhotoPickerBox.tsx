import { Camera, Upload } from "lucide-react";
import type { ChangeEvent } from "react";

interface PhotoPickerBoxProps {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  capture?: "user" | "environment";
  multiple?: boolean;
  size?: "sm" | "md";
}

const WRAP_CLASS: Record<NonNullable<PhotoPickerBoxProps["size"]>, string> = {
  sm: "w-20",
  md: "w-24",
};

const BTN_CLASS: Record<NonNullable<PhotoPickerBoxProps["size"]>, string> = {
  sm: "h-[38px]",
  md: "h-[46px]",
};

/** Two stacked triggers (camera capture + plain file picker) in the same
 * footprint a single square dashed upload box used to take up - so picking a
 * photo never forces the camera open when the user actually wanted to choose
 * an existing file. */
export function PhotoPickerBox({ onChange, capture = "environment", multiple, size = "md" }: PhotoPickerBoxProps) {
  const btnBase =
    "flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-[10px] font-medium text-slate-400 hover:border-blue-400 hover:text-blue-500";

  return (
    <div className={`flex shrink-0 flex-col gap-1 ${WRAP_CLASS[size]}`}>
      <label className={`${btnBase} ${BTN_CLASS[size]}`}>
        <Camera size={14} />
        Kamera
        <input type="file" accept="image/*" capture={capture} className="hidden" onChange={onChange} />
      </label>
      <label className={`${btnBase} ${BTN_CLASS[size]}`}>
        <Upload size={14} />
        File
        <input type="file" accept="image/*" multiple={multiple} className="hidden" onChange={onChange} />
      </label>
    </div>
  );
}
