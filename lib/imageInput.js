export const MAX_IMAGE_VALUE_LENGTH = 2_000_000;

export function cleanImageValue(value, { optional = false } = {}) {
  const text = String(value || '').trim();
  if (!text && optional) return null;
  if (!text) throw new Error('Image required');
  if (text.length > MAX_IMAGE_VALUE_LENGTH) throw new Error('Image too large');
  const ok = text.startsWith('/') || text.startsWith('https://') || /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(text);
  if (!ok) throw new Error('Invalid image');
  return text;
}
