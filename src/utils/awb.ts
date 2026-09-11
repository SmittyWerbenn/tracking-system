/** Generate a unique AWB number in the format GMS-YYYYMMDD-NNNN */
export function generateAWB(existingAwbs: string[]): string {
  const today = new Date();
  const datePart = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(
    today.getDate(),
  ).padStart(2, "0")}`;
  const prefix = `GMS-${datePart}-`;

  const todaysNumbers = existingAwbs
    .filter((awb) => awb.startsWith(prefix))
    .map((awb) => Number(awb.slice(prefix.length)))
    .filter((n) => !Number.isNaN(n));

  const next = todaysNumbers.length > 0 ? Math.max(...todaysNumbers) + 1 : 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}
