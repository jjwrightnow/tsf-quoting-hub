const STORAGE_KEY = 'tsf_last_seen_by_quote';

function getMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function isQuoteUnread(quoteId: string, updatedAt: string): boolean {
  const map = getMap();
  const lastSeen = map[quoteId];
  if (!lastSeen) return true;
  return new Date(updatedAt) > new Date(lastSeen);
}

export function markQuoteSeen(quoteId: string): void {
  const map = getMap();
  map[quoteId] = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}
