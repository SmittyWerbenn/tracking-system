import { Camera, Upload } from "lucide-react";
import type { ChangeEvent } from "react";
import { MAX_PHOTO_SIZE_MB } from "../utils/compressImage";

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
  sm: "h-[34px]",
  md: "h-[38px]",
};

/** Two stacked triggers (camera capture + plain file picker) in roughly the
 * footprint a single square dashed upload box used to take up - so picking a
 * photo never forces the camera open when the user actually wanted to choose
 * an existing file. */
export function PhotoPickerBox({ onChange, capture = "environment", multiple, size = "md" }: PhotoPickerBoxProps) {
  const btnBase =
    "flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 px-1 text-center text-[10px] font-medium leading-tight text-slate-400 hover:border-blue-400 hover:text-blue-500";

  return (
    <div className={`flex shrink-0 flex-col gap-1 ${WRAP_CLASS[size]}`}>
      <label className={`${btnBase} ${BTN_CLASS[size]}`}>
        <Camera size={14} className="shrink-0" />
        Kamera
        <input type="file" accept="image/*" capture={capture} className="hidden" onChange={onChange} />
      </label>
      <label className={`${btnBase} ${BTN_CLASS[size]}`}>
        <Upload size={14} className="shrink-0" />
        Upload Foto
        <input type="file" accept="image/*" multiple={multiple} className="hidden" onChange={onChange} />
      </label>
      <p className="text-center text-[9px] leading-tight text-slate-400">Maks {MAX_PHOTO_SIZE_MB}MB</p>
    </div>
  );
}
