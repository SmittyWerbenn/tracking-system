/** Privacy masking for PUBLIC tracking only: every word keeps its first character, the rest becomes "*".
 * Whitespace (incl. repeated spaces) and hyphens are kept as separators, so "John-Paul" -> "J***-P***"
 * and "Budi Santoso" -> "B*** S*******". Done on code points, so non-ASCII names are not split mid-character.
 * null/empty -> "" (callers show their own empty state). */
export function maskName(name: unknown): string {
  if (typeof name !== "string") return "";
  const trimmed = name.trim();
  if (!trimmed) return "";
  return trimmed.replace(/[^\s-]+/gu, (word) => {
    const chars = Array.from(word);
    return chars[0] + "*".repeat(chars.length - 1);
  });
}
