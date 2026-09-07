export function formatPrice(price: number, currency: string) {
  const rounded = Number.isInteger(price) ? price.toString() : price.toFixed(2);
  return `${currency}${rounded}`;
}

export function parseHours(hours: string | null) {
  if (!hours) return null;
  try {
    return JSON.parse(hours) as Partial<Record<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun', string>>;
  } catch {
    return null;
  }
}
