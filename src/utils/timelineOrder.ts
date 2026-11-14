/** Tracking history, newest first: ordered by the event's own date/time (which may be backdated), never by input order.
 * Row 0 of the result is the "TERBARU" log. Ties within the same minute keep the later-entered log on top
 * (the API sends events oldest first, input order breaking ties). */
export function newestFirst<T extends { tanggal: string; jam: string }>(events: readonly T[]): T[] {
  return events
    .map((event, index) => ({ event, index, key: `${event.tanggal}T${event.jam}` }))
    .sort((a, b) => (a.key < b.key ? 1 : a.key > b.key ? -1 : b.index - a.index))
    .map((x) => x.event);
}
