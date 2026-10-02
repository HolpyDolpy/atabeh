export function parseCarpetSizeMeters(value) {
  const raw = String(value || '').trim().toLowerCase().replace(/,/g, '.');
  const match = raw.match(/^(\d+(?:\.\d+)?)\s*(?:m|م)?\s*[x×*]\s*(\d+(?:\.\d+)?)\s*(?:m|م)?$/i);
  if (!match) return null;
  const width = Number(match[1]);
  const length = Number(match[2]);
  if (!Number.isFinite(width) || !Number.isFinite(length) || width <= 0 || length <= 0 || width > 20 || length > 50) return null;
  const area = Math.round(width * length * 10000) / 10000;
  return { width, length, area };
}

export function roundToNearestFive(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.round(n / 5) * 5;
}

export function formatShekel(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0 ₪';
  return `${Math.round(n)} ₪`;
}

export function calculateCarpetPrice(size, pricePerSquareMeter) {
  const dimensions = parseCarpetSizeMeters(size);
  const rate = Number(pricePerSquareMeter);
  if (!dimensions || !Number.isFinite(rate) || rate < 0) return null;
  const exactTotal = dimensions.area * rate;
  const total = roundToNearestFive(exactTotal);
  return { ...dimensions, rate, exactTotal, total };
}
