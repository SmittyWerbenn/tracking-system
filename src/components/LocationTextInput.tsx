import { useLocationSuggest } from "../utils/useLocationSuggest";

interface LocationTextInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  /** What to suggest: Nama Area or city. Suggestions are searched server-side as the user types. */
  kind?: "kota" | "area";
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  className: string;
}

/** Free-text location input with native browser autocomplete suggestions
 * (via <datalist>) drawn from known transit points - lets the user type
 * any location instead of being forced to pick from a fixed dropdown. */
export function LocationTextInput({
  id,
  value,
  onChange,
  kind = "area",
  placeholder,
  required,
  maxLength,
  className,
}: LocationTextInputProps) {
  const listId = `${id}-suggestions`;
  const suggestions = useLocationSuggest(kind, value);
  return (
    <>
      <input
        list={listId}
        required={required}
        maxLength={maxLength}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
      />
      <datalist id={listId}>
        {suggestions.map((s) => (
          <option key={s.nama} value={s.nama} label={[s.jenis, s.provinsi].filter(Boolean).join(" - ") || undefined} />
        ))}
      </datalist>
    </>
  );
}
