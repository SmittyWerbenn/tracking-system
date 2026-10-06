/** Privacy masking for PUBLIC tracking only: every word keeps its first AND last character, the middle becomes "*"
 * ("Budi Santoso" -> "B**i S*****o"). Words of 1 character stay as is; words of 2 characters keep the first one
 * and mask the second ("Al" -> "A*") so a short name is never shown in full. Whitespace (incl. repeated spaces) and
 * hyphens are kept as separators ("John-Paul" -> "J**n-P**l"). Works on code points, so non-ASCII names are not
 * split mid-character. null/empty -> "" (callers show their own empty state). */
export function maskName(name: unknown): string {
  if (typeof name !== "string") return "";
  const trimmed = name.trim();
  if (!trimmed) return "";
  return trimmed.replace(/[^\s-]+/gu, (word) => {
    const c = Array.from(word);
    if (c.length === 1) return c[0];
    if (c.length === 2) return c[0] + "*";
    return c[0] + "*".repeat(c.length - 2) + c[c.length - 1];
  });
}
